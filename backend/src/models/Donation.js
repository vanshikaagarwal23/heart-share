const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Donation title is required"], trim: true },
    description: { type: String, required: [true, "Donation description is required"], trim: true },
    type: { type: String, enum: ["item", "money"], required: [true, "Donation type is required"] },
    quantity: { type: Number, default: 1 },
    amount: { type: Number, default: 0, min: [0, "Amount cannot be negative"] },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: "NGO", default: null },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", default: null },
    status: { type: String, enum: ["pending", "accepted", "rejected", "completed"], default: "pending" },
    pickupAddress: {
      type: String,
      required: function () { return this.type === "item"; },
    },
    scheduledPickupDate: { type: Date },
    completedAt: { type: Date },
    rejectionReason: { type: String, trim: true, default: "" },
    ngoNote: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

donationSchema.index({ donor: 1, createdAt: -1 });
donationSchema.index({ status: 1 });
donationSchema.index({ ngo: 1, status: 1 });
donationSchema.index({ campaign: 1 });

donationSchema.methods.canTransitionTo = function (newStatus) {
  const validTransitions = {
    pending: ["accepted", "rejected"],
    accepted: ["completed"],
    rejected: [],
    completed: [],
  };
  return validTransitions[this.status]?.includes(newStatus) ?? false;
};

donationSchema.pre("save", function () {
  if (this.isModified("status") && this.status === "completed") this.completedAt = new Date();
  if (this.type === "money") this.quantity = 0;
  
});

module.exports = mongoose.model("Donation", donationSchema);