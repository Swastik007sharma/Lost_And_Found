const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    minlength: 5, // Minimum length for description
  },
  isPredefined: {
    type: Boolean,
    default: false, // Indicates if the category is predefined
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Seed predefined categories (optional)
const predefinedCategories = [
  { name: 'Electronics', description: 'Items like phones, laptops, chargers, etc.', isPredefined: true },
  { name: 'Books', description: 'Books, notebooks, and study materials.', isPredefined: true },
  { name: 'Clothing', description: 'Clothes, shoes, and accessories.', isPredefined: true },
  { name: 'Accessories', description: 'Watches, wallets, keys, etc.', isPredefined: true },
  { name: 'Other', description: 'Miscellaneous items.', isPredefined: true },
];

module.exports = mongoose.model('Category', categorySchema);

// Function to seed predefined categories (run once during setup)
const seedCategories = async () => {
  try {
    const Category = mongoose.model('Category');
    const existingCategories = await Category.find({ isPredefined: true });

    if (existingCategories.length === 0) {
      await Category.insertMany(predefinedCategories);
      console.log('Predefined categories seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

// Run seeding only in development
if (process.env.NODE_ENV === 'development') {
  seedCategories();
}