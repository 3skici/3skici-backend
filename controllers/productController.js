// controllers/productController.js
const Product = require("../models/Product");

// Controller function to create a new product
const createProduct = async (req, res) => {
  try {
    // Get product data from the request body
    const productData = req.body;
    // Validate the required fields
    if (!productData.name || !productData.price || !productData.description) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, price, and description are required.",
      });
    }

      // Additional validation for price (e.g., must be a positive number)
      if (productData.price <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a positive number.',
        });
      }
    // Create a new product instance
    const newProduct = new Product(productData);

    // Save the product to the database
    await newProduct.save();

    // Respond with the created product
    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: newProduct,
    });
  } catch (error) {
    // Handle errors (e.g., validation errors)
    if (error.name === 'validationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + error.message,
      });
    }

    // handle any other errors
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating the product. Please try again later.',
      error: error.message,
    })
    
  }
};

// Controller function to get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to get a product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to update a product by ID
const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Controller function to delete a product by ID
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
