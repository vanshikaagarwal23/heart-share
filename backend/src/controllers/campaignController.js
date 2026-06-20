const Campaign  = require("../models/Campaign");
const mongoose  = require("mongoose");

exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.aggregate([
      { $lookup: { from: "donations", localField: "_id", foreignField: "campaign", as: "donations" } },
      { $addFields: { raised: { $sum: "$donations.amount" }, donationsCount: { $size: "$donations" } } },
      { $project: { donations: 0 } },
      { $sort: { createdAt: -1 } },
    ]);
    res.status(200).json({ success: true, count: campaigns.length, data: campaigns });
  } catch (error) {
    console.error("Get campaigns error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch campaigns" });
  }
};

exports.getCampaignById = async (req, res) => {
  try {
    const [result] = await Campaign.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      { $lookup: { from: "donations", localField: "_id", foreignField: "campaign", as: "donations" } },
      { $addFields: { raised: { $sum: "$donations.amount" }, donationsCount: { $size: "$donations" } } },
      { $project: { donations: 0 } },
    ]);
    if (!result) return res.status(404).json({ success: false, message: "Campaign not found" });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Get campaign by id error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch campaign" });
  }
};

exports.createCampaign = async (req, res) => {
  try {
    const { title, description, goalAmount } = req.body;
    if (!title || title.trim().length < 3)
      return res.status(400).json({ success: false, message: "Campaign title must be at least 3 characters" });
    if (!description || description.trim().length < 10)
      return res.status(400).json({ success: false, message: "Campaign description must be at least 10 characters" });
    if (!goalAmount || Number(goalAmount) < 1)
      return res.status(400).json({ success: false, message: "Goal amount must be greater than 0" });

    const campaign = await Campaign.create({ title: title.trim(), description: description.trim(), goalAmount: Number(goalAmount), createdBy: req.user._id });
    res.status(201).json({ success: true, message: "Campaign created successfully", data: { ...campaign.toObject(), raised: 0, donationsCount: 0 } });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: "A campaign with this title already exists" });
    console.error("Create campaign error:", error.message);
    res.status(500).json({ success: false, message: "Failed to create campaign" });
  }
};

exports.toggleCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });
    if (campaign.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });
    campaign.isActive = !campaign.isActive;
    await campaign.save();
    res.status(200).json({ success: true, message: `Campaign ${campaign.isActive ? "activated" : "deactivated"}`, data: campaign });
  } catch (error) {
    console.error("Toggle campaign error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update campaign" });
  }
};

// Lets the campaign's creator fix a typo or adjust the goal after creation —
// toggleCampaign only ever flips isActive, it never touched these fields.
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });
    if (campaign.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    const { title, description, goalAmount } = req.body;

    if (title !== undefined) {
      if (!title.trim() || title.trim().length < 3)
        return res.status(400).json({ success: false, message: "Campaign title must be at least 3 characters" });
      campaign.title = title.trim();
    }
    if (description !== undefined) {
      if (!description.trim() || description.trim().length < 10)
        return res.status(400).json({ success: false, message: "Campaign description must be at least 10 characters" });
      campaign.description = description.trim();
    }
    if (goalAmount !== undefined) {
      if (!goalAmount || Number(goalAmount) < 1)
        return res.status(400).json({ success: false, message: "Goal amount must be greater than 0" });
      campaign.goalAmount = Number(goalAmount);
    }

    await campaign.save();
    res.status(200).json({ success: true, message: "Campaign updated successfully", data: campaign });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: "A campaign with this title already exists" });
    console.error("Update campaign error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update campaign" });
  }
};