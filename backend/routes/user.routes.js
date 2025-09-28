const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');
const { validate } = require('../middlewares/validate.middleware');
const { updateUserSchema, updatePasswordSchema } = require('../schema/user.schema');
const { idSchema } = require('../schema/common.schema.js');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and account management
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found or inactive
 *       500:
 *         description: Server error
 */
router.get('/me', authMiddleware.authenticate, userController.getProfile);

/**
 * @swagger
 * /users/me/items:
 *   get:
 *     summary: Get items posted or claimed by the current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Items fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Item'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       404:
 *         description: User not found or inactive
 *       500:
 *         description: Server error
 */
router.get('/me/items', authMiddleware.authenticate, userController.getItems);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update current user's profile (name, email)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Profile data to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found or inactive
 *       500:
 *         description: Server error
 */
router.put('/me', authMiddleware.authenticate, validate(updateUserSchema), userController.updateProfile);

/**
 * @swagger
 * /users/me/password:
 *   put:
 *     summary: Update current user's password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Current and new password
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePassword'
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Current password is incorrect
 *       404:
 *         description: User not found or inactive
 *       500:
 *         description: Server error
 */
router.put('/me/password', authMiddleware.authenticate, validate(updatePasswordSchema), userController.updatePassword);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Deactivate (delete) current user's account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deactivated successfully
 *       404:
 *         description: User not found or already inactive
 *       500:
 *         description: Server error
 */
router.delete('/me', authMiddleware.authenticate, userController.deleteAccount);

module.exports = router;