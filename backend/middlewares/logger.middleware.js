const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

// Define the log file path
const logFilePath = process.env.LOG_FILE_PATH || '/tmp/access.log';

// Create a write stream for logging
const accessLogStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Set up morgan to log requests to the file
app.use(morgan('combined', { stream: accessLogStream }));

// Handle errors gracefully
accessLogStream.on('error', (err) => {
  console.error('Error writing to access log:', err.message);
});