// Load environment variables
require('dotenv').config();
const http = require('http');
const connectDB = require('./config/db');
const mainRouter = require('./routes/index.routes');
const express = require('express');
const path = require('path');
const { Server } = require('socket.io');
const fs = require('fs');
const Category = require('./models/category.model'); // Import Category model for seeding

// Import middleware
const { errorHandler } = require('./middlewares/error.middleware');
const loggerMiddleware = require('./middlewares/logger.middleware');
const { corsConfig } = require('./middlewares/cors.middleware');
const { notFound } = require('./middlewares/notFound.middleware');
const { rateLimiter } = require('./middlewares/rateLimit.middleware');

// Validate critical environment variables
const requiredEnvVars = ['PORT', 'FRONTEND_URL', 'MONGODB_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}. Please check your .env file.`);
  process.exit(1);
}

// Initialize Express app
const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.IO

// Middleware setup
app.use(loggerMiddleware); // Attach logger middleware using app.use()
app.use(corsConfig); // Enable CORS
app.use(express.json()); // Parse JSON requests
app.use(rateLimiter); // Rate limiting

// Serve static files (e.g., uploaded images)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir); // Create uploads folder if it doesn't exist
}
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res) => {
    res.set('X-Content-Type-Options', 'nosniff'); // Prevent MIME type sniffing
  },
}));

// Routes
app.use('/api/v1', mainRouter); // Use consistent API versioning

// Handle undefined routes
app.use(notFound);

// Centralized error handling
app.use(errorHandler);

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*', // Allow specific frontend URL or all (*)
    methods: ['GET', 'POST'],
  },
});

// Attach Socket.IO instance to the app
app.set('io', io);

// Socket.IO logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a conversation room
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation: ${conversationId}`);
  });

  // Send a message
  socket.on('sendMessage', async ({ conversationId, senderId, content }) => {
    try {
      // Basic validation (Zod validation handled in schema directory)
      if (!conversationId || !senderId || !content) {
        return socket.emit('errorMessage', 'Invalid message data.');
      }

      // Save the message to the database
      const Message = require('./models/message.model');
      const newMessage = new Message({
        conversation: conversationId,
        sender: senderId,
        content,
      });
      await newMessage.save();

      // Broadcast the message to all participants in the conversation
      io.to(conversationId).emit('receiveMessage', newMessage);
    } catch (error) {
      console.error('Error saving message:', error.message);
      socket.emit('errorMessage', 'Failed to send message.');
    }
  });

  // Join user's personal room for notifications
  socket.on('joinUserRoom', (userId) => {
    socket.join(userId); // Join a room named after the user's ID
    console.log(`User joined personal room: ${userId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Seed categories after DB connection
const seedCategories = async () => {
  try {
    const predefinedCategories = [
      { name: 'Electronics', description: 'Devices and gadgets', isPredefined: true },
      { name: 'Clothing', description: 'Apparel and accessories', isPredefined: true },
      { name: 'Books', description: 'Textbooks and novels', isPredefined: true },
      { name: 'Personal Items', description: 'Wallets, keys, etc.', isPredefined: true },
      { name: 'Stationery', description: 'Pens, notebooks, etc.', isPredefined: true },
    ];

    const existingCategories = await Category.find({ name: { $in: predefinedCategories.map(c => c.name) } });
    const existingNames = existingCategories.map(c => c.name);

    const categoriesToInsert = predefinedCategories.filter(c => !existingNames.includes(c.name));
    if (categoriesToInsert.length > 0) {
      await Category.insertMany(categoriesToInsert);
      console.log('Categories seeded successfully');
    } else {
      console.log('No new categories to seed');
    }
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start server after connecting to the database
const startServer = async () => {
  try {
    await connectDB(); // Ensure database is connected first

    // Seed categories after connection is established
    await seedCategories();

    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();