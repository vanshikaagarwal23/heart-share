const User = require("../models/User");
const jwt = require("jsonwebtoken");


// 🔐 Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};


// 🔎 Validation Helpers
const validateRegisterInput = ({ name, email, password }) => {
  if (!name || name.trim().length < 2) {
    return "Name must be at least 2 characters long";
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || !emailRegex.test(email)) {
    return "Valid email is required";
  }

  if (!password || password.length < 6) {
    return "Password must be at least 6 characters long";
  }

  return null;
};


const validateLoginInput = ({ email, password }) => {
  if (!email) return "Email is required";
  if (!password) return "Password is required";
  return null;
};


// 📝 Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const validationError = validateRegisterInput({ name, email, password });
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const allowedRoles = ["donor", "ngo"];
    const userRole = allowedRoles.includes(role) ? role : "donor";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // ✅ Create user ONLY
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("🔥 REGISTER ERROR FULL:", error);
  console.error("🔥 MESSAGE:", error.message);
  console.error("🔥 STACK:", error.stack);

  res.status(500).json({
    success: false,
    message: error.message,
  });
};


// 🔑 Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Structured validation
    const validationError = validateLoginInput({ email, password });
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};


// 👤 Get Current User
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};