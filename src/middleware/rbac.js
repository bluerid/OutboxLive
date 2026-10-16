/**
 * Middleware to check user role(s)
 * @param {string|string[]} allowedRoles - Role or array of allowed roles
 * @returns {import('express').RequestHandler}
 */
export const checkRole = (allowedRoles) => {
    // Ensure allowedRoles is an array
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req, res, next) => {
        // If user is not authenticated, this middleware should come after authenticateToken
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized: No user attached to request' });
        }

        // Extract role from token payload (see auth.js for token structure)
        const userRole = req.user.user?.role;

        if (!userRole) {
            return res.status(403).json({ message: 'Forbidden: No role found' });
        }

        if (rolesArray.includes(userRole)) {
            next(); // Role is allowed, proceed
        } else {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
    };
};