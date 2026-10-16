import { Router } from 'express';
import Post from '../models/post.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkRole } from '../middleware/rbac.js';
import { checkOwnership } from '../middleware/ownership.js';

const router = Router();

// GET all posts - accessible by both admins and users
router.get('/', authenticateToken, checkRole(['admin', 'user']), async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'name email');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET a single post by ID - accessible by both admins and users
router.get('/:id', authenticateToken, checkRole(['admin', 'user']), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'name email');
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
router.post('/', authenticateToken, checkRole(['admin', 'user']), async (req, res) => {
    try {
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

// DELETE a post - accessible by admins and the post's owner
router.delete('/:id', authenticateToken, checkRole(['admin', 'user']), checkOwnership('Post', 'author'), async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;