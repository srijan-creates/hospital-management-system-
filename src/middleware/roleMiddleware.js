function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required"
                });
            }

            if (!req.user.role) {
                return res.status(403).json({
                    success: false,
                    message: "User has no role assigned"
                });
            }

            const userRole = req.user.role.name;

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required roles: ${allowedRoles.join(", ")}. Your role: ${userRole}`
                });
            }

            next();

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Authorization failed",
                error: error.message
            });
        }
    };
}

function authorizePermissions(...requiredPermissions) {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required"
                });
            }

            if (!req.user.role || !req.user.role.permissions) {
                return res.status(403).json({
                    success: false,
                    message: "User has no permissions assigned"
                });
            }

            const userPermissions = req.user.role.permissions.map(p => p.name);

            const hasPermission = requiredPermissions.some(permission =>
                userPermissions.includes(permission)
            );

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required permissions: ${requiredPermissions.join(", ")}`
                });
            }

            next();

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Authorization failed",
                error: error.message
            });
        }
    };
}

function authorizeSelfOrAdmin(userIdParam = "id") {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required"
                });
            }

            const requestedUserId = req.params[userIdParam];
            const currentUserId = req.user._id.toString();
            const userRole = req.user.role?.name;

            if (userRole === "admin" || currentUserId === requestedUserId) {
                return next();
            }

            return res.status(403).json({
                success: false,
                message: "Access denied. You can only access your own resources."
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Authorization failed",
                error: error.message
            });
        }
    };
}

function authorizeProfileOwner() {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required"
                });
            }

            const userRole = req.user.role?.name;

            if (userRole === "admin") {
                return next();
            }

            next();

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Authorization failed",
                error: error.message
            });
        }
    };
}

module.exports = {
    authorizeRoles,
    authorizePermissions,
    authorizeSelfOrAdmin,
    authorizeProfileOwner
};
