const mongoose = require("mongoose");
const User = require("../models/Users");
const Products = require("../models/Products");

// Add a new product (Admin only)
exports.addProduct = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username });
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: "You are not an admin!" });
        }

        const {
            productName,
            productDescription,
            productPrice,
            productCategory,
            productColor,
            productQuantity,
            productMediaUrl,
            thUrl,
            published,
        } = req.body;

        if (
            !productName ||
            !productDescription ||
            !productPrice ||
            !productCategory ||
            !productColor ||
            !productQuantity ||
            !productMediaUrl ||
            !thUrl
        ) {
            return res.status(403).json({ message: "Please fill all the fields" });
        }

        const newProduct = new Products({
            name: productName,
            description: productDescription,
            price: productPrice,
            category: productCategory,
            thumbnail: thUrl,
            color: productColor,
            quantity: productQuantity,
            mediaurl: productMediaUrl,
            published: published,
        });

        const savedProduct = await newProduct.save();
        const message = published ? "Product saved successfully" : "Product added successfully";
        res.status(201).json({ savedProduct, message });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "An error occurred while adding the product" });
    }
};

// Update an existing product (Admin only)
exports.updateProduct = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username });
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: "You are not an admin!" });
        }

        const {
            productName,
            productDescription,
            productPrice,
            productCategory,
            productColor,
            productQuantity,
            productMediaUrl,
            thUrl,
            published,
        } = req.body;

        const product = await Products.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.name = productName;
        product.description = productDescription;
        product.price = productPrice;
        product.category = productCategory;
        product.color = productColor;
        product.quantity = productQuantity;
        product.mediaurl = productMediaUrl;
        product.thumbnail = thUrl;
        product.published = published;

        const updatedProduct = await product.save();
        res.status(200).json({ updatedProduct, message: "Product updated successfully" });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "An error occurred while updating the product" });
    }
};

// Fetch all published products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Products.find({ published: true });
        res.json({ products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching products" });
    }
};

// Fetch a product by its ID
exports.getProductById = async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Products.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching product" });
    }
};

// Fetch products by category
exports.getProductsByCategory = async (req, res) => {
    try {
        const category = req.params.category;
        const products = await Products.find({ category, published: true });
        res.json({ products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching products" });
    }
};

// Search products by name, category, or color





