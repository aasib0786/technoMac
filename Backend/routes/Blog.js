const express = require('express');
const blogRouter = express.Router();
const upload = require('../middleware/multer');
const adminAuth = require('../middleware/adminAuth');
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
} = require('../controller/Blog');

blogRouter.post('/', adminAuth, upload.fields([{ name: 'image', maxCount: 1 }]), createBlog);
blogRouter.get('/', getAllBlogs);
blogRouter.get('/slug/:slug', getBlogBySlug);
blogRouter.get('/:id', getBlogById);
blogRouter.put('/:id', adminAuth, upload.fields([{ name: 'image', maxCount: 1 }]), updateBlog);
blogRouter.delete('/:id', adminAuth, deleteBlog);

module.exports = blogRouter;
