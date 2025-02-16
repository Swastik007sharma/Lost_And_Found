const multer = require('multer');
const path = require('path');

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in the "uploads" folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // Preserve the original file extension
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`); // Unique filename
  },
});

// Middleware to handle file uploads
exports.uploadFile = (req, res, next) => {
  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Unsupported file type. Only JPEG, PNG, and JPG files are allowed.'));
      }
      cb(null, true);
    },
  }).single('image'); // Field name for the uploaded file

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Handle Multer-specific errors (e.g., file size exceeded)
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // Handle other errors (e.g., unsupported file type)
      return res.status(400).json({ error: err.message });
    }

    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded or file is invalid.' });
    }

    next(); // Proceed to the next middleware/controller
  });
};