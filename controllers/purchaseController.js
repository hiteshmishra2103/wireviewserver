const User = require('../models/User'); 
const Orders = require('../models/Orders'); 

const purchaseProducts = async (req, res) => {      
    try {
        const { products } = req.body;

        const user = await User.findOne({ username: req.user.username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newOrder = new Orders({
            user: user._id,
            products: products.map((product) => ({
                product: product.productId,
                quantity: product.quantity,
            })),
            totalPrice: products.reduce(
                (total, product) => total + product.price * product.quantity,
                0
            ),
            date: new Date(),
            status: "pending",
        });

        await newOrder.save();

        await User.findByIdAndUpdate(
            user._id,
            { $push: { ordersHistory: newOrder._id } },
            { new: true }
        );

        res.json({ message: "Products purchased successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error purchasing products" });
    }
};

module.exports = { purchaseProducts };
