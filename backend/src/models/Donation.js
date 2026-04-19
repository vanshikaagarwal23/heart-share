const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Donation title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Donation description is required"],
    },

    type: {
      type: String,
      enum: ["item", "money"],
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: [1, "Quantity must be at least 1"],
    },

    amount: {
      type: Number,
      default: 0,
      min: [0, "Amount cannot be negative"],
    },

    // 👤 Donor (User)
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🏢 NGO (assigned after acceptance)
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },

    pickupAddress: {
      type: String,
      required: function () {
        return this.type === "item";
      },
    },

    scheduledPickupDate: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);


// 🔒 Ensure valid state transitions
donationSchema.methods.canTransitionTo = function (newStatus) {
  const validTransitions = {
    pending: ["accepted", "rejected"],
    accepted: ["completed"],
    rejected: [],
    completed: [],
  };

  return validTransitions[this.status].includes(newStatus);
};


// 🧠 Pre-save logic for consistency
donationSchema.pre("save", function () {
  // If donation is completed, set completedAt
  if (this.isModified("status") && this.status === "completed") {
    this.completedAt = new Date();
  }

  // If type is money, quantity should not matter
  if (this.type === "money") {
    this.quantity = 0;
  }

  
});


module.exports = mongoose.model("Donation", donationSchema);
