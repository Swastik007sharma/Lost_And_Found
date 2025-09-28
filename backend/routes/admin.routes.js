const express = require("express");
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const adminController = require('../controllers/admin.controller');
const { validate } = require('../middlewares/validate.middleware');
const { idSchema } = require('../schema/common.schema.js');

router.get('/users', authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getAllUsers);
router.get('/users/:id', authMiddleware.authenticate, authMiddleware.isAdmin, validate(idSchema, 'params'), adminController.getUserById);
router.get('/users/:id/items', authMiddleware.authenticate, authMiddleware.isAdmin, validate(idSchema, 'params'), adminController.getUserItems);
router.delete('/users/:id', authMiddleware.authenticate, authMiddleware.isAdmin, validate(idSchema, 'params'), adminController.deleteUser);
router.put('/users/:id/activate', authMiddleware.authenticate, authMiddleware.isAdmin, validate(idSchema, 'params'), adminController.toggleUserActivation);

/**
 * @swagger
 * /admin/items:
 *   get:
 *     summary: Get all items
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, example: "createdAt" }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [asc, desc], example: "desc" }
 *     responses:
 *       200:
 *         description: Items fetched successfully
 */
router.get("/items", authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getAllItems);

/**
 * @swagger
 * /admin/items/{id}:
 *   get:
 *     summary: Get item by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Item fetched successfully
 *       404:
 *         description: Item not found
 */
router.get("/items/:id", authMiddleware.authenticate, authMiddleware.isAdmin, validate(idSchema, "params"), adminController.getItemById);

/**
 * @swagger
 * /admin/items/{id}:
 *   delete:
 *     summary: Deactivate an item
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Item deactivated successfully
 *       404:
 *         description: Item not found
 */
router.delete("/items/:id", authMiddleware.authenticate, authMiddleware.isAdmin, validate(idSchema, "params"), adminController.deleteItem);

/**
 * @swagger
 * /admin/items/{id}/activate:
 *   put:
 *     summary: Toggle item activation
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Item activated or deactivated successfully
 *       404:
 *         description: Item not found
 */
router.put("/items/:id/activate", authMiddleware.authenticate, authMiddleware.isAdmin, validate(idSchema, "params"), adminController.toggleItemActivation);

/**
 * @swagger
 * /admin/dashboard-stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats fetched successfully
 */
router.get("/dashboard-stats", authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getAdminDashboardStats);

/**
 * @swagger
 * /admin/conversations:
 *   get:
 *     summary: Get conversations and messages
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *     responses:
 *       200:
 *         description: Conversations and messages fetched successfully
 */
router.get("/conversations", authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getConversationsAndMessages);

module.exports = router;
