const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validate.middleware');
const { registerUserSchema, loginSchema } = require('../schema/user.schema');

// Register a new user
router.post(
  '/register',
  validate(registerUserSchema), // Validate request body
  authController.register
);

// Authenticate a user
router.post(
  '/login',
  validate(loginSchema), // Validate request body
  authController.login
);

module.exports = router;