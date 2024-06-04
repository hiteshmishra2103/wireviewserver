// stripeCheckoutController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Ensure you have your Stripe secret key stored in an environment variable
const User = require('../models/Users'); // Adjust the path as necessary

exports.stripeCheckout = async (req, res) => {
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
