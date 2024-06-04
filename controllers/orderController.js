const User = require("../models/Users");
const Orders = require("../models/Orders");
const stripe = require("stripe")(process.env.STRIPE_KEY);

const getOrders = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }
    const orders = await Orders.find({ user: user._id });
    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    } else {
      res.json({ orders });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

const checkout = async (req, res) => {
  try {
    const { products, totalPrice } = req.body;
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }
    const customer = await stripe.customers.create({
      metadata: { userId: user._id.toString(), cart: JSON.stringify(products) },
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customer.id,
      line_items: products.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.product.title },
          unit_amount: item.product.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: "http://localhost:3000/checkout-success",
      cancel_url: "http://localhost:3000/cart",
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating checkout session" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.isAdmin) {
      return res.status(403).json({ message: "You are not an admin!" });
    }
    const orderId = req.params.orderId;
    const { status } = req.body;
    const order = await Orders.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.status = status;
    await order.save();
    res.json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating order status" });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username })
      .select("-isAdmin -password")
      .populate({
        path: "ordersHistory",
        populate: {
          path: "products.product",
        },
      });

    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(user.ordersHistory);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

module.exports = {
  getOrders,
  checkout,
  updateOrderStatus,
  getOrderHistory,
};
