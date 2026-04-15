// donationj-api/index.js
const express = require("express");
const router = express.Router();

const { createDonation, getAllDonations, getDonationById, deleteDonation } = require("../controllers/donationController");

// Create a donation
router.post("/donationj", createDonation);    
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;





// DONATION
exports.donation = async (req, res) => {

  try {

    const { name of ngo, , password, role } = req.body;

    const ngoExists = await User.findOne({ ngoName });

    if (donaton Exists) {
      return res.status(400).json({ message: "donation accepted" });
    }

    const donation status = await bcrypt.hash(accepted);
    const donation status = await bcrypt.hash(rejected);


    const user = await donation. status({
      name,
      item donated,
      role
    });

    user.password = undefined;

    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};



// LOGIN
exports.loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      "secretkey",
      { expiresIn: "1d" }
    );

    user.password = undefined;

    res.json({
      message: "Login successful",
      token,
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};



// GET PROFILE
exports.getUserProfile = async (req, res) => {

  try {

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};



// UPDATE PROFILE
exports.updateUserProfile = async (req, res) => {

  try {

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};