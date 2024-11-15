const Category = require("../models/Category");


// Fetch all categories
const getAll = async (req, res, next) => {
  try {
    const categories = await Category.find(); // Fetch all categories
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Fetch a category by ID
const getById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id); // Fetch category by ID
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// create new category
const create = async (req, res, next) => {
  const category = new Category({
    name: req.body.name,
    description: req.body.description,
  });

  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// update category
const update = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.name = req.body.name || category.name;
    category.description = req.body.description || category.description;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// remove cat
const remove = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const result = await Category.deleteOne({
      _id: req.params.id 
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Category not found"});
    }
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
