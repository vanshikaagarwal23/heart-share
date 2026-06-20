const User = require("../models/User");
const jwt  = require("jsonwebtoken");

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

const validateRegisterInput = ({ name, email, password }) => {
  if (!name || name.trim().length < 2) return "Name must be at least 2 characters long";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Valid email is required";
  if (!password || password.length < 6) return "Password must be at least 6 characters long";
  return null;
};

const validateLoginInput = ({ email, password }) => {
  if (!email)    return "Email is required";
  if (!password) return "Password is required";
  return null;
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const validationError = validateRegisterInput({ name, email, password });
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const allowedRoles = ["donor", "ngo"];
    const userRole = allowedRoles.includes(role) ? role : "donor";

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ success: false, message: "An account with this email already exists" });

    const user  = await User.create({ name, email, password, role: userRole });
    const token = generateToken(user);

    res.status(201).json({ success: true, message: "Account created successfully", data: { user, token } });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const validationError = validateLoginInput({ email, password });
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });
    if (!user.isActive) return res.status(403).json({ success: false, message: "Account has been deactivated" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user);
    res.status(200).json({ success: true, message: "Login successful", data: { user, token } });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};