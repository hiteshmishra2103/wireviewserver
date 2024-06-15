const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require('./routes/categoryRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const stripeCheckoutRoutes = require("./routes/stripeCheckoutRoutes");
const meRoutes = require("./routes/meRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

// app.use(cors({ origin: process.env.URL }));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes

app.use("/me",meRoutes);
app.use("/auth", authRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/products", productRoutes);
app.use("/user", userRoutes);
app.use('/purchase', purchaseRoutes)
app.use('/category', categoryRoutes);
app.use("/create-checkout-session", stripeCheckoutRoutes);


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
  console.log("Connecting to database");

  handlerfunction();
}

app.listen(PORT, () => {
  console.log("Server is running on port 3001");
});
