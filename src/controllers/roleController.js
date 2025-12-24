const Role = require("../models/roleSchema");
const Permission = require("../models/permissionSchema");

async function createRole(req, res) {
    try {
        const { name, permissions } = req.body;

        if (!name)
            return res.status(400).json({ success: false, message: "Role name is required" });

        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ success: false, message: "Role already exists" });
        }

        let permissionIds = [];
        if (permissions && Array.isArray(permissions) && permissions.length > 0) {
            const perms = await Permission.find({
                $or: [
                    { _id: { $in: permissions.filter(p => typeof p === 'string' && p.match(/^[0-9a-fA-F]{24}$/)) } },
                    { name: { $in: permissions } }
                ]
            });
            permissionIds = perms.map(p => p._id);
        }

        const newRole = await Role.create({
            name,
            permissions: permissionIds
        });

        const populatedRole = await Role.findById(newRole._id).populate("permissions");

        return res.status(201).json({
            success: true,
            message: "Role created successfully",
            role: populatedRole
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function getRoles(req, res) {
    try {
        const roles = await Role.find().populate("permissions");
        return res.status(200).json({ success: true, roles });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function getRoleById(req, res) {
    try {
        const { id } = req.params;
        const role = await Role.findById(id).populate("permissions");

        if (!role) {
            return res.status(404).json({ success: false, message: "Role not found" });
        }

        return res.status(200).json({ success: true, role });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function updateRole(req, res) {
    try {
        const { id } = req.params;
        const { name, permissions } = req.body;

        const role = await Role.findById(id);
        if (!role) {
            return res.status(404).json({ success: false, message: "Role not found" });
        }

        if (name) role.name = name;

        if (permissions) {
            const perms = await Permission.find({
                $or: [
                    { _id: { $in: permissions.filter(p => typeof p === 'string' && p.match(/^[0-9a-fA-F]{24}$/)) } },
                    { name: { $in: permissions } }
                ]
            });
            role.permissions = perms.map(p => p._id);
        }

        await role.save();

        const updatedRole = await Role.findById(id).populate("permissions");

        return res.status(200).json({ success: true, message: "Role updated successfully", role: updatedRole });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function deleteRole(req, res) {
    try {
        const { id } = req.params;

        const role = await Role.findByIdAndDelete(id);

        if (!role) {
            return res.status(404).json({ success: false, message: "Role not found" });
        }

        return res.status(200).json({ success: true, message: "Role deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

module.exports = { createRole, getRoles, getRoleById, updateRole, deleteRole };
