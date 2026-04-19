const Volunteer = require("../models/Volunteer");
const Campaign = require("../models/Campaign");

// 📥 Get all volunteers
exports.getVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find()
      .populate("user", "name email")
      .populate("campaigns", "title");

    res.status(200).json({
      success: true,
      data: volunteers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch volunteers",
      error: error.message,
    });
  }
};

// 📝 Create volunteer profile
exports.createVolunteer = async (req, res) => {
  try {
    const existing = await Volunteer.findOne({ user: req.user._id });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Volunteer profile already exists",
      });
    }

    const volunteer = await Volunteer.create({
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Volunteer created",
      data: volunteer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create volunteer",
      error: error.message,
    });
  }
};

// 🔗 Assign campaign
exports.assignCampaign = async (req, res) => {
  try {
    const { campaignId } = req.body;

    const volunteer = await Volunteer.findOne({ user: req.user._id });

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    if (!volunteer.campaigns.includes(campaignId)) {
      volunteer.campaigns.push(campaignId);
    }

    await volunteer.save();

    res.status(200).json({
      success: true,
      message: "Campaign assigned",
      data: volunteer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Assignment failed",
      error: error.message,
    });
  }
};