const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");


const JWT_SECRET = process.env.JWT_SECRET;

const signup = async (req, res) => {
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
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  const user = await User.findOne({ username });

  if (user) {
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const token = jwt.sign({ username, role: "user" }, JWT_SECRET, {
        expiresIn: "72h",
      });
      res.json({ message: "Logged in successfully", token });
    } else {
      res.status(403).json({ message: "Invalid username or password" });
    }
  } else {
    res.status(403).json({ message: "Invalid username or password" });
  }
};

const adminLogin = async (req, res) => {
  const { username, password } = req.body;
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
};

module.exports = {
  signup,
  login,
  adminLogin,
};
