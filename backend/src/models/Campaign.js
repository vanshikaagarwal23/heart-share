const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Campaign title is required"],
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      required: [true, "Campaign description is required"],
    },

    goalAmount: {
      type: Number,
      required: [true, "Goal amount is required"],
      min: [1, "Goal must be greater than 0"],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Campaign", campaignSchema);