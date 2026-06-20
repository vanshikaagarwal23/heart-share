const NGO      = require("../models/NGO");
const User     = require("../models/User");
const Donation = require("../models/Donation");
const Campaign = require("../models/Campaign");

exports.createNGO = async (req, res) => {
  try {
    const { name, description, address, contactNumber } = req.body;
    if (!name || !description || !address || !contactNumber)
      return res.status(400).json({ success: false, message: "All fields are required" });

    const existing = await NGO.findOne({ user: req.user._id });
    if (existing)
      return res.status(400).json({ success: false, message: "NGO profile already exists" });

    const ngo = await NGO.create({
      user: req.user._id,
      name: name.trim(), description: description.trim(),
      address: address.trim(), contactNumber: contactNumber.trim(),
    });
    res.status(201).json({ success: true, message: "NGO profile created successfully", data: ngo });
  } catch (error) {
    console.error("Create NGO error:", error.message);
    res.status(500).json({ success: false, message: "Failed to create NGO profile" });
  }
};

exports.getMyNGO = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ user: req.user._id });
    if (!ngo) return res.status(404).json({ success: false, message: "NGO profile not found" });
    res.status(200).json({ success: true, data: ngo });
  } catch (error) {
    console.error("Get my NGO error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch NGO profile" });
  }
};

exports.updateNGO = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ user: req.user._id });
    if (!ngo) return res.status(404).json({ success: false, message: "NGO profile not found" });
    const { name, description, address, contactNumber } = req.body;
    if (name)          ngo.name          = name.trim();
    if (description)   ngo.description   = description.trim();
    if (address)       ngo.address       = address.trim();
    if (contactNumber) ngo.contactNumber = contactNumber.trim();
    await ngo.save();
    res.status(200).json({ success: true, message: "NGO profile updated", data: ngo });
  } catch (error) {
    console.error("Update NGO error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update NGO profile" });
  }
};

exports.getAllNGOs = async (req, res) => {
  try {
    const ngos = await NGO.find().populate("user", "name email isActive createdAt");
    res.status(200).json({ success: true, count: ngos.length, data: ngos });
  } catch (error) {
    console.error("Get all NGOs error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch NGOs" });
  }
};

exports.verifyNGO = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id).populate("user", "name email");
    if (!ngo) return res.status(404).json({ success: false, message: "NGO not found" });
    ngo.isVerified = !ngo.isVerified;
    await ngo.save();
    res.status(200).json({
      success: true,
      message: ngo.isVerified ? "NGO verified successfully" : "NGO verification revoked",
      data: ngo,
    });
  } catch (error) {
    console.error("Verify NGO error:", error.message);
    res.status(500).json({ success: false, message: "Verification update failed" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error("Get all users error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user._id.toString() === req.user._id.toString())
      return res.status(400).json({ success: false, message: "Cannot deactivate your own account" });
    user.isActive = !user.isActive;
    await user.save();
    res.status(200).json({ success: true, message: user.isActive ? "User activated" : "User deactivated", data: user });
  } catch (error) {
    console.error("Toggle user status error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update user status" });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalNGOs, verifiedNGOs, totalDonations, totalCampaigns, donationAgg] = await Promise.all([
      User.countDocuments(),
      NGO.countDocuments(),
      NGO.countDocuments({ isVerified: true }),
      Donation.countDocuments(),
      Campaign.countDocuments(),
      Donation.aggregate([{ $match: { type: "money" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);
    res.status(200).json({
      success: true,
      data: {
        totalUsers, totalNGOs, verifiedNGOs,
        pendingNGOs: totalNGOs - verifiedNGOs,
        totalDonations, totalCampaigns,
        totalRaised: donationAgg[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Get admin stats error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch admin stats" });
  }
};
