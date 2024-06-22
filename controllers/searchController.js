const Products = require("../models/Products");


exports.searchProducts = async (req, res) => {
    try {
        const q = req.query.q;
        const products = await Products.find({
            $or: [
                { name: { $regex: q, $options: "i" } },
                { category: { $regex: q, $options: "i" } },
                { color: { $regex: q, $options: "i" } },
            ],
        }).limit(4);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};