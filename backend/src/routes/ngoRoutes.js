const express = require("express");
const router  = express.Router();
const { createNGO, getMyNGO, updateNGO, getAllNGOs, verifyNGO, getAllUsers, toggleUserStatus, getAdminStats } = require("../controllers/ngoController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/create",           protect, authorizeRoles("ngo"),   createNGO);
router.get("/me",                protect, authorizeRoles("ngo"),   getMyNGO);
router.patch("/me",              protect, authorizeRoles("ngo"),   updateNGO);
router.get("/all",               protect, authorizeRoles("admin"), getAllNGOs);
router.patch("/verify/:id",      protect, authorizeRoles("admin"), verifyNGO);
router.get("/users",             protect, authorizeRoles("admin"), getAllUsers);
router.patch("/users/:id/toggle",protect, authorizeRoles("admin"), toggleUserStatus);
router.get("/stats",             protect, authorizeRoles("admin"), getAdminStats);

module.exports = router;