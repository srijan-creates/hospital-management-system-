const express = require("express");
const { createRole, getRoles, getRoleById, deleteRole, updateRole } = require("../controllers/roleController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// All role routes require admin authentication
router.post("/", authenticate, authorizeRoles("admin"), createRole);
router.get("/", authenticate, authorizeRoles("admin"), getRoles);
router.get("/:id", authenticate, authorizeRoles("admin"), getRoleById);
router.put("/:id", authenticate, authorizeRoles("admin"), updateRole);
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteRole);

module.exports = router;
