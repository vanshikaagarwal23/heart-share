const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");

// 📥 Get all campaigns with stats
exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find();

    const enriched = await Promise.all(
      campaigns.map(async (c) => {
        const donations = await Donation.find({ campaign: c._id });

        const total = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

        return {
          ...c.toObject(),
          raised: total,
          donationsCount: donations.length,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch campaigns",
      error: error.message,
    });
  }
};

// 📄 Get single campaign
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    const donations = await Donation.find({ campaign: campaign._id });

    res.status(200).json({
      success: true,
      data: {
        campaign,
        donations,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch campaign",
      error: error.message,
    });
  }
};