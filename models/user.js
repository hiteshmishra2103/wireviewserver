const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String },
  password: String,
  isAdmin: { type: Boolean, default: false },
  ordersHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Orders" }],
  purchasedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Products" }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
