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
  // CREATE DONATION
exports.createDonation = async (req, res) => {
  try {
    const { donorName, amount, itemType, preparedAt } = req.body;
    // itemType: "food", "clothes", "study material"
    // preparedAt: timestamp (only relevant for food)

    // Validate required fields
    if (!donorName || !amount || !itemType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate item type
    const validTypes = ["food", "clothes", "study material"];
    if (!validTypes.includes(itemType)) {
      return res.status(400).json({ message: "Invalid item type" });
    }

    // Special validation for food
    if (itemType === "food" && !preparedAt) {
      return res.status(400).json({ message: "PreparedAt timestamp required for food donations" });
    }

    // Create donation
    const donation = await Donation.create({
      donorName,
      amount,
      itemType,
      status: "pending",
      preparedAt
    });

    res.status(201).json({
      message: "Donation created successfully",
      donation: {
        id: donation._id,
        donor: donation.donorName,
        amount: donation.amount,
        itemType: donation.itemType,
        status: donation.status,
        preparedAt: donation.preparedAt,
        createdAt: donation.createdAt
      }
    });

  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({ message: error.message });
  }
};
// DISPLAY ALL DONATIONS (LIST)
exports.getDonations = async (req, res) => {
  try {
    // Fetch all donations, newest first
    const donations = await Donation.find().sort({ createdAt: -1 });

    if (!donations || donations.length === 0) {
      return res.status(404).json({ message: "No donations found" });
    }

    res.status(200).json({
      message: "Donation list retrieved successfully",
      donations: donations.map(donation => ({
        id: donation._id,
        donor: donation.donorName,
        amount: donation.amount,
        itemType: donation.itemType,
        status: donation.status,
        preparedAt: donation.preparedAt,
        createdAt: donation.createdAt
      }))
    });

  } catch (error) {
    console.error("Error retrieving donations:", error);
    res.status(500).json({ message: error.message });
  }
};
// ACCEPT DONATION
exports.acceptDonation = async (req, res) => {
  try {
    const { donationId, itemType, preparedAt } = req.body;
    // itemType: "food", "clothes", "study material"
    // preparedAt: timestamp (only relevant for food)

    // Validate item type
    const validTypes = ["food", "clothes", "study material"];
    if (!validTypes.includes(itemType)) {
      return res.status(400).json({ message: "Invalid item type" });
    }

    // Find donation
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Prevent duplicate handling
    if (donation.status !== "pending") {
      return res.status(400).json({ message: "Donation already processed" });
    }

    // Special rule for food donations
    if (itemType === "food") {
      if (!preparedAt) {
        return res.status(400).json({ message: "PreparedAt timestamp required for food donations" });
      }

      const hoursSincePrepared = (Date.now() - new Date(preparedAt)) / (1000 * 60 * 60);
      if (hoursSincePrepared > 24) {
        donation.status = "rejected";
        donation.itemType = "food";
        await donation.save();
        return res.status(200).json({
          message: "Food donation rejected (prepared more than 24 hrs ago)",
          donation: {
            id: donation._id,
            donor: donation.donorName,
            amount: donation.amount,
            itemType: donation.itemType,
            status: donation.status,
            preparedAt: donation.preparedAt,
            createdAt: donation.createdAt
          }
        });
      }
    }

    // Accept donation
    donation.status = "accepted";
    donation.itemType = itemType;
    donation.preparedAt = preparedAt || donation.preparedAt;

    await donation.save();

    res.status(200).json({
      message: "Donation accepted successfully",
      donation: {
        id: donation._id,
        donor: donation.donorName,
        amount: donation.amount,
        itemType: donation.itemType,
        status: donation.status,
        preparedAt: donation.preparedAt,
        createdAt: donation.createdAt
      }
    });

  } catch (error) {
    console.error("Error accepting donation:", error);
    res.status(500).json({ message: error.message });
  }
};// REJECT DONATION
exports.rejectDonation = async (req, res) => {
  try {
    const { donationId, itemType, preparedAt } = req.body;
    // itemType: "food", "clothes", "study material"
    // preparedAt: timestamp (only relevant for food)

    // Validate item type
    const validTypes = ["food", "clothes", "study material"];
    if (!validTypes.includes(itemType)) {
      return res.status(400).json({ message: "Invalid item type" });
    }

    // Find donation
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Prevent duplicate handling
    if (donation.status !== "pending") {
      return res.status(400).json({ message: "Donation already processed" });
    }

    // Special rule for food donations
    if (itemType === "food") {
      if (!preparedAt) {
        return res.status(400).json({ message: "PreparedAt timestamp required for food donations" });
      }

      const hoursSincePrepared = (Date.now() - new Date(preparedAt)) / (1000 * 60 * 60);
      if (hoursSincePrepared > 24) {
        donation.status = "rejected";
        donation.itemType = "food";
        donation.preparedAt = preparedAt;
        await donation.save();
        return res.status(200).json({
          message: "Food donation rejected (prepared more than 24 hrs ago)",
          donation: {
            id: donation._id,
            donor: donation.donorName,
            amount: donation.amount,
            itemType: donation.itemType,
            status: donation.status,
            preparedAt: donation.preparedAt,
            createdAt: donation.createdAt
          }
        });
      }
    }

    // Reject donation (normal case)
    donation.status = "rejected";
    donation.itemType = itemType;
    donation.preparedAt = preparedAt || donation.preparedAt;

    await donation.save();

    res.status(200).json({
      message: "Donation rejected successfully",
      donation: {
        id: donation._id,
        donor: donation.donorName,
        amount: donation.amount,
        itemType: donation.itemType,
        status: donation.status,
        preparedAt: donation.preparedAt,
        createdAt: donation.createdAt
      }
    });

  } catch (error) {
    console.error("Error rejecting donation:", error);
    res.status(500).json({ message: error.message });
  }
};
// DONATION HISTORY
exports.getDonationHistory = async (req, res) => {
  try {
    // Fetch all donations, newest first
    const donations = await Donation.find().sort({ createdAt: -1 });

    if (!donations || donations.length === 0) {
      return res.status(404).json({ message: "No donation history found" });
    }

    res.status(200).json({
      message: "Donation history retrieved successfully",
      donations: donations.map(donation => ({
        id: donation._id,
        donor: donation.donorName,
        amount: donation.amount,
        itemType: donation.itemType,
        status: donation.status,
        preparedAt: donation.preparedAt,
        createdAt: donation.createdAt
      }))
    });

  } catch (error) {
    console.error("Error retrieving donation history:", error);
    res.status(500).json({ message: error.message });
  }
};
