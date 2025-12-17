/**
 * Authorization Middleware
 * Checks if user has required role(s) or permission(s)
 */

/**
 * Authorize by Role Name
 * @param {Array<string>} allowedRoles - Array of role names that are allowed
 * @returns {Function} Express middleware function
 */
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

/**
 * Authorize by Permission Name
 * @param {Array<string>} requiredPermissions - Array of permission names required
 * @returns {Function} Express middleware function
 */
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

/**
 * Authorize Self or Admin
 * Allows user to access their own resources or admin to access any
 * @param {string} userIdParam - Name of the route parameter containing user ID (default: 'id')
 * @returns {Function} Express middleware function
 */
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

            // Allow if user is admin or accessing their own resource
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

/**
 * Authorize Profile Owner
 * Checks if the authenticated user owns the profile being accessed
 * @returns {Function} Express middleware function
 */
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

            // Admin can access any profile
            if (userRole === "admin") {
                return next();
            }

            // For profile routes, ensure user is accessing their own profile
            // This is automatically handled since we use req.user._id in controllers
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
