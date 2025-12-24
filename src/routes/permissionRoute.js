const express = require("express");
const { getPermissions, createPermission, updatePermission, deletePermission, getPermission } = require("../controllers/permissionController");

const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// All permission routes require admin authentication
router.get('/', authenticate, authorizeRoles("admin"), getPermissions);
router.get('/:id', authenticate, authorizeRoles("admin"), getPermission);
router.post('/', authenticate, authorizeRoles("admin"), createPermission);
router.put('/:id', authenticate, authorizeRoles("admin"), updatePermission);
router.delete('/:id', authenticate, authorizeRoles("admin"), deletePermission);

module.exports = router;
