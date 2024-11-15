const express = require("express");
const router = express.Router();
const controller = require('../controllers/productController');
const multer = require('multer');
const upload = multer()
// endpoint of creating new product
router.post('/add', upload.array('images'), controller.createProduct);

// Route to get all products
router.get('/all', controller.getProducts);

// Route to get a single product by ID
router.get('/:id', controller.getProductById);

// Route to update a product by ID
router.put('/:id', controller.updateProduct);

// Route to delete a product by ID
router.delete('/:id', controller.deleteProduct);

module.exports = router;
