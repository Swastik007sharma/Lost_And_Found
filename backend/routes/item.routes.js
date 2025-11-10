const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const itemController = require('../controllers/item.controller');
const { validate } = require('../middlewares/validate.middleware');
const { createItemSchema, updateItemSchema } = require('../schema/item.schema');
const { checkOwnership } = require('../middlewares/checkOwner.middleware');
const fileUploadMiddleware = require('../middlewares/fileUpload.middleware');
const { strictLimiter } = require('../middlewares/rateLimit.middleware');
const { idSchema } = require('../schema/common.schema');

/** 
 * @swagger
 * /items:
 *   post:
 *     summary: Create a new item
 *     description: Creates a new lost or found item with optional image upload. Requires authentication.
 *     tags: [Items]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, category, subCategory, status, location]
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Lost Wallet
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 example: Black leather wallet with ID and credit cards
 *               category:
 *                 type: string
 *                 description: Name of the category
 *                 example: Personal Items
 *               subCategory:
 *                 type: string
 *                 description: Name of the subcategory
 *                 example: Wallets
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["wallet", "black", "leather"]
 *               status:
 *                 type: string
 *                 enum: [Lost, Found]
 *                 example: Lost
 *               location:
 *                 type: object
 *                 required: [type, coordinates]
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                     example: Point
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     minItems: 2
 *                     maxItems: 2
 *                     example: [-73.935242, 40.730610]
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file for the item
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item created successfully
 *                 item:
 *                   $ref: '#/components/schemas/Item'
 *       400:
 *         description: Validation error or invalid category/subcategory
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error or Cloudinary upload failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Create a new item (with file upload validation)
router.post(
  '/',
  authMiddleware.authenticate,
  fileUploadMiddleware.uploadFile, // Validate and handle file upload
  validate(createItemSchema),
  itemController.createItem
);

/** 
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: Update an item
 *     description: Updates an existing item. Requires authentication and ownership.
 *     tags: [Items]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Lost Wallet
 *               description:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 example: Updated description
 *               category:
 *                 type: string
 *                 description: Name of the category
 *                 example: Personal Items
 *               subCategory:
 *                 type: string
 *                 description: Name of the subcategory
 *                 example: Wallets
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["wallet", "black"]
 *               status:
 *                 type: string
 *                 enum: [Lost, Found, Claimed, Returned]
 *                 example: Found
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                     example: Point
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     minItems: 2
 *                     maxItems: 2
 *                     example: [-73.935242, 40.730610]
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Updated image file for the item
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item updated successfully
 *                 item:
 *                   $ref: '#/components/schemas/Item'
 *       400:
 *         description: Validation error or invalid category/subcategory
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User is not the owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error or Cloudinary upload failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Update an item
router.put(
  '/:id',
  authMiddleware.authenticate,
  fileUploadMiddleware.uploadFile,
  validate(updateItemSchema),
  checkOwnership,
  itemController.updateItem
);

/** 
 * @swagger
 * /items:
 *   get:
 *     summary: Get all items
 *     description: Retrieves a paginated list of active items with optional filters for search, sorting, and pagination.
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, title, status]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Search term for title, description, tags, category, or subcategory
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
 *                   example: Items fetched successfully
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Item'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *                     totalResults:
 *                       type: integer
 *                       example: 100
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Get all items (with optional filters)
router.get('/', itemController.getItems);

/** 
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: Get item by ID
 *     description: Retrieves details of a specific item by its ID.
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   $ref: '#/components/schemas/Item'
 *       400:
 *         description: Invalid item ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Get details of a specific item
router.get('/:id', validate(idSchema, 'params'), itemController.getItemById);

/** 
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Delete an item
 *     description: Soft deletes an item by setting isActive to false. Requires authentication and ownership.
 *     tags: [Items]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item deleted successfully
 *       400:
 *         description: Invalid item ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - User is not the owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Delete an item
router.delete('/:id', authMiddleware.authenticate, validate(idSchema, 'params'), checkOwnership, itemController.deleteItem);

/** 
 * @swagger
 * /items/{id}/claim:
 *   post:
 *     summary: Claim an item
 *     description: Claims an item and generates an OTP for verification. Requires authentication and rate limiting.
 *     tags: [Items]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item claimed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item claimed successfully
 *                 item:
 *                   $ref: '#/components/schemas/Item'
 *       400:
 *         description: Item already claimed or invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many requests - Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Claim an item (with strict rate limiting to prevent abuse)
router.post('/:id/claim', authMiddleware.authenticate, validate(idSchema, 'params'), strictLimiter, itemController.claimItem);

/** 
 * @swagger
 * /items/{id}/generate-qr:
 *   post:
 *     summary: Generate QR code for an item
 *     description: Generates a QR code for an item containing item ID and status. Requires authentication.
 *     tags: [Items]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: Item ID
 *     responses:
 *       200:
 *         description: QR code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: QR code generated successfully
 *                 qrCode:
 *                   type: string
 *                   description: Base64-encoded QR code image
 *                   example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...
 *       400:
 *         description: Invalid item ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Generate a QR code for the claimant
router.post('/:id/generate-qr', authMiddleware.authenticate, validate(idSchema, 'params'), itemController.generateQRCode);

/** 
 * @swagger
 * /items/{id}/scan-qr:
 *   post:
 *     summary: Scan QR code to verify item
 *     description: Verifies an item's QR code to confirm ownership or status. Requires authentication.
 *     tags: [Items]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [qrData]
 *             properties:
 *               qrData:
 *                 type: string
 *                 description: JSON string containing itemId and status
 *                 example: '{"itemId":"507f1f77bcf86cd799439011","status":"Lost"}'
 *     responses:
 *       200:
 *         description: QR code verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: QR code verified successfully
 *                 item:
 *                   $ref: '#/components/schemas/Item'
 *       400:
 *         description: Invalid or outdated QR code data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Scan the QR code to verify ownership
router.post('/:id/scan-qr', authMiddleware.authenticate, validate(idSchema, 'params'), itemController.scanQRCode);

/** 
 * @swagger
 * /items/{id}/generate-otp:
 *   post:
 *     summary: Generate OTP for claiming an item
 *     description: Generates a 6-digit OTP for item claiming, sent to the claimant via email/notification. Requires authentication and rate limiting.
 *     tags: [Items]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: Item ID
 *     responses:
 *       200:
 *         description: OTP generated successfully or existing valid OTP reused
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP generated successfully
 *                 otp:
 *                   type: string
 *                   example: "123456"
 *       400:
 *         description: Invalid item ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Only poster or keeper can generate OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many requests - Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Generate an OTP for the claimant (with strict rate limiting to prevent OTP spam)
router.post('/:id/generate-otp', authMiddleware.authenticate, validate(idSchema, 'params'), strictLimiter, itemController.generateOTP);

/** 
 * @swagger
 * /items/{id}/verify-otp:
 *   post:
 *     summary: Verify OTP for claiming an item
 *     description: Verifies the OTP to mark an item as returned. Requires authentication and rate limiting.
 *     tags: [Items]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp]
 *             properties:
 *               otp:
 *                 type: string
 *                 pattern: ^\d{6}$
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully, item marked as returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP verified successfully. Item marked as returned.
 *                 item:
 *                   $ref: '#/components/schemas/Item'
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many requests - Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Verify the OTP entered by the claimant (with strict rate limiting to prevent brute force)
router.post('/:id/verify-otp', authMiddleware.authenticate, validate(idSchema, 'params'), strictLimiter, itemController.verifyOTP);

/** 
 * @swagger
 * /items/{id}/assign-keeper:
 *   post:
 *     summary: Assign a keeper to an item
 *     description: Assigns a keeper to manage a found item. Requires authentication.
 *     tags: [Items]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[0-9a-fA-F]{24}$
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [keeperId, keeperName]
 *             properties:
 *               keeperId:
 *                 type: string
 *                 pattern: ^[0-9a-fA-F]{24}$
 *                 example: 507f1f77bcf86cd799439015
 *               keeperName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Jane Doe
 *     responses:
 *       200:
 *         description: Keeper assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Keeper assigned successfully
 *                 item:
 *                   $ref: '#/components/schemas/Item'
 *       400:
 *         description: Invalid input or keeper already assigned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Item or keeper not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Assign a found item to a keeper
router.post('/:id/assign-keeper', authMiddleware.authenticate, validate(idSchema, 'params'), itemController.assignKeeper);

module.exports = router;