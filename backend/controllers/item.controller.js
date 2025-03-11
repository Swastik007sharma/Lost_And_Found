const Item = require('../models/item.model');
const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises; // Use promises for non-blocking file operations
const { createItemSchema, updateItemSchema } = require('../schema/item.schema'); // Import Zod schemas
const QRCode = require('qrcode'); // For generating QR codes
const otpGenerator = require('otp-generator'); // For generating OTPs
const Notification = require('../models/notification.model'); // For creating notifications
const User = require('../models/user.model'); // For accessing user details
const sendEmail = require('../utils/sendEmail'); // Utility function for sending emails
const Category = require('../models/category.model'); // For resolving category names to IDs

// Helper function to send email and notification
const sendNotificationAndEmail = async (userId, emailSubject, emailTemplate, templateData, message, itemId, io) => {
  const user = await User.findById(userId);
  if (user) {
    // Send email
    await sendEmail(user.email, emailSubject, emailTemplate, templateData);

    // Create notification in the database
    const notification = new Notification({
      userId: user._id,
      message,
      itemId,
      isRead: false,
    });
    await notification.save();

    // Emit real-time notification using Socket.IO
    io.to(user._id.toString()).emit('newNotification', notification);
  }
};

// Create a new item
exports.createItem = async (req, res) => {
  try {
    // Validate request body using Zod schema
    const { title, description, category, tags, status, location } = createItemSchema.parse(req.body);
    let imageUrl = null;

    // Handle file upload
    if (req.file) {
      const filePath = req.file.path;
      try {
        const result = await cloudinary.uploader.upload(filePath, { folder: 'lost-and-found' });
        imageUrl = result.secure_url;
      } catch (cloudinaryError) {
        return res.status(500).json({ message: 'Failed to upload image to Cloudinary', code: 'CLOUDINARY_ERROR' });
      } finally {
        await fs.unlink(filePath).catch((err) => console.error('Failed to delete temp file:', err));
      }
    }

    // Resolve category name to category ID
    const categoryDoc = await Category.findOne({ name: category, isActive: true });
    if (!categoryDoc) {
      return res.status(400).json({ message: `Category '${category}' not found`, code: 'INVALID_CATEGORY' });
    }

    // Save the new item to the database
    const newItem = new Item({
      title,
      description,
      category: categoryDoc._id, // Use category ID instead of name
      tags,
      status,
      location,
      image: imageUrl,
      postedBy: req.user.id,
      isActive: true,
    });

    await newItem.save();
    res.status(201).json({ message: 'Item created successfully', item: newItem });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', code: 'VALIDATION_ERROR', details: error.errors });
    }
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Failed to create item', code: 'SERVER_ERROR' });
  }
};

// Get all items (with optional filters)
exports.getItems = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', search = '' } = req.query;

    // Build query for filtering items
    const query = { isActive: true };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch paginated and sorted items
    const items = await Item.find(query)
      .populate('postedBy', 'name email') // Populate user details
      .populate('category', 'name') // Populate category details
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 }) // Sort by field and order
      .limit(parseInt(limit)) // Limit results per page
      .skip((parseInt(page) - 1) * parseInt(limit)); // Skip items for pagination

    // Count total items for pagination metadata
    const totalItems = await Item.countDocuments(query);

    res.status(200).json({
      message: 'Items fetched successfully',
      items,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
        totalResults: totalItems,
      },
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Failed to fetch items', code: 'SERVER_ERROR' });
  }
};

// Get details of a specific item
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the item by ID
    const item = await Item.findOne({ _id: id, isActive: true })
      .populate('postedBy', 'name email') // Populate user details
      .populate('category', 'name'); // Populate category details

    if (!item) {
      return res.status(404).json({ message: 'Item not found', code: 'NOT_FOUND' });
    }

    res.status(200).json({ item });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ message: 'Failed to fetch item', code: 'SERVER_ERROR' });
  }
};

// Update an item
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, tags, status, location, image } = updateItemSchema.parse(req.body);

    // Find the item by ID
    const item = await Item.findOne({ _id: id, isActive: true });
    if (!item) {
      return res.status(404).json({ message: 'Item not found', code: 'NOT_FOUND' });
    }

    // Check ownership
    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this item', code: 'FORBIDDEN' });
    }

    // Update the item fields
    item.title = title || item.title;
    item.description = description || item.description;
    item.category = category || item.category;
    item.tags = tags || item.tags;
    item.status = status || item.status;
    item.location = location || item.location;
    item.image = image || item.image;

    await item.save();
    res.status(200).json({ message: 'Item updated successfully', item });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', code: 'VALIDATION_ERROR', details: error.errors });
    }
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Failed to update item', code: 'SERVER_ERROR' });
  }
};

// Generate a QR Code for an item
exports.generateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findOne({ _id: id, isActive: true });
    if (!item) {
      return res.status(404).json({ message: 'Item not found', code: 'NOT_FOUND' });
    }

    // Generate QR code data (e.g., item ID and status)
    const qrData = JSON.stringify({ itemId: item._id, status: item.status });

    // Generate QR code as a base64 image
    const qrCode = await QRCode.toDataURL(qrData);
    res.status(200).json({ message: 'QR code generated successfully', qrCode });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ message: 'Failed to generate QR code', code: 'SERVER_ERROR' });
  }
};

// Scan a QR Code to verify ownership or status
exports.scanQRCode = async (req, res) => {
  try {
    const { qrData } = req.body;
    const parsedData = JSON.parse(qrData);

    // Find the item by ID from the QR code data
    const item = await Item.findOne({ _id: parsedData.itemId, isActive: true });
    if (!item) {
      return res.status(404).json({ message: 'Item not found', code: 'NOT_FOUND' });
    }

    // Verify the status matches the QR code data
    if (item.status !== parsedData.status) {
      return res.status(400).json({ message: 'QR code data is invalid or outdated', code: 'INVALID_QR' });
    }

    res.status(200).json({ message: 'QR code verified successfully', item });
  } catch (error) {
    console.error('Error scanning QR code:', error);
    res.status(500).json({ message: 'Failed to scan QR code', code: 'SERVER_ERROR' });
  }
};

// Generate an OTP for claiming an item
exports.generateOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findOne({ _id: id, isActive: true });
    if (!item) {
      return res.status(404).json({ message: 'Item not found', code: 'NOT_FOUND' });
    }

    // Generate a 6-digit OTP
    const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

    // Save the OTP in the database (optional: set an expiration time)
    item.claimOTP = otp;
    item.claimOTPExpiresAt = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    await item.save();

    // Notify the user who posted the item via email and notification
    const emailSubject = 'OTP for Claiming Your Lost Item';
    await sendNotificationAndEmail(
      item.postedBy,
      emailSubject,
      'otp',
      { name: item.postedBy.name, itemTitle: item.title, otp },
      `An OTP (${otp}) has been generated for claiming your item "${item.title}".`,
      item._id,
      req.app.get('io')
    );

    res.status(200).json({ message: 'OTP generated successfully', otp });
  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({ message: 'Failed to generate OTP', code: 'SERVER_ERROR' });
  }
};

// Verify the OTP entered by the claimant
exports.verifyOTP = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;
    const item = await Item.findOne({ _id: id, isActive: true });
    if (!item) {
      return res.status(404).json({ message: 'Item not found', code: 'NOT_FOUND' });
    }

    // Check if the OTP matches and has not expired
    if (item.claimOTP !== otp || Date.now() > item.claimOTPExpiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP', code: 'INVALID_OTP' });
    }

    // Mark the item as claimed
    item.status = 'Claimed';
    item.claimedBy = req.user.id; // Updated to use req.user.id
    item.isClaimed = true;
    item.claimOTP = null; // Clear the OTP after successful verification
    item.claimOTPExpiresAt = null;
    await item.save();

    // Notify the user who posted the item that their item has been claimed
    const emailSubject = 'Your Lost Item Has Been Claimed';
    await sendNotificationAndEmail(
      item.postedBy,
      emailSubject,
      'claimNotification',
      { name: item.postedBy.name, itemTitle: item.title },
      `Your item "${item.title}" has been claimed.`,
      item._id,
      req.app.get('io')
    );

    res.status(200).json({ message: 'OTP verified successfully. Item claimed.', item });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP', code: 'SERVER_ERROR' });
  }
};

// Claim an item
exports.claimItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the item by ID
    const item = await Item.findOne({ _id: id, isActive: true });
    if (!item) {
      return res.status(404).json({ message: 'Item not found', code: 'NOT_FOUND' });
    }

    // Check if the item is already claimed
    if (item.isClaimed) {
      return res.status(400).json({ message: 'This item has already been claimed', code: 'ALREADY_CLAIMED' });
    }

    // Mark the item as claimed
    item.status = 'Claimed';
    item.claimedBy = req.user.id; // Updated to use req.user.id
    item.isClaimed = true;
    await item.save();

    // Notify the user who posted the item that their item has been claimed
    const emailSubject = 'Your Lost Item Has Been Claimed';
    await sendNotificationAndEmail(
      item.postedBy,
      emailSubject,
      'claimNotification',
      { name: item.postedBy.name, itemTitle: item.title },
      `Your item "${item.title}" has been claimed.`,
      item._id,
      req.app.get('io')
    );

    res.status(200).json({ message: 'Item claimed successfully', item });
  } catch (error) {
    console.error('Error claiming item:', error);
    res.status(500).json({ message: 'Failed to claim item', code: 'SERVER_ERROR' });
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the item by ID
    const item = await Item.findOne({ _id: id, isActive: true });
    if (!item) {
      return res.status(404).json({ message: 'Item not found', code: 'NOT_FOUND' });
    }

    // Check ownership
    if (item.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this item', code: 'FORBIDDEN' });
    }

    // Delete the item (soft delete by setting isActive to false)
    item.isActive = false;
    await item.save();

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Failed to delete item', code: 'SERVER_ERROR' });
  }
};

// Mark an item as returned
exports.returnItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the item by ID
    const item = await Item.findOne({ _id: id, isActive: true });
    if (!item) {
      return res.status(404).json({ message: 'Item not found', code: 'NOT_FOUND' });
    }

    // Check if the item is already returned
    if (item.status === 'Returned') {
      return res.status(400).json({ message: 'This item has already been marked as returned', code: 'ALREADY_RETURNED' });
    }

    // Mark the item as returned
    item.status = 'Returned';
    await item.save();

    // Notify the user who posted the item that their item has been returned
    const emailSubject = 'Your Lost Item Has Been Returned';
    await sendNotificationAndEmail(
      item.postedBy,
      emailSubject,
      'returnNotification',
      { name: item.postedBy.name, itemTitle: item.title },
      `Your item "${item.title}" has been marked as returned.`,
      item._id,
      req.app.get('io')
    );

    res.status(200).json({ message: 'Item marked as returned successfully', item });
  } catch (error) {
    console.error('Error marking item as returned:', error);
    res.status(500).json({ message: 'Failed to mark item as returned', code: 'SERVER_ERROR' });
  }
};

// Assign a keeper to an item
exports.assignKeeper = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the item by ID
    const item = await Item.findOne({ _id: id, isActive: true });
    if (!item) {
      return res.status(404).json({ message: 'Item not found', code: 'NOT_FOUND' });
    }

    // Check if the item already has a keeper
    if (item.keeper) {
      return res.status(400).json({ message: 'This item already has a keeper assigned', code: 'KEEPER_ALREADY_ASSIGNED' });
    }

    // Assign the current user as the keeper
    item.keeper = req.user.id; // Updated to use req.user.id
    await item.save();

    // Notify the user who posted the item that a keeper has been assigned
    const emailSubject = 'A Keeper Has Been Assigned to Your Lost Item';
    await sendNotificationAndEmail(
      item.postedBy,
      emailSubject,
      'keeperAssignedNotification',
      { name: item.postedBy.name, itemTitle: item.title, keeperName: req.user.name },
      `A keeper (${req.user.name}) has been assigned to your item "${item.title}".`,
      item._id,
      req.app.get('io')
    );

    res.status(200).json({ message: 'Keeper assigned successfully', item });
  } catch (error) {
    console.error('Error assigning keeper:', error);
    res.status(500).json({ message: 'Failed to assign keeper', code: 'SERVER_ERROR' });
  }
};