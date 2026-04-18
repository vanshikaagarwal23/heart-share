const Donation = require("../models/Donation");
const NGO = require("../models/NGO");


// 📝 Create Donation (Donor only)
exports.createDonation = async (req, res) => {
  try {
    const { title, description, type, quantity, amount, pickupAddress } = req.body;

    if (req.user.role !== "donor") {
      return res.status(403).json({
        success: false,
        message: "Only donors can create donations",
      });
    }

    if (!title || !description || !type) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and type are required",
      });
    }

    if (type === "item" && !pickupAddress) {
      return res.status(400).json({
        success: false,
        message: "Pickup address is required for item donations",
      });
    }

    if (type === "money" && (!amount || amount <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required for money donations",
      });
    }

    const donation = await Donation.create({
      title,
      description,
      type,
      quantity,
      amount,
      pickupAddress,
      donor: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Donation created successfully",
      data: donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create donation",
      error: error.message,
    });
  }
};


// 📥 Get All Donations (Role-based)
exports.getDonations = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "donor") {
      filter.donor = req.user._id;
    }

    if (req.user.role === "ngo") {
      const ngoProfile = await NGO.findOne({ user: req.user._id });

      if (!ngoProfile) {
        return res.status(400).json({
          success: false,
          message: "NGO profile not found",
        });
      }

      filter = {
        $or: [
          { status: "pending" },
          { ngo: ngoProfile._id },
        ],
      };
    }

    const donations = await Donation.find(filter)
      .populate("donor", "name email")
      .populate("ngo");

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch donations",
      error: error.message,
    });
  }
};


// 🔄 Update Donation Status (NGO only)
exports.updateDonationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    if (req.user.role !== "ngo") {
      return res.status(403).json({
        success: false,
        message: "Only NGOs can update donation status",
      });
    }

    // 🔑 Fetch NGO profile
    const ngoProfile = await NGO.findOne({ user: req.user._id });

    if (!ngoProfile) {
      return res.status(400).json({
        success: false,
        message: "NGO profile not found",
      });
    }

    // 🚫 Only verified NGOs should accept donations
    if (status === "accepted" && !ngoProfile.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Only verified NGOs can accept donations",
      });
    }

    // Enforce valid transitions
    if (!donation.canTransitionTo(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${donation.status} to ${status}`,
      });
    }

    // Assign NGO correctly
    if (status === "accepted") {
      if (donation.ngo && donation.ngo.toString() !== ngoProfile._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Donation already accepted by another NGO",
        });
      }

      donation.ngo = ngoProfile._id;
    }

    donation.status = status;

    await donation.save();

    res.status(200).json({
      success: true,
      message: "Donation status updated successfully",
      data: donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update donation status",
      error: error.message,
    });
  }
};


// 📄 Get Single Donation
exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("donor", "name email")
      .populate("ngo");

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    if (
      req.user.role === "donor" &&
      donation.donor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (req.user.role === "ngo") {
      const ngoProfile = await NGO.findOne({ user: req.user._id });

      if (!ngoProfile) {
        return res.status(400).json({
          success: false,
          message: "NGO profile not found",
        });
      }

      if (
        donation.ngo &&
        donation.ngo.toString() !== ngoProfile._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch donation",
      error: error.message,
    });
  }
};