// scripts/seedData.js

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
// ...import other models

// Connect to the database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    // Create initial users
    const user = new User({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'hashedpassword', // Make sure to hash passwords
    });
    await user.save();

    // Create initial products
    const product = new Product({
      name: 'Sample Product',
      price: 0,
    });
    await product.save();

    // ...seed other data

    console.log('Data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
