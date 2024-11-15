// routes/userRoutes.js
const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUserById,
  changeUserPassword,
  deleteUserById,
  addFavorite,
  getFavorites,
  removeFavorite
} = require('../controllers/userController');
const  isAuthenticated  = require('../middleware/isAuthenticated');

const router = express.Router();

// User routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUserById);
router.put('/change-password', changeUserPassword);
router.delete('/:id', deleteUserById);


// Route to add a product to the user's favorites
router.post('/:id/favorites', addFavorite);

// Route to remove a product from the user's favorites
router.delete('/:id/favorites', isAuthenticated, removeFavorite);

// Route to get the user's favorite products
router.get('/:id/favorites', isAuthenticated, getFavorites);


module.exports = router;
