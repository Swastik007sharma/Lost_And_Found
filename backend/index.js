require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const connectDB = require('./config/db');
const mainRouter = require('./routes/index.routes');
const express = require('express');
const seed = require('./utils/seedCategory');
const initSocket = require('./utils/socket');
const swaggerui = require('swagger-ui-express')
const swaggerjsdocs = require('swagger-jsdoc')

const { errorHandler } = require('./middlewares/error.middleware');
const loggerMiddleware = require('./middlewares/logger.middleware');
const { corsConfig } = require('./middlewares/cors.middleware');
const { notFound } = require('./middlewares/notFound.middleware');
const { generalLimiter } = require('./middlewares/rateLimit.middleware');

// Ensure logs directory exists
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const requiredEnvVars = ['PORT', 'FRONTEND_URL', 'MONGODB_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}. Please check your .env file.`);
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

app.use(loggerMiddleware);
app.use(corsConfig);
app.use(express.json());
app.use(generalLimiter); // Global rate limiting with environment variable support

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use(
  '/uploads',
  express.static(uploadsDir, {
    setHeaders: (res) => {
      res.set('X-Content-Type-Options', 'nosniff');
    },
  })
);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', websocket: 'supported' });
});

app.get('/ws-test', (req, res) => {
  res.setHeader('Connection', 'Upgrade');
  res.setHeader('Upgrade', 'websocket');
  res.status(426).end('Upgrade Required');
});

app.use('/api/v1', mainRouter);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CampusTrack API',
      version: '1.0.0',
      description: 'REST API documentation for CampusTrack system',
      contact: {
        name: 'CampusTrack Support',
        email: 'support@campustrack.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api/v1`,
        description: 'Local development server',
      },
      {
        url: 'https://campustrack.example.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
        },
        NotFoundError: {
          description: 'Resource not found',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/**/*.js'], // Include all route files
};

const specs = swaggerjsdocs(options);
app.use('/api-docs', swaggerui.serve, swaggerui.setup(specs));


app.use(notFound);
app.use(errorHandler);

const io = initSocket(server);
app.set('io', io);

const shutdown = () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const startServer = async () => {
  try {
    await connectDB();
    await seed(); //Seeds Category and subCategory data

    // Start cleanup scheduler for automatic deletion
    const { startScheduler } = require('./services/scheduler');
    startScheduler();

    server.on('error', (err) => {
      console.error('Server error:', err.message);
    });
    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();