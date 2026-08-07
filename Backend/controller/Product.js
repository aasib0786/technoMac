const cloudinary = require('../config/cloudinary');
const { Product } = require('../models/Product');
const { SubCategory } = require('../models/Subcategory ');
const { Category } = require('../models/Category');
const mongoose = require('mongoose');

// ── Helper: upload single buffer ─────────────────────────────────────────────
const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });

// ── Helper: upload multiple files ────────────────────────────────────────────
const uploadMultiple = (files, folder) =>
  Promise.all(files.map((f) => uploadToCloudinary(f.buffer, folder)));

// ── Helper: parse JSON string safely ─────────────────────────────────────────
const parseJSON = (val, fallback = []) => {
  if (!val) return fallback;
  try {
    return typeof val === 'string' ? JSON.parse(val) : val;
  } catch {
    return fallback;
  }
};

// ── Helper: populate chain ────────────────────────────────────────────────────
const populateProduct = (query) =>
  query
    .populate('parentCategoryId', 'name')
    .populate('category', 'name')
    .populate('subCategory', 'name');

// ── CREATE ───────────────────────────────────────────────────────────────────
exports.createProduct = async (req, res) => {
  try {
    const { name, category, subCategory, sku, model, description, price, features, specifications, isFeatured } = req.body;

    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    // ✅ Duplicate Name check — only runs if a Name was actually provided
    const cleanName = name?.trim() || undefined;
    if (cleanName) {
      const existing = await Product.findOne({ name: cleanName });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Product with this Name already exists' });
      }
    }

    // ✅ Auto-fetch parentCategoryId from category, only if category is given
    let parentCategoryId = null;
    if (category) {
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) return res.status(404).json({ success: false, message: 'Category not found' });
      parentCategoryId = categoryDoc.parentCategoryId;
    }

    const images = req.files?.length > 0
      ? await uploadMultiple(req.files, 'products')
      : [];

    const product = await Product.create({
      name: name.trim(),
      parentCategoryId: parentCategoryId || undefined,
      category: category || undefined,
      subCategory: subCategory || undefined,
      sku: sku || model || '',
      description: description?.trim() || '',
      price: price || 0,
      images,
      specifications: parseJSON(specifications),
      features: parseJSON(features),
      isFeatured: isFeatured === 'true' || isFeatured === true,
    });

    const populated = await populateProduct(Product.findById(product._id));
    res.status(201).json({ success: true, message: 'Product created', data: populated });
  } catch (error) {
    console.error('createProduct:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET ALL ──────────────────────────────────────────────────────────────────
exports.getAllProducts = async (req, res) => {
  try {
    const products = await populateProduct(
      Product.find().sort({ createdAt: -1 })
    );
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('getAllProducts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET BY CATEGORY ───────────────────────────────────────────────────────────
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await populateProduct(
      Product.find({ category: req.params.categoryId, isActive: true })
    );
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET BY SUBCATEGORY ────────────────────────────────────────────────────────
exports.getProductsBySubCategory = async (req, res) => {
  try {
    const products = await populateProduct(
      Product.find({ subCategory: req.params.subCategoryId, isActive: true })
    );
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET BY PARENT CATEGORY ────────────────────────────────────────────────────
exports.getProductsByParentCategory = async (req, res) => {
  try {
    const { parentId } = req.params;

    // ✅ Validate ObjectId before query
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ success: false, message: 'Invalid parentId' });
    }

    const products = await Product.find({
      parentCategoryId: parentId,
      isActive: true,
    })
      .populate('parentCategoryId', 'name image')
      .populate('category', 'name image')
      .populate('subCategory', 'name image')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('getProductsByParentCategory:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE ────────────────────────────────────────────────────────────────
exports.getProductById = async (req, res) => {
  try {
    const product = await populateProduct(Product.findById(req.params.id));
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET FEATURED ──────────────────────────────────────────────────────────────
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await populateProduct(
      Product.find({ isFeatured: true, isActive: true })
    );
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE ────────────────────────────────────────────────────────────────────
exports.updateProduct = async (req, res) => {
  try {
    const { name, category, subCategory, sku, model, description, price, features, specifications, isFeatured, isActive } = req.body;

    const updateData = {};
    const unsetData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    if (price !== undefined && price !== '') updateData.price = price || 0;

    const cleanSku = sku !== undefined ? sku : model !== undefined ? model : undefined;
    if (cleanSku !== undefined) updateData.sku = cleanSku || '';

    if (category !== undefined) {
      if (category) {
        const categoryDoc = await Category.findById(category);
        if (!categoryDoc) return res.status(404).json({ success: false, message: 'Category not found' });
        updateData.category = category;
        updateData.parentCategoryId = categoryDoc.parentCategoryId;
      } else {
        unsetData.category = '';
        unsetData.parentCategoryId = '';
      }
    }

    if (subCategory !== undefined) {
      if (subCategory) {
        updateData.subCategory = subCategory;
      } else {
        unsetData.subCategory = '';
      }
    }

    if (req.files?.length > 0) {
      updateData.images = await uploadMultiple(req.files, 'products');
    }

    const parsedSpecs = parseJSON(specifications, null);
    const parsedFeatures = parseJSON(features, null);
    if (parsedSpecs !== null) updateData.specifications = parsedSpecs;
    if (parsedFeatures !== null) updateData.features = parsedFeatures;

    const updateOps = { $set: updateData };
    if (Object.keys(unsetData).length > 0) updateOps.$unset = unsetData;

    const product = await populateProduct(
      Product.findByIdAndUpdate(req.params.id, updateOps, { new: true, runValidators: true })
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    res.status(200).json({ success: true, message: 'Product updated', data: product });
  } catch (error) {
    console.error('updateProduct:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE ────────────────────────────────────────────────────────────────────
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── SEARCH WITH PAGINATION ────────────────────────────────────────────────────
exports.searchProducts = async (req, res) => {
  try {
    const { q, parentCategoryId, category, subCategory, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

    const filter = { isActive: true };

    if (q?.trim()) {
      filter.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { sku: { $regex: q.trim(), $options: 'i' } },
      ];
    }
    if (parentCategoryId?.trim()) filter.parentCategoryId = parentCategoryId.trim();
    if (category?.trim()) filter.category = category.trim();
    if (subCategory?.trim()) filter.subCategory = subCategory.trim();
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      populateProduct(Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum)),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('searchProducts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};