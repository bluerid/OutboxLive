/**
 * Middleware to check if the logged-in user owns a resource
 * @param {string} modelName - The model name (e.g., 'Post', 'User')
 * @param {string} ownerField - The field in the model that references the owner (default: 'author' for Post, '_id' for User)
 * @returns {import('express').RequestHandler}
 */
export const checkOwnership = (modelName, ownerField = 'author') => {
    return async (req, res, next) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'Resource ID is required' });
            }

            // Import the model dynamically to avoid circular dependencies
            let Model;
            if (modelName === 'Post') {
                const Post = require('../models/post.js').default;
                Model = Post;
            } else if (modelName === 'User') {
                const User = require('../models/user.js').default;
                Model = User;
            } else {
                return res.status(500).json({ message: 'Ownership check not supported for this model' });
            }

            // Find the resource by ID
            const resource = await Model.findById(id);
            if (!resource) {
                return res.status(404).json({ message: `${modelName} not found` });
            }

            // Determine the owner ID based on the ownerField
            let ownerId;
            if (ownerField === '_id') {
                ownerId = resource._id;
            } else {
                // For references like author, we need to get the value
                ownerId = resource.get(ownerField);
                // If it's an ObjectId, convert to string for comparison
                if (ownerId && ownerId._id) {
                    ownerId = ownerId._id.toString();
                } else if (ownerId) {
                    ownerId = ownerId.toString();
                }
            }

            // Get the logged-in user ID from the token
            const loggedInUserId = req.user.user?.id;

            if (!loggedInUserId) {
                return res.status(401).json({ message: 'Unauthorized: No user ID in token' });
            }

            // Compare IDs (convert to string for consistent comparison)
            if (ownerId.toString() !== loggedInUserId.toString()) {
                return res.status(403).json({ message: `Forbidden: You can only modify your own ${modelName.toLowerCase()}` });
            }

            next(); // User owns the resource, proceed
        } catch (error) {
            console.error('Ownership check error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
};