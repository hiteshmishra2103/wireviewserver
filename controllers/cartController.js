const mongoose = require("mongoose");
const User = require("../models/user");
const Cart = require("../models/cart");
const Products = require("../models/products");


const getCart = async (req, res) => {
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
        return res.status(404).json({ message: "User not found, create a new user or login!" });
    }
    const cart = await Cart.findOne({ user: user._id }).populate("products.product");
    if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
    } else {
        res.json({ cart });
    }
};

const getCartQuantity = async (req, res) => {
    const user = await User.findOne({ username: req.user.username });
    const cartQuantity = await Cart.findOne({ user: user._id }).select("totalQuantity");
    if (!cartQuantity) {
        return res.status(404).json({ message: "Cart not found" });
    } else {
        res.json({ cartQuantity });
    }
};

const deleteFromCart = async (req, res) => {
    try {
        const productId = new mongoose.Types.ObjectId(req.params.productId);
        const user = await User.findOne({ username: req.user.username });
        const cart = await Cart.findOne({ user: user._id });
        if (!cart) {
            res.status(404).json({ message: "Cart not found" });
        } else {
            const productInCart = cart.products.find((p) => p.product.toString() == productId.toString());
            if (productInCart) {
                const productDetails = await Products.findById(productId);
                cart.totalPrice -= productInCart.quantity * productDetails.price;
                cart.totalQuantity -= productInCart.quantity;
                await cart.save();
                await Cart.findOneAndUpdate(
                    { user: user._id },
                    { $pull: { products: { product: productId } } }
                );
                res.json({ message: "Product deleted from cart successfully" });
            } else {
                res.status(404).json({ message: "Product not found in cart" });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting product from cart" });
    }
};

const addToCart = async (req, res) => {
    const { productId, quantity, price } = req.body;
    const user = await User.findOne({ username: req.user.username });
    const product = await Products.findById(productId);

    if (!user) {
        res.status(403).json({ message: "User not found" });
    } else {
        if (!product) {
            res.status(403).json({ message: "Product not found" });
        }
        const cart = await Cart.findOne({ user: user._id });
        if (!cart) {
            const newCart = new Cart({
                user: user._id,
                products: [{ product: productId, quantity }],
                totalPrice: quantity * price,
                totalQuantity: quantity,
            });
            await newCart.save();
        } else {
            const productInCart = cart.products.find((p) => p.product == productId);
            if (productInCart) {
                productInCart.quantity += quantity;
                cart.totalPrice += quantity * price;
                cart.totalQuantity += quantity;
            } else {
                cart.products.push({
                    product: productId,
                    quantity: quantity,
                });
                cart.totalPrice += quantity * price;
                cart.totalQuantity += quantity;
            }
            await cart.save();
        }
        res.json({ message: "Product added to cart successfully" });
    }
};

module.exports = {
    getCart,
    getCartQuantity,
    deleteFromCart,
    addToCart,
};
