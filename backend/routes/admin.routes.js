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

// ========================
// Cleanup/Deletion Routes
// ========================

/**
 * @swagger
 * /admin/scheduled-deletions:
 *   get:
 *     summary: Get items scheduled for deletion
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Scheduled deletions fetched successfully
 */
router.get("/scheduled-deletions", authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getScheduledDeletions);

/**
 * @swagger
 * /admin/cancel-deletion/{id}:
 *   post:
 *     summary: Cancel scheduled deletion for an item
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
 *         description: Deletion cancelled successfully
 *       404:
 *         description: Item not found
 */
router.post("/cancel-deletion/:id", authMiddleware.authenticate, authMiddleware.isAdmin, validate(idSchema, "params"), adminController.cancelScheduledDeletion);

/**
 * @swagger
 * /admin/trigger-cleanup:
 *   post:
 *     summary: Manually trigger cleanup process (for testing)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cleanup executed successfully
 */
router.post("/trigger-cleanup", authMiddleware.authenticate, authMiddleware.isAdmin, adminController.triggerCleanup);

/**
 * @swagger
 * /admin/scheduled-user-deletions:
 *   get:
 *     summary: Get users scheduled for deletion
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Scheduled user deletions fetched successfully
 */
router.get("/scheduled-user-deletions", authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getScheduledUserDeletions);

/**
 * @swagger
 * /admin/cancel-user-deletion/{id}:
 *   post:
 *     summary: Cancel scheduled deletion for a user
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
 *         description: User deletion cancelled successfully
 *       404:
 *         description: User not found
 */
router.post("/cancel-user-deletion/:id", authMiddleware.authenticate, authMiddleware.isAdmin, validate(idSchema, "params"), adminController.cancelScheduledUserDeletion);

/**
 * @swagger
 * /admin/cleanup-config:
 *   get:
 *     summary: Get cleanup configuration settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuration fetched successfully
 */
router.get("/cleanup-config", authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getCleanupConfig);

/**
 * @swagger
 * /admin/cleanup-config:
 *   put:
 *     summary: Update cleanup configuration settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userDeletionStrategy:
 *                 type: string
 *                 enum: [inactivity, deactivation]
 *               inactivityDays:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 365
 *               gracePeriodDays:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 30
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 */
router.put("/cleanup-config", authMiddleware.authenticate, authMiddleware.isAdmin, adminController.updateCleanupConfig);

/**
 * @swagger
 * /admin/reports/scheduled-items:
 *   get:
 *     summary: Get report of items scheduled for deletion
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Scheduled items report fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 gracePeriodDays:
 *                   type: integer
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/reports/scheduled-items", authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getScheduledItemsReport);

/**
 * @swagger
 * /admin/reports/scheduled-users:
 *   get:
 *     summary: Get report of users scheduled for deletion
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Scheduled users report fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 gracePeriodDays:
 *                   type: integer
 *                 deletionStrategy:
 *                   type: string
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/reports/scheduled-users", authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getScheduledUsersReport);

/**
 * @swagger
 * /admin/reports/deletion-success:
 *   get:
 *     summary: Get report of successfully deleted data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to look back
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, items, users]
 *           default: all
 *         description: Type of deletion report
 *     responses:
 *       200:
 *         description: Deletion success report fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 report:
 *                   type: object
 */
router.get("/reports/deletion-success", authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getDeletionSuccessReport);

module.exports = router;

