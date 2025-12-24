require("dotenv").config();
const connectDb = require("../config/connectDb");
const Permission = require("../models/permissionSchema");
const Role = require("../models/roleSchema");
const permissionList = require("../constants/permissionList");
const roleList = require("../constants/roleList");

const seedData = async () => {
  await connectDb();

  try {
    for (const permission of permissionList) {
      const exists = await Permission.findOne({
        name: permission.name,
        group: permission.group
      });

      if (!exists) {
        await Permission.create(permission);
      }
    }
    console.log("Permissions seeded");

    for (const role of roleList) {
      const exists = await Role.findOne({ name: role.name });

      if (!exists) {
        await Role.create({
          name: role.name,
          profileModel: role.profileModel || null,
          permissions: [] 
        });
      }
    }
    console.log("Roles seeded");

    const roles = await Role.find();
    for (const role of roles) {
      const permissions = await Permission.find({ group: role.name });
      role.permissions = permissions.map(p => p._id);
      await role.save();
    }
    console.log("Permissions attached to roles");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
