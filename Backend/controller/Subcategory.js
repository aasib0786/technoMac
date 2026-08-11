const { SubCategory } = require('../models/Subcategory ');
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

// ── Populate helper — always use same populate chain ─────────────────────────
const populateSubCategory = (query) =>
  query
    .populate('category', 'name image')
    .populate('parentCategoryId', 'name')
    .lean();

// ── CREATE ───────────────────────────────────────────────────────────────────
exports.createSubCategory = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    // ✅ Auto-fetch parentCategoryId from the selected category
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const parentCategoryId = categoryDoc.parentCategoryId;

    let imageUrl = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'subcategories');
      imageUrl = result.secure_url;
    }

    const subCategory = await SubCategory.create({
      name: name.trim(),
      category,
      parentCategoryId,   // ✅ auto-set from category
      description: description?.trim() || '',
      image: imageUrl,
    });

    const populated = await populateSubCategory(
      SubCategory.findById(subCategory._id)
    );

    res.status(201).json({ success: true, message: 'SubCategory created', data: populated });
  } catch (error) {
    console.error('createSubCategory:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET ALL (admin — all including inactive) ─────────────────────────────────
exports.getAllSubCategories = async (req, res) => {
  try {
    // ✅ FIX: removed isActive filter — admin needs all
    const subCategories = await populateSubCategory(
      SubCategory.find().sort({ createdAt: -1 })
    );
    res.status(200).json({ success: true, data: subCategories });
  } catch (error) {
    console.error('getAllSubCategories:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET ALL ACTIVE (public) ───────────────────────────────────────────────────
exports.getAllActiveSubCategories = async (req, res) => {
  try {
    const subCategories = await populateSubCategory(
      SubCategory.find({ isActive: true }).sort({ createdAt: -1 })
    );
    res.status(200).json({ success: true, data: subCategories });
  } catch (error) {
    console.error('getAllActiveSubCategories:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET BY CATEGORY ID ────────────────────────────────────────────────────────
exports.getSubCategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'Category identifier is required' });
    }

    let categoryIdToUse = categoryId;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      const decodedParam = decodeURIComponent(categoryId).trim();
      const normalizedParam = decodedParam.replace(/[-_]+/g, ' ').trim();
      const slugPattern = new RegExp(`^${decodedParam.replace(/[-_]/g, '[-_\\s]')}$`, 'i');
      const namePattern = new RegExp(`^${normalizedParam}$`, 'i');

      const categoryDoc = await Category.findOne({
        $or: [
          { name: { $regex: namePattern } },
          { name: { $regex: slugPattern } },
          { name: decodedParam },
        ],
      }).lean();

      if (!categoryDoc) {
        return res.status(200).json({ success: true, data: [] });
      }
      categoryIdToUse = categoryDoc._id;
    }

    const subCategories = await SubCategory.find({ category: categoryIdToUse, isActive: true })
      .populate('category')
      .lean();
    res.status(200).json({ success: true, data: subCategories });
  } catch (error) {
    console.error('getSubCategoriesByCategory:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET BY PARENT CATEGORY ID ─────────────────────────────────────────────────
exports.getSubCategoriesByParent = async (req, res) => {
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
      });

      if (!parentDoc) {
        return res.status(200).json({ success: true, data: [] });
      }
      parentIdToUse = parentDoc._id;
    }

    const subCategories = await populateSubCategory(
      SubCategory.find({ parentCategoryId: parentIdToUse, isActive: true })
    );
    res.status(200).json({ success: true, data: subCategories });
  } catch (error) {
    console.error('getSubCategoriesByParent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE ────────────────────────────────────────────────────────────────
exports.getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await populateSubCategory(
      SubCategory.findById(req.params.id)
    );
    if (!subCategory) {
      return res.status(404).json({ success: false, message: 'SubCategory not found' });
    }
    res.status(200).json({ success: true, data: subCategory });
  } catch (error) {
    console.error('getSubCategoryById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE ────────────────────────────────────────────────────────────────────
exports.updateSubCategory = async (req, res) => {
  try {
    const { name, category, description, isActive } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();

    // ✅ FIX: handle boolean string from FormData
    if (isActive !== undefined) {
      updateData.isActive = isActive === true || isActive === 'true';
    }

    // ✅ If category changed, auto-update parentCategoryId too
    if (category !== undefined) {
      updateData.category = category;
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      updateData.parentCategoryId = categoryDoc.parentCategoryId;
    }

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'subcategories');
      updateData.image = result.secure_url;
    }

    const subCategory = await populateSubCategory(
      SubCategory.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
    );

    if (!subCategory) {
      return res.status(404).json({ success: false, message: 'SubCategory not found' });
    }

    res.status(200).json({ success: true, message: 'SubCategory updated', data: subCategory });
  } catch (error) {
    console.error('updateSubCategory:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE ────────────────────────────────────────────────────────────────────
exports.deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);
    if (!subCategory) {
      return res.status(404).json({ success: false, message: 'SubCategory not found' });
    }
    res.status(200).json({ success: true, message: 'SubCategory deleted' });
  } catch (error) {
    console.error('deleteSubCategory:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};