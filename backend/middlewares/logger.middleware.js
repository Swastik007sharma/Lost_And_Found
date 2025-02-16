const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create a write stream for logs
const logStream = fs.createWriteStream(path.join(__dirname, '../logs/access.log'), { flags: 'a' });

// Middleware to log HTTP requests
exports.logger = morgan('combined', { stream: logStream });