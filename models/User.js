const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superAdmin', 'delivery'],
    default: 'user',
  },
  phone: { type: String }, 
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export the model
const User = mongoose.model('User', userSchema, 'users');
module.exports = User;
