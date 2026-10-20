import { Router } from 'express';
import Comment from '../models/comment.js';
import Post from '../models/post.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkRole } from '../middleware/rbac.js';
import { checkOwnership } from '../middleware/ownership.js';
import commentValidationSchema from '../schemas/comment.js';

const router = Router({ mergeParams: true });

// GET /posts/:postId/comments - retrieve comments for a post
router.get('/', authenticateToken, checkRole(['admin', 'user']), async (req, res) => {
    try {
        const { postId } = req.params;
        // Verify post exists and is not deleted
        const post = await Post.findOne({ _id: postId, deletedAt: null });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const comments = await Comment.find({ post: postId })
            .sort({ createdAt: 1 }) // chronological order
            .skip(skip)
            .limit(limit)
            .populate('user', 'name email') // populate user with safe fields
            .lean();

        const totalComments = await Comment.countDocuments({ post: postId });

        res.json({
            comments,
            pagination: {
                page,
                limit,
                totalComments,
                totalPages: Math.ceil(totalComments / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /posts/:postId/comments/:id - retrieve comments for a post
router.get('/:id', authenticateToken, checkRole(['admin', 'user']), async (req, res) => {
    try {
        const { postId } = req.params;
        // Verify post exists and is not deleted
        const post = await Post.findOne({ _id: postId, deletedAt: null });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const comment = await Comment.findOne({ _id: req.params.id }).populate('user', 'name email');
        if (!comment) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /posts/:postId/comments - create a comment on a post
router.post('/', authenticateToken, checkRole(['user']), async (req, res) => {
    try {
        const { postId } = req.params;
        // Verify post exists and is not deleted
        const post = await Post.findOne({ _id: postId, deletedAt: null });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Validate request body
        const { error } = commentValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { content } = req.body;

        // Create comment with user from token and post from params
        const comment = new Comment({
            content,
            user: req.user.user.id,
            post: postId
        });

        const savedComment = await comment.save();
        // Populate user for response
        const populatedComment = await Comment.findById(savedComment._id).populate('user', 'name email');
        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH /comments/:id - edit a comment (author only)
router.patch('/:id', authenticateToken, checkRole(['admin', 'user']), checkOwnership('Comment', 'user'), async (req, res) => {
    try {
        const { id } = req.params;
        // Validate request body
        const { error } = commentValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { content } = req.body;

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Ownership check is already done by checkOwnership middleware, but we double-check
        // Update content and let timestamps update automatically
        comment.content = content;
        const updatedComment = await comment.save();
        // Populate user for response
        const populatedComment = await Comment.findById(updatedComment._id).populate('user', 'name email');
        res.json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /comments/:commentId - delete a comment (author only)
router.delete('/:id', authenticateToken, checkRole(['admin', 'user']), checkOwnership('Comment', 'user'), async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Ownership check is already done by checkOwnership middleware

        await Comment.findByIdAndDelete(id);
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;