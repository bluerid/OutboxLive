import express from 'express';
import User from '../../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Admin login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Ensure user is an admin
        if (user.role !== 'admin') {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create JWT payload
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        };

        // Create access token (short-lived)
        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        // Create refresh token (long-lived)
        const refreshToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_SECRET, // Consider using a different secret in production
            { expiresIn: '7d' }
        );

        // Return both tokens
        res.json({ accessToken, refreshToken });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;