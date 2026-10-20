import { Router } from 'express';
import Post from '../models/post.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkRole } from '../middleware/rbac.js';
import { checkOwnership } from '../middleware/ownership.js';
import postValidationSchema from '../schemas/post.js';

const router = Router();
const CONTENT_PREVIEW_LENGTH = process.env.CONTENT_PREVIEW_LENGTH || 200;

// GET all posts - accessible by both admins and users
router.get('/', /* authenticateToken, checkRole(['admin', 'user']), */ async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 2;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ deletedAt: null })
            .skip(skip)
            .limit(limit)
            .populate('author', 'name email')
            .lean();


        const previews = posts.map((post) => ({
            ...post,
            content:
                post.content.length > CONTENT_PREVIEW_LENGTH
                    ? post.content.slice(0, CONTENT_PREVIEW_LENGTH) + '...'
                    : post.content,
        }));

        const totalPosts = await Post.countDocuments({ deletedAt: null });

        res.json({
            posts: previews,
            pagination: {
                page,
                limit,
                totalPosts,
                totalPages: Math.ceil(totalPosts / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET a single post by ID - accessible by both admins and users
router.get('/:id', authenticateToken, checkRole(['admin', 'user']), async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id, deletedAt: null }).populate('author', 'name email');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE a new post - accessible by both admins and users
// The author is set to the logged-in user
router.post('/', authenticateToken, checkRole(['user']), async (req, res) => {
    try {
        // Validate request body
        const { error } = postValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { title, content } = req.body;

        // Create post with author from token
        const post = new Post({
            title,
            content,
            author: req.user.user.id // Assuming token payload has user.id
        });

        const savedPost = await post.save();
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE a post - accessible by admins and the post's owner
router.put('/:id', authenticateToken, checkRole(['admin', 'user']), checkOwnership('Post', 'author'), async (req, res) => {
    try {
        // Validate request body
        const { error } = postValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { title, content } = req.body;

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.title = title || post.title;
        post.content = content || post.content;

        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE a post - admins can delete any post, users can delete only their own posts
router.delete('/:id', authenticateToken, checkRole(['admin', 'user']), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check ownership for non-admin users
        const isAdmin = req.user.user?.role === 'admin';
        if (!isAdmin) {
            // Apply ownership check for regular users only
            const ownershipMiddleware = checkOwnership('Post', 'author');
            await new Promise((resolve, reject) => {
                ownershipMiddleware(req, res, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        }

        // Perform soft delete
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }, { new: true });
        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;