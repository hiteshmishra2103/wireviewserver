const mongoose = require('mongoose');
const Products = require('./Products');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
      quantity: Number,
    },
  ],
  totalPrice: Number,
  date: Date,
  status: {
    type: String,
    default: "pending",
  },
});

orderSchema.pre("save", async function (next) {
  let order = this;
  let totalPrice = 0;

  for (let product of order.products) {
    let productDoc = await Products.findById(product.product);
    totalPrice += productDoc.price * product.quantity;
  }
  order.totalPrice = totalPrice;
  next();
});

const Orders = mongoose.model('Orders', orderSchema);

module.exports = Orders;
