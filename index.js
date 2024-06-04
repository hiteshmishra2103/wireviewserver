const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const { authenticateJwt } = require("./middleware/auth");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const authController = require('./controllers/authController')
const usercontroller = require('./controllers/usercontroller');
const { purchaseProducts } = require("./controllers/purchaseController");

const app = express();
const stripeSecretKey = process.env.STRIPE_KEY;
const PORT=process.env.PORT || 3001;

// app.use(cors({ origin: process.env.URL }));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
app.use("/auth", authRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/products", productRoutes);
app.use("/user", userRoutes);
app.use('/',purchaseProducts)



app.use((req, res, next) => {
  res.status(404).send("Not found");
});

if (mongoose.connection.readyState == 0) {
  async function handlerfunction() {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "wireviewdb",
    });
  }

  handlerfunction();
}

app.listen( PORT, () => {
  console.log("Server is running on port 3001");
});
