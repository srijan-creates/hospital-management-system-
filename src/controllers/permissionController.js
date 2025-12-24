const Permission = require("../models/permissionSchema");

async function createPermission(req, res) {
    try {
        const { name, group } = req.body;

        if (!name || !group) {
            return res.status(400).json({ success: false, message: "Name and group are required" });
        }

        const existing = await Permission.findOne({ name });
        if (existing) {
            return res.status(400).json({ success: false, message: "Permission already exists" });
        }

        const permission = await Permission.create({ name, group });

        return res.status(201).json({
            success: true,
            message: "Permission created successfully",
            permission
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function getPermissions(req, res) {
    try {
        const permissions = await Permission.find();
        return res.status(200).json({ success: true, permissions });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function getPermission(req, res) {
    try {
        const { id } = req.params;
        const permission = await Permission.findById(id);

        if (!permission) {
            return res.status(404).json({ success: false, message: "Permission not found" });
        }

        return res.status(200).json({ success: true, permission });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function updatePermission(req, res) {
    try {
        const { id } = req.params;
        const { name, group } = req.body;

        const permission = await Permission.findById(id);
        if (!permission) {
            return res.status(404).json({ success: false, message: "Permission not found" });
        }

        if (name) permission.name = name;
        if (group) permission.group = group;

        await permission.save();

        return res.status(200).json({
            success: true,
            message: "Permission updated successfully",
            permission
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function deletePermission(req, res) {
    try {
        const { id } = req.params;

        const permission = await Permission.findByIdAndDelete(id);

        if (!permission) {
            return res.status(404).json({ success: false, message: "Permission not found" });
        }

        return res.status(200).json({ success: true, message: "Permission deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

module.exports = { createPermission, getPermissions, getPermission, updatePermission, deletePermission };
