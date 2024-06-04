const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Ensure you have your Stripe secret key stored in an environment variable
const User = require('../models/Users'); // Adjust the path as necessary
const Orders = require('../models/Orders'); // Adjust the path as necessary
const Cart = require('../models/Carts'); // Adjust the path as necessary

exports.stripeCheckout = async (req, res) => {
  console.log('stripeCheckout initiated');
  try {
    const user = await User.findOne({ username: req.user.username });
    console.log('User fetched:', user);

    if (!user) {
      console.error('User not found');
      return res.status(404).json({ message: "User not found" });
    }

    const { product } = req.body;
    console.log('Product details:', product);

    if (!product || !Array.isArray(product)) {
      console.error('Invalid product data');
      return res.status(400).json({ message: "Invalid product data" });
    }

    const line_items = product.map((prod) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: prod.name,
        },
        unit_amount: prod.price * 100,
      },
      quantity: prod.quantity,
    }));
    console.log('Line items:', line_items);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.URL}/success`,
      cancel_url: `${process.env.URL}/cancel`,
    });
    console.log('Stripe session created:', session);

    const newOrder = new Orders({
      user: user._id,
      products: product.map((p) => ({
        product: p.productId,
        quantity: p.quantity,
      })),
      totalPrice: product.reduce((total, p) => total + p.price * p.quantity, 0),
      date: new Date(),
      status: "pending",
    });
    console.log('New order object:', newOrder);

    await newOrder.save();
    console.log('New order saved');

    await User.findByIdAndUpdate(
      user._id,
      { $push: { ordersHistory: newOrder._id } },
      { new: true }
    );
    console.log('User order history updated');

    await Cart.findOneAndUpdate(
      { user: user._id },
      { $set: { products: [], totalQuantity: 0, totalPrice: 0 } },
      { new: true }
    );
    console.log('User cart cleared');

    res.status(200).json({ session });
  } catch (error) {
    console.error('Error during stripeCheckout:', error);
    res.status(500).json({ message: "Error creating checkout session" });
  }
};
