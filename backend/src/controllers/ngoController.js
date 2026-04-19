const NGO = require("../models/NGO");

// 📝 Create NGO Profile
exports.createNGO = async (req, res) => {
  try {
    const { name, description, address, contactNumber } = req.body;

    // Only NGO users allowed
    if (req.user.role !== "ngo") {
      return res.status(403).json({
        success: false,
        message: "Only users with NGO role can create NGO profile",
      });
    }

    // Check if already exists
    const existingNGO = await NGO.findOne({ user: req.user._id });

    if (existingNGO) {
      return res.status(400).json({
        success: false,
        message: "NGO profile already exists",
      });
    }

    // Validation
    if (!name || !description || !address || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const ngo = await NGO.create({
      user: req.user._id,
      name,
      description,
      address,
      contactNumber,
    });

    res.status(201).json({
      success: true,
      message: "NGO profile created successfully",
      data: ngo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create NGO profile",
      error: error.message,
    });
  }
};