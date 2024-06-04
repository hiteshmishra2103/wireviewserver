const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // removes whitespace
  },
  description: String,
  thumbnail: String,
  price: {
    type: Number,
    required: true,
    min: 0,
  },
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
      default: "wireview Electronics",
    },
    Type: {
      type: String,
      default: "Watch",
    },
  },
  technicalSpecs: {
    type: String,
    default: JSON.stringify({
      Touch: "yes",
      health: "Advanced Health Sensors",
      Safety: "Crash detection",
      connect: "Stay Connected",
      Available: "Yes. Tens of thousands of apps from the store right at your wrist.",
    }),
  },
  DesignAndDurability: {
    type: String,
    default: JSON.stringify({
      Proface: ["Brilliant always-on", "Smooth and Seamless"],
      EdgeDesign: ["elegant", "Narrow border"],
      Display: ["Always-on display", "Retina LTPO OLED display"],
      Swimproof: ["Water resistant 50 meters", "Shallow water activities"],
    }),
  },
  Quantity: Number,
  published: Boolean,
  color: String,
});

const Products = mongoose.model('Products', productSchema);

module.exports = Products;
