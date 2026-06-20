const Donation = require("../models/Donation");
const NGO      = require("../models/NGO");
const Campaign = require("../models/Campaign");

async function getNGOProfile(userId, res) {
  const ngoProfile = await NGO.findOne({ user: userId });
  if (!ngoProfile) {
    res.status(400).json({ success: false, message: "NGO profile not found. Please create your NGO profile first." });
    return null;
  }
  return ngoProfile;
}

exports.createDonation = async (req, res) => {
  try {
    const { title, description, type, quantity, amount, pickupAddress, scheduledPickupDate, campaignId } = req.body;

    if (!title || !description || !type)
      return res.status(400).json({ success: false, message: "Title, description, and type are required" });

    if (!["item", "money"].includes(type))
      return res.status(400).json({ success: false, message: "Type must be 'item' or 'money'" });

    if (type === "item" && !pickupAddress)
      return res.status(400).json({ success: false, message: "Pickup address is required for item donations" });

    if (type === "money" && (!amount || Number(amount) <= 0))
      return res.status(400).json({ success: false, message: "A valid amount greater than 0 is required for money donations" });

    let campaign = null;
    if (campaignId) {
      campaign = await Campaign.findById(campaignId);
      if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });
      if (!campaign.isActive) return res.status(400).json({ success: false, message: "Cannot donate to an inactive campaign" });
    }

    const donation = await Donation.create({
      title, description, type,
      quantity: type === "item" ? (quantity || 1) : 0,
      amount:   type === "money" ? Number(amount) : 0,
      pickupAddress: type === "item" ? pickupAddress : undefined,
      scheduledPickupDate: scheduledPickupDate || undefined,
      donor: req.user._id,
      campaign: campaign?._id || null,
    });

    res.status(201).json({ success: true, message: "Donation created successfully", data: donation });
  } catch (error) {
    console.error("Create donation error:", error.message);
    res.status(500).json({ success: false, message: "Failed to create donation" });
  }
};

exports.getDonations = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "donor") {
      filter.donor = req.user._id;
    } else if (req.user.role === "ngo") {
      const ngoProfile = await getNGOProfile(req.user._id, res);
      if (!ngoProfile) return;
      filter = { $or: [{ status: "pending" }, { ngo: ngoProfile._id }] };
    }

    const donations = await Donation.find(filter)
      .populate("donor", "name email")
      .populate("ngo", "name")
      .populate("campaign", "title goalAmount")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: donations.length, data: donations });
  } catch (error) {
    console.error("Get donations error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch donations" });
  }
};

exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("donor", "name email")
      .populate("ngo", "name contactNumber")
      .populate("campaign", "title goalAmount");

    if (!donation) return res.status(404).json({ success: false, message: "Donation not found" });

    if (req.user.role === "donor" && donation.donor._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Access denied" });

    if (req.user.role === "ngo") {
      const ngoProfile = await getNGOProfile(req.user._id, res);
      if (!ngoProfile) return;
      const isAssigned = donation.ngo?._id?.toString() === ngoProfile._id.toString();
      if (!isAssigned && donation.status !== "pending")
        return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, data: donation });
  } catch (error) {
    console.error("Get donation by id error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch donation" });
  }
};

// NGOs act on their own behalf (must own an NGO profile, and can only ever
// assign/complete donations for that profile). Admins act as moderators:
// they don't need an NGO profile of their own, can reject or force-complete
// any donation, and can accept on behalf of a specific NGO by passing
// `ngoId` explicitly (since there's no implicit NGO tied to an admin account).
exports.updateDonationStatus = async (req, res) => {
  try {
    const { status, rejectionReason, ngoNote, scheduledPickupDate, ngoId } = req.body;
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: "Donation not found" });

    const isAdmin = req.user.role === "admin";

    let ngoProfile = null;
    if (!isAdmin) {
      ngoProfile = await getNGOProfile(req.user._id, res);
      if (!ngoProfile) return;
    }

    if (status === "accepted") {
      if (isAdmin) {
        if (!ngoId)
          return res.status(400).json({ success: false, message: "ngoId is required for an admin to accept a donation on behalf of an NGO" });
        ngoProfile = await NGO.findById(ngoId);
        if (!ngoProfile)
          return res.status(404).json({ success: false, message: "NGO not found" });
      }
      if (!ngoProfile.isVerified)
        return res.status(403).json({ success: false, message: "Only verified NGOs can accept donations" });
      if (!donation.canTransitionTo("accepted"))
        return res.status(400).json({ success: false, message: `Cannot move from '${donation.status}' to 'accepted'` });
      if (donation.ngo && donation.ngo.toString() !== ngoProfile._id.toString())
        return res.status(400).json({ success: false, message: "This donation has already been accepted by another NGO" });
      donation.ngo = ngoProfile._id;
      donation.status = "accepted";
      if (ngoNote) donation.ngoNote = ngoNote;
      if (scheduledPickupDate && donation.type === "item") donation.scheduledPickupDate = scheduledPickupDate;
    } else if (status === "rejected") {
      if (donation.status !== "pending")
        return res.status(400).json({ success: false, message: "Only pending donations can be rejected" });
      if (donation.ngo)
        return res.status(400).json({ success: false, message: "Cannot reject an already-accepted donation" });
      donation.status = "rejected";
      donation.rejectionReason = rejectionReason || "";
    } else if (status === "completed") {
      if (!donation.canTransitionTo("completed"))
        return res.status(400).json({ success: false, message: `Cannot move from '${donation.status}' to 'completed'` });
      // NGOs may only complete their own assigned donation; admins may force-complete any.
      if (!isAdmin && (!donation.ngo || donation.ngo.toString() !== ngoProfile._id.toString()))
        return res.status(403).json({ success: false, message: "Only the assigned NGO can mark this donation as completed" });
      donation.status = "completed";
    } else {
      return res.status(400).json({ success: false, message: "Invalid status. Must be: accepted, rejected, or completed" });
    }

    await donation.save();
    res.status(200).json({ success: true, message: `Donation ${status} successfully`, data: donation });
  } catch (error) {
    console.error("Update donation status error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update donation status" });
  }
};