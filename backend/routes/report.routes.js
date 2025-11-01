const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};

// Generate comprehensive report (admin only)
// Query params: reportType (daily|weekly|monthly|yearly|custom), startDate (optional), endDate (optional)
router.get('/generate', authMiddleware.authenticate, isAdmin, reportController.generateReport);

// Get summary statistics
router.get('/summary', authMiddleware.authenticate, isAdmin, reportController.getReportSummary);

module.exports = router;
