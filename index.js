const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticate, authenticateJwt } = require("./middleware/auth");
const { User, Products, Orders, Cart } = require("./db/db");
const { statSync, readSync } = require("fs");
app.use(express.static("public"));
const dotenv = require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const stripeSecretKey = process.env.STRIPE_KEY;
const PORT = process.env.PORT || 3001;

const stripe = require("stripe")(stripeSecretKey);

app.use(cors());
app.use(express.json());
app.get("/search", async (req, res) => {
  const q = req.query.q;

  try {
    const products = await Products.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { color: { $regex: q, $options: "i" } },
      ],
    }).limit(4);

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/me", authenticateJwt, async (req, res) => {
  //use error handling also

  const user = await User.findOne({ username: req.user.username });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ user });
});

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  const user = await User.findOne({ username });
  if (user) {
    res.status(403).json({ message: "User already exists" });
  } else {
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    const token = jwt.sign({ username, password }, JWT_SECRET, {
      expiresIn: "72h",
    });
    res.json({ message: "User created successfullly!", token });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  // Find the user by username
  const user = await User.findOne({ username });

  if (user) {
    // Compare the provided password with the hashed password in the database
    const isPasswordValid = bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      // Password is valid, generate a JWT token
      const token = jwt.sign({ username, role: "user" }, JWT_SECRET, {
        expiresIn: "72h",
      });
      res.json({ message: "Logged in successfully", token });
    } else {
      // Password is invalid
      res.status(403).json({ message: "Invalid username or password" });
    }
  } else {
    // User not found
    res.status(403).json({ message: "Invalid username or password" });
  }
});

app.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  if (!username || !password) {
    return res.status(403).json({ message: "Invalid username or password" });
  }
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(403).json({ message: "User does not exists" });
  }
  if (!user.isAdmin) {
    return res.status(403).json({ message: "You are not an admin!" });
  }
  if (user.isAdmin) {
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const token = jwt.sign({ username, role: "admin" }, JWT_SECRET, {
        expiresIn: "72h",
      });
      res.json({
        message: "Logged in successfully",
        token,
        username,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(403).json({ message: "Invalid username or password" });
    }
  }
});

app.get("/cart", authenticateJwt, async (req, res) => {
  const user = await User.findOne({ username: req.user.username });
  if (!user) {
    res
      .status(404)
      .json({ message: "User not found, create a new user or login!" });
  }
  const cart = await Cart.findOne({ user: user._id }).populate(
    "products.product"
  );
  if (!cart) {
    res.status(404).json({ message: "Cart not found" });
  } else {
    res.json({ cart });
  }
});

app.get("/cartQuantity", authenticateJwt, async (req, res) => {
  const user = await User.findOne({ username: req.user.username });
  console.log(user);
  const cartQuantity = await Cart.findOne({ user: user._id }).select(
    "totalQuantity"
  );
  if (!cartQuantity) {
    res.status(404).json({ message: "Cart not found" });
  } else {
    res.json({ cartQuantity });
  }
});

app.delete("/deleteFromCart/:productId", authenticateJwt, async (req, res) => {
  try {
    const productId = new mongoose.Types.ObjectId(req.params.productId);
    const user = await User.findOne({ username: req.user.username });
    const cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
    } else {
      const productInCart = cart.products.find(
        (p) => p.product.toString() == productId.toString()
      );
      if (productInCart) {
        const productDetails = await Products.findById(productId);
        cart.totalPrice -= productInCart.quantity * productDetails.price;
        cart.totalQuantity -= productInCart.quantity;
        await cart.save();
        await Cart.findOneAndUpdate(
          { user: user._id },
          { $pull: { products: { product: productId } } }
        );
        res.json({ message: "Product deleted from cart successfully" });
      } else {
        res.status(404).json({ message: "Product not found in cart" });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting product from cart" });
  }
});

app.post("/addToCart", authenticateJwt, async (req, res) => {
  const { productId, quantity, price } = req.body;
  const user = await User.findOne({ username: req.user.username });
  const product = await Products.findById(productId);

  if (!user) {
    res.status(403).json({ message: "User not found" });
  } else {
    if (!product) {
      res.status(403).json({ message: "Product not found" });
    }
    const cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      const newCart = new Cart({
        user: user._id,
        products: [{ product: productId, quantity }],
        totalPrice: quantity * price,
        totalQuantity: quantity,
      });
      await newCart.save();
    } else {
      const productInCart = cart.products.find((p) => p.product == productId);
      if (productInCart) {
        productInCart.quantity += quantity;
        cart.totalPrice += quantity * price;
        cart.totalQuantity += quantity;
      } else {
        cart.products.push({
          product: productId,
          quantity: quantity,
        });
        cart.totalPrice += quantity * price;
        cart.totalQuantity += quantity;
      }
      await cart.save();
    }
    res.json({ message: "Product added to cart successfully" });
  }
});

//create a route for adding a product by admin
app.post("/addproduct", authenticateJwt, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      console.log("User does not exists");
      return res.status(403).json({ message: "User does not exists" });
    }
    if (!user.isAdmin) {
      console.log("You are not an admin!");
      return res.status(403).json({ message: "You are not an admin!" });
    }

    const {
      productName,
      productDescription,
      productPrice,
      productCategory,
      productColor,
      productQuantity,
      productMediaUrl,
      thUrl,
      published,
    } = req.body;

    if (
      !productName ||
      !productDescription ||
      !productPrice ||
      !productCategory ||
      !productColor ||
      !productQuantity ||
      !productMediaUrl ||
      !thUrl
    ) {
      return res.status(403).json({ message: "Please fill all the fields" });
    } else {
      const newProduct = new Products({
        name: productName,
        description: productDescription,
        price: productPrice,
        category: productCategory,
        thumbnail: thUrl,
        color: productColor,
        Quantity: productQuantity,
        mediaurl: productMediaUrl,
        published: published,
      });
      const savedProduct = await newProduct.save();
      if (published) {
        return res
          .status(201)
          .json({ savedProduct, message: "Product saved successfully" });
      } else {
        res
          .status(201)
          .json({ savedProduct, message: "Product added successfully" });
      }
    }
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "An error occurred while adding the product" });
  }
});

app.put("/updateproduct/:id", authenticateJwt, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      console.log("User does not exist");
      return res.status(403).json({ message: "User does not exist" });
    }
    if (!user.isAdmin) {
      console.log("You are not an admin!");
      return res.status(403).json({ message: "You are not an admin!" });
    }

    const {
      productName,
      productDescription,
      productPrice,
      productCategory,
      productColor,
      productQuantity,
      productMediaUrl,
      thUrl,
      published,
    } = req.body;

    const product = await Products.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = productName;
    product.description = productDescription;
    product.price = productPrice;
    product.category = productCategory;
    product.color = productColor;
    product.quantity = productQuantity;
    product.mediaurl = productMediaUrl;
    product.thumbnail = thUrl;
    product.published = published;

    const updatedProduct = await product.save();

    res
      .status(200)
      .json({ updatedProduct, message: "Product updated successfully" });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "An error occurred while updating the product" });
  }
});

app.get("/products", async (req, res) => {
  const products = await Products.find({ published: true });
  console.log(products);
  res.json({ products });
});

app.get("/category/:category", async (req, res) => {
  const category = req.params.category;
  console.log(category);
  const products = await Products.find({ category, published: true });
  res.json({ products });
});

app.get("/products/:productId", async (req, res) => {
  console.log("asdf");
  const productId = req.params.productId;
  console.log(productId + "hello");

  const product = await Products.findById(productId);
  console.log(product);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  return res.json(product);
});

//quick purchase
//route for purchasing a product
app.post("/purchase", authenticateJwt, async (req, res) => {
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
});

app.post("/create-checkout-session", authenticateJwt, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { product } = req.body;

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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.URL}/success`,
      cancel_url: `${process.env.URL}/cancel`,
    });

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

    await newOrder.save();

    await User.findByIdAndUpdate(
      user._id,
      { $push: { ordersHistory: newOrder._id } },
      { new: true }
    );

    await Cart.findOneAndUpdate(
      { user: user._id },
      { $set: { products: [], totalQuantity: 0, totalPrice: 0 } },
      { new: true }
    );

    res.status(200).json({ session });
  } catch (error) {
    console.log(error);
  }
});

//create a route for fetching all the orders from the ordersschema

app.get("/orders", authenticateJwt, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.isAdmin) {
      return res.status(403).json({ message: "You are not an admin!" });
    }
    const orders = await Orders.find({})
      .populate("products.product")
      .sort({ date: -1 });
    res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

//create a route for updating the status of the order
app.put("/updateOrderStatus/:orderId", authenticateJwt, async (req, res) => {
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
});

app.get("/orderHistory", authenticateJwt, async (req, res) => {
  try {
    const usern = req.user.username;
    const user = await User.findOne({ username: usern })
      .select("-isAdmin -password") // Exclude isAdmin and password fields
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
    console.log("Server error");
    res.status(500).send("Server error");
  }
});

app.use((req, res, next) => {
  res.status(404).send("Not found");
});

if (mongoose.connection.readyState == 0) {
  // 0 = disconnected
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

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
