const mongoose = require("mongoose");
// Define mongoose schemas

const userSchema = new mongoose.Schema({
  username: { type: String },
  password: String,
  isAdmin: { type: Boolean, default: false },
  ordersHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Orders" }],
  purchasedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, //removes whitespace
  },
  description: String,
  thumbnail: String,
  //price field required and greater than 0
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  //imgurl will contain the array of the image urls of the product
  mediaurl: [String],
  category: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  specifications: {
    Brand: {
      type: String,
      default: "wireview Electronics", // Default status is "pending"
    },
    Type: {
      type: String,
      default: "Watch",
    },
  },
  tehnicalSpecs: {
    type: { String },
    default: {
      Touch: "yes",
      health: "Advanced Health Sensors",
      Safety: "Crash detection",
      connect: "Stay Connected",
      Available:
        "Yes. Tens of thousands of apps from the store right at your wrist.",
    },
  },
  DesignAndDurability: {
    tyep: { String },
    default: {
      Proface: {
        type: [String],
        default: ["Brilliant always-on", "Smooth and Seamless"],
      },
      EdgeDesign: {
        type: [String],
        default: ["elegant", "Narrow border"],
      },
      Display: {
        type: [String],
        default: ["Always-on display", "Retina LTPO OLED display"],
      },
      Swimproof: {
        type: [String],
        default: ["Water resistant 50 meters", "Shallow water activities"],
      },
    },
  },
  Quantity: Number,
  published: Boolean,
  color: String,
});

// const productDetailsSchema = new mongoose.Schema({
//   productId: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
// });

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
    default: "pending", // Default status is "pending"
  },
});

orderSchema.pre("save", async function (next) {
  let order = this;
  let totalPrice = 0;

  for (let product of order.products) {
    let productDoc = await Products.findById(product.product); // Changed 'Product' to 'Products'
    totalPrice += productDoc.price * product.quantity;
  }
  order.totalPrice = totalPrice;
  next();
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
      quantity: Number,
    },
  ],
  totalQuantity: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
});

const User = mongoose.model("User", userSchema);
const Products = mongoose.model("Products", productSchema);
const Orders = mongoose.model("Orders", orderSchema);
const Cart = mongoose.model("Cart", cartSchema);
// const ProductDetails = mongoose.model("ProductDetails", productDetailsSchema);
// const OrderHistory = mongoose.model("OrderHistory", orderHistorySchema);

module.exports = {
  User,
  Products,
  Orders,
  Cart,
};
