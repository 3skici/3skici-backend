// controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Update user by ID
const updateUserById = async (req, res) => {
  try {
    const { username, name, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, name, email },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Change user password
const changeUserPassword = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Delete user by ID
const deleteUserById = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Add a product to the user's favorites
const addFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const product = await Product.findById(req.body.productId);

    if (!user || !product) {
      return res.status(404).json({ message: "User or Product not found" });
    }

    // Check if the product is already in favorites
    if (user.favorites.includes(product._id)) {
      return res.status(400).json({ message: "Product already in favorites" });
    }

    // Add the product to the favorites
    user.favorites.push(product._id);
    await user.save();

    res
      .status(200)
      .json({
        message: "Product added to favorites",
        favorites: user.favorites,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding product to favorites", error });
  }
};

// Get the user's favorites
const getFavorites = async (req, res) => {
  console.log("this is the req: ", req.body)
  console.log("this is the user: ", req.user.userId)
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId).populate("favorites");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ favorites: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove a product from the user's favorites
const removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the product from favorites
    user.favorites = user.favorites.filter(
      (fav) => !fav.equals(req.body.productId)
    );
    await user.save();

    res
      .status(200)
      .json({
        message: "Product removed from favorites",
        favorites: user.favorites,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing product from favorites", error });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUserById,
  changeUserPassword,
  deleteUserById,
  addFavorite,
  removeFavorite,
  getFavorites,
};
