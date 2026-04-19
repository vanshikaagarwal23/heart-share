const Volunteer = require("../models/Volunteer");
const Campaign = require("../models/Campaign");

exports.applyVolunteer = async (req, res) => {
  try {
    if (req.user.role !== "donor") {
      return res.status(403).json({
        success: false,
        message: "Only donors can volunteer",
      });
    }

    const { campaignId } = req.body;

    const existing = await Volunteer.findOne({
      user: req.user._id,
      campaign: campaignId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Already applied for this campaign",
      });
    }

    const volunteer = await Volunteer.create({
      user: req.user._id,
      campaign: campaignId,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Applied successfully",
      data: volunteer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to apply",
      error: error.message,
    });
  }
};

exports.getMyVolunteering = async (req, res) => {
  try {
    const data = await Volunteer.find({ user: req.user._id })
      .populate("campaign", "title goalAmount");

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch",
      error: error.message,
    });
  }
};

exports.getCampaignVolunteers = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    if (campaign.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const volunteers = await Volunteer.find({ campaign: campaign._id })
      .populate("user", "name email");

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

exports.updateVolunteerStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const volunteer = await Volunteer.findById(req.params.id)
      .populate("campaign");

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    if (volunteer.campaign.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    volunteer.status = status;
    await volunteer.save();

    res.status(200).json({
      success: true,
      message: "Status updated",
      data: volunteer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};