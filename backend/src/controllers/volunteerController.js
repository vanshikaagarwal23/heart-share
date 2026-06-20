const Volunteer = require("../models/Volunteer");
const Campaign  = require("../models/Campaign");

exports.applyVolunteer = async (req, res) => {
  try {
    if (req.user.role !== "donor") {
      return res.status(403).json({ success: false, message: "Only donors can apply to volunteer" });
    }
    const { campaignId, note } = req.body;
    if (!campaignId) return res.status(400).json({ success: false, message: "campaignId is required" });

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });
    if (!campaign.isActive) return res.status(400).json({ success: false, message: "Cannot volunteer for an inactive campaign" });

    const existing = await Volunteer.findOne({ user: req.user._id, campaign: campaignId });
    if (existing) return res.status(400).json({ success: false, message: "You have already applied for this campaign" });

    const volunteer = await Volunteer.create({ user: req.user._id, campaign: campaignId, note: note || "", status: "pending" });
    await volunteer.populate("campaign", "title goalAmount");

    res.status(201).json({ success: true, message: "Application submitted successfully", data: volunteer });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: "You have already applied for this campaign" });
    console.error("Apply volunteer error:", error.message);
    res.status(500).json({ success: false, message: "Failed to submit application" });
  }
};

exports.getMyVolunteering = async (req, res) => {
  try {
    const data = await Volunteer.find({ user: req.user._id })
      .populate("campaign", "title goalAmount isActive")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("Get my volunteering error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch your volunteer applications" });
  }
};

exports.getCampaignVolunteers = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });
    if (campaign.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view volunteers for this campaign" });
    }
    const volunteers = await Volunteer.find({ campaign: campaign._id })
      .populate("user", "name email").sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: volunteers.length, data: volunteers });
  } catch (error) {
    console.error("Get campaign volunteers error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch volunteers" });
  }
};

exports.updateVolunteerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be: approved or rejected" });
    }
    const volunteer = await Volunteer.findById(req.params.id).populate("campaign");
    if (!volunteer) return res.status(404).json({ success: false, message: "Volunteer application not found" });
    if (volunteer.campaign.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this application" });
    }
    if (volunteer.status !== "pending") {
      return res.status(400).json({ success: false, message: `Application is already ${volunteer.status}` });
    }
    volunteer.status = status;
    await volunteer.save();
    res.status(200).json({ success: true, message: `Volunteer application ${status}`, data: volunteer });
  } catch (error) {
    console.error("Update volunteer status error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update application status" });
  }
};

exports.updateVolunteerHours = async (req, res) => {
  try {
    const { hours } = req.body;
    if (hours === undefined || hours < 0) return res.status(400).json({ success: false, message: "Valid hours value is required" });
    const volunteer = await Volunteer.findById(req.params.id).populate("campaign");
    if (!volunteer) return res.status(404).json({ success: false, message: "Volunteer application not found" });
    if (volunteer.campaign.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    if (volunteer.status !== "approved") return res.status(400).json({ success: false, message: "Can only log hours for approved volunteers" });
    volunteer.hours = hours;
    await volunteer.save();
    res.status(200).json({ success: true, message: "Hours updated successfully", data: volunteer });
  } catch (error) {
    console.error("Update volunteer hours error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update hours" });
  }
};