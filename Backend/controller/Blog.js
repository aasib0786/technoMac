const Blog = require('../models/Blog');
const cloudinary = require('../config/cloudinary');

// ── Helper: Upload buffer to Cloudinary ──────────────────────────────────────
const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });

// ── Helper: Slug generator ───────────────────────────────────────────────────
const generateSlug = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ── CREATE BLOG ──────────────────────────────────────────────────────────────
exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      description,
      content,
      author,
      readTime,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      isFeatured,
      isActive,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const finalSlug = slug?.trim() ? generateSlug(slug) : generateSlug(title);

    const existingSlug = await Blog.findOne({ slug: finalSlug });
    if (existingSlug) {
      return res.status(400).json({ success: false, message: 'A blog with this title or slug already exists' });
    }

    let imageUrl = '';
    const file = req.file || req.files?.image?.[0] || (Array.isArray(req.files) ? req.files[0] : null);
    if (file) {
      const uploadRes = await uploadToCloudinary(file.buffer, { folder: 'blogs/images' });
      imageUrl = uploadRes.secure_url;
    }

    const blog = await Blog.create({
      title: title.trim(),
      slug: finalSlug,
      category: category?.trim() || 'General',
      description: description?.trim() || '',
      content: content?.trim() || '',
      image: imageUrl,
      author: author?.trim() || 'TechnoMac Team',
      readTime: readTime?.trim() || '5 min read',
      metaTitle: metaTitle?.trim() || title.trim(),
      metaDescription: metaDescription?.trim() || description?.trim() || '',
      metaKeywords: metaKeywords?.trim() || '',
      canonicalUrl: canonicalUrl?.trim() || '',
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isActive: isActive === 'false' || isActive === false ? false : true,
    });

    res.status(201).json({ success: true, message: 'Blog created successfully', data: blog });
  } catch (error) {
    console.error('createBlog error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET ALL BLOGS ────────────────────────────────────────────────────────────
exports.getAllBlogs = async (req, res) => {
  try {
    const { category, isFeatured, isActive, search } = req.query;
    const filter = {};

    if (category?.trim()) filter.category = category.trim();
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search?.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Sort by Featured first (true comes before false), then newest created first
    const blogs = await Blog.find(filter).sort({ isFeatured: -1, createdAt: -1 });

    res.status(200).json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    console.error('getAllBlogs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE BLOG BY ID ────────────────────────────────────────────────────
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error('getBlogById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE BLOG BY SLUG ──────────────────────────────────────────────────
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error('getBlogBySlug error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE BLOG ──────────────────────────────────────────────────────────────
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    const {
      title,
      slug,
      category,
      description,
      content,
      author,
      readTime,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      isFeatured,
      isActive,
    } = req.body;

    const updateData = {};

    if (title !== undefined) updateData.title = title.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (author !== undefined) updateData.author = author.trim();
    if (readTime !== undefined) updateData.readTime = readTime.trim();

    if (metaTitle !== undefined) updateData.metaTitle = metaTitle.trim();
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription.trim();
    if (metaKeywords !== undefined) updateData.metaKeywords = metaKeywords.trim();
    if (canonicalUrl !== undefined) updateData.canonicalUrl = canonicalUrl.trim();

    if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

    if (slug?.trim()) {
      const newSlug = generateSlug(slug);
      const existingSlug = await Blog.findOne({ slug: newSlug, _id: { $ne: req.params.id } });
      if (existingSlug) {
        return res.status(400).json({ success: false, message: 'Another blog with this slug already exists' });
      }
      updateData.slug = newSlug;
    } else if (title !== undefined && title.trim() !== blog.title) {
      let newSlug = generateSlug(title);
      const existingSlug = await Blog.findOne({ slug: newSlug, _id: { $ne: req.params.id } });
      if (!existingSlug) {
        updateData.slug = newSlug;
      }
    }

    const file = req.file || req.files?.image?.[0] || (Array.isArray(req.files) ? req.files[0] : null);
    if (file) {
      const uploadRes = await uploadToCloudinary(file.buffer, { folder: 'blogs/images' });
      updateData.image = uploadRes.secure_url;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.status(200).json({ success: true, message: 'Blog updated successfully', data: updatedBlog });
  } catch (error) {
    console.error('updateBlog error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE BLOG ──────────────────────────────────────────────────────────────
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('deleteBlog error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
