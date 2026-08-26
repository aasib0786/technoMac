const { Category } = require('../models/Category');
const { ParentCategory } = require('../models/ParentCategory');
const cloudinary = require('../config/cloudinary');
const mongoose = require('mongoose');

// ── Helper: upload buffer to Cloudinary ──────────────────────────────────────
const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, quality: 'auto', fetch_format: 'auto' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });

// ── CREATE ───────────────────────────────────────────────────────────────────
exports.createCategory = async (req, res) => {
  try {
    const { name, description, parentCategoryId } = req.body;

    // ✅ Validation
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!parentCategoryId) {
      return res.status(400).json({ success: false, message: 'Parent Category is required' });
    }

    // ✅ Duplicate check
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    let imageUrl = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'categories');
      imageUrl = result.secure_url;
    }

    const category = await Category.create({
      name: name.trim(),
      parentCategoryId,
      description: description?.trim() || '',
      image: imageUrl,
    });

    // ✅ Populate parentCategoryId in response
    await category.populate('parentCategoryId', 'name');

    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (error) {
    console.error('createCategory:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET ALL ──────────────────────────────────────────────────────────────────
exports.getAllCategories = async (req, res) => {
  try {
    // ✅ FIX: removed isActive filter — admin needs all categories
    // ✅ FIX: populate parentCategoryId so frontend can show parent name
    const categories = await Category.find()
      .populate('parentCategoryId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error('getAllCategories:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET ALL ACTIVE (public route) ────────────────────────────────────────────
exports.getAllActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parentCategoryId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error('getAllActiveCategories:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE ───────────────────────────────────────────────────────────────
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategoryId', 'name')
      .lean();

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error('getCategoryById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET BY PARENT CATEGORY ───────────────────────────────────────────────────
exports.getCategoriesByParent = async (req, res) => {
  try {
    const { parentId } = req.params;

    if (!parentId) {
      return res.status(400).json({ success: false, message: 'Parent identifier is required' });
    }

    let parentIdToUse = parentId;
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      const decodedParam = decodeURIComponent(parentId).trim();
      const normalizedParam = decodedParam.replace(/[-_]+/g, ' ').trim();
      const slugPattern = new RegExp(`^${decodedParam.replace(/[-_]/g, '[-_\\s]')}$`, 'i');
      const namePattern = new RegExp(`^${normalizedParam}$`, 'i');

      const parentDoc = await ParentCategory.findOne({
        $or: [
          { name: { $regex: namePattern } },
          { name: { $regex: slugPattern } },
          { name: decodedParam },
        ],
      }).lean();

      if (!parentDoc) {
        return res.status(200).json({ success: true, data: [] });
      }
      parentIdToUse = parentDoc._id;
    }

    const categories = await Category.find({
      parentCategoryId: parentIdToUse,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error('getCategoriesByParent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE ───────────────────────────────────────────────────────────────────
exports.updateCategory = async (req, res) => {
  try {
    const { name, parentCategoryId, description, isActive } = req.body;

    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (parentCategoryId !== undefined) updateData.parentCategoryId = parentCategoryId;
    if (description !== undefined) updateData.description = description.trim();

    // ✅ FIX: handle boolean string from FormData
    if (isActive !== undefined) {
      updateData.isActive = isActive === true || isActive === 'true';
    }

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'categories');
      updateData.image = result.secure_url;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    ).populate('parentCategoryId', 'name');

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, message: 'Category updated', data: category });
  } catch (error) {
    console.error('updateCategory:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('deleteCategory:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};