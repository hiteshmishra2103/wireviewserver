// categoryController.js
const Products = require('../models/Products');

exports.getCategoryProducts = async (req, res) => {
    const category = req.params.category;
    console.log(category);
    const products = await Products.find({ category, published: true });
    res.json({ products });
};
