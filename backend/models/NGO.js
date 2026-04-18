const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema(
  {
    // 🔗 Link to User (account)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: [true, "NGO name is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
    },

    address: {
      type: String,
      required: [true, "Address is required"],
    },

    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


// 🔍 Populate user info automatically when needed
ngoSchema.pre(/^find/, function (next) {
  this.populate("user", "name email role");
  next();
});


module.exports = mongoose.model("NGO", ngoSchema);