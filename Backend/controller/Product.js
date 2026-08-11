const cloudinary = require('../config/cloudinary');
const { Product } = require('../models/Product');
const { SubCategory } = require('../models/Subcategory ');
const { Category } = require('../models/Category');
const { ParentCategory } = require('../models/ParentCategory');
const mongoose = require('mongoose');

// ── Helper: Slug generator ───────────────────────────────────────────────────
const generateSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ── Helper: upload single buffer ─────────────────────────────────────────────
const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, quality: 'auto', fetch_format: 'auto' }, (error, result) => {
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
    .populate('subCategory', 'name')
    .lean();

// ── CREATE ───────────────────────────────────────────────────────────────────
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      slug,
      category,
      subCategory,
      sku,
      model,
      description,
      price,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      features,
      specifications,
      isFeatured,
    } = req.body;

    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });

    const cleanName = name?.trim();
    const existing = await Product.findOne({ name: cleanName });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product with this Name already exists' });
    }

    const finalSlug = slug?.trim() ? generateSlug(slug) : generateSlug(name);

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
      name: cleanName,
      slug: finalSlug,
      parentCategoryId: parentCategoryId || undefined,
      category: category || undefined,
      subCategory: subCategory || undefined,
      sku: sku || model || '',
      description: description?.trim() || '',
      price: price || 0,
      images,
      metaTitle: metaTitle?.trim() || cleanName,
      metaDescription: metaDescription?.trim() || description?.trim() || '',
      metaKeywords: metaKeywords?.trim() || '',
      canonicalUrl: canonicalUrl?.trim() || '',
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
    const { categoryId } = req.params;
    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'Category identifier is required' });
    }

    let categoryDoc = null;
    if (mongoose.Types.ObjectId.isValid(categoryId)) {
      categoryDoc = await Category.findById(categoryId);
    }

    if (!categoryDoc) {
      const decodedParam = decodeURIComponent(categoryId).trim();
      const normalizedParam = decodedParam.replace(/[-_]+/g, ' ').trim();
      const slugPattern = new RegExp(`^${decodedParam.replace(/[-_]/g, '[-_\\s]')}$`, 'i');
      const namePattern = new RegExp(`^${normalizedParam}$`, 'i');

      categoryDoc = await Category.findOne({
        $or: [
          { name: { $regex: namePattern } },
          { name: { $regex: slugPattern } },
          { name: decodedParam },
        ],
      });
    }

    if (!categoryDoc) {
      return res.status(200).json({ success: true, data: [] });
    }

    const products = await populateProduct(
      Product.find({ category: categoryDoc._id, isActive: true }).sort({ createdAt: -1 })
    );
    res.status(200).json({ success: true, data: products, category: categoryDoc });
  } catch (error) {
    console.error('getProductsByCategory error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET BY SUBCATEGORY ────────────────────────────────────────────────────────
exports.getProductsBySubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    if (!subCategoryId) {
      return res.status(400).json({ success: false, message: 'Subcategory identifier is required' });
    }
console.log("subCategoryId ",subCategoryId )
    let subCategoryDoc = null;
    if (mongoose.Types.ObjectId.isValid(subCategoryId)) {
      subCategoryDoc = await SubCategory.findById(subCategoryId);
    }

    if (!subCategoryDoc) {
      const decodedParam = decodeURIComponent(subCategoryId).trim();
      const normalizedParam = decodedParam.replace(/[-_]+/g, ' ').trim();
      const slugPattern = new RegExp(`^${decodedParam.replace(/[-_]/g, '[-_\\s]')}$`, 'i');
      const namePattern = new RegExp(`^${normalizedParam}$`, 'i');

      subCategoryDoc = await SubCategory.findOne({
        $or: [
          { name: { $regex: namePattern } },
          { name: { $regex: slugPattern } },
          { name: decodedParam },
        ],
      });
    }

    if (!subCategoryDoc) {
      return res.status(200).json({ success: true, data: [] });
    }

    const products = await populateProduct(
      Product.find({ subCategory: subCategoryDoc._id, isActive: true }).sort({ createdAt: -1 })
    );
    res.status(200).json({ success: true, data: products, subCategory: subCategoryDoc });
  } catch (error) {
    console.error('getProductsBySubCategory error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET BY PARENT CATEGORY ────────────────────────────────────────────────────
exports.getProductsByParentCategory = async (req, res) => {
  try {
    const { parentId } = req.params;

    if (!parentId) {
      return res.status(400).json({ success: false, message: 'Parent category identifier is required' });
    }

    let parentCategoryDoc = null;
    if (mongoose.Types.ObjectId.isValid(parentId)) {
      parentCategoryDoc = await ParentCategory.findById(parentId);
    }

    if (!parentCategoryDoc) {
      const decodedParam = decodeURIComponent(parentId).trim();
      const normalizedParam = decodedParam.replace(/[-_]+/g, ' ').trim();
      const slugPattern = new RegExp(`^${decodedParam.replace(/[-_]/g, '[-_\\s]')}$`, 'i');
      const namePattern = new RegExp(`^${normalizedParam}$`, 'i');

      parentCategoryDoc = await ParentCategory.findOne({
        $or: [
          { name: { $regex: namePattern } },
          { name: { $regex: slugPattern } },
          { name: decodedParam },
        ],
      });
    }

    if (!parentCategoryDoc) {
      return res.status(200).json({ success: true, data: [] });
    }

    const products = await Product.find({
      parentCategoryId: parentCategoryDoc._id,
      isActive: true,
    })
      .populate('parentCategoryId', 'name image')
      .populate('category', 'name image')
      .populate('subCategory', 'name image')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: products, parentCategory: parentCategoryDoc });
  } catch (error) {
    console.error('getProductsByParentCategory:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE BY ID OR SLUG/NAME ─────────────────────────────────────────────
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Product identifier is required' });

    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await populateProduct(Product.findById(id));
    }

    if (!product) {
      const decoded = decodeURIComponent(id).trim();
      const normalized = decoded.replace(/[-_]+/g, ' ').trim();
      const slugPattern = new RegExp(`^${decoded.replace(/[-_]/g, '[-_\\s]')}$`, 'i');
      const namePattern = new RegExp(`^${normalized}$`, 'i');

      product = await populateProduct(
        Product.findOne({
          $or: [
            { slug: decoded.toLowerCase() },
            { slug: { $regex: slugPattern } },
            { name: { $regex: namePattern } },
            { name: { $regex: slugPattern } },
            { name: decoded },
            { sku: decoded },
          ],
        })
      );
    }

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('getProductById error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE BY SLUG OR NAME ────────────────────────────────────────────────
exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ success: false, message: 'Slug is required' });

    const decoded = decodeURIComponent(slug).trim();
    const normalized = decoded.replace(/[-_]+/g, ' ').trim();
    const slugPattern = new RegExp(`^${decoded.replace(/[-_]/g, '[-_\\s]')}$`, 'i');
    const namePattern = new RegExp(`^${normalized}$`, 'i');

    let product = await populateProduct(
      Product.findOne({
        $or: [
          { slug: decoded.toLowerCase() },
          { slug: { $regex: slugPattern } },
          { name: { $regex: namePattern } },
          { name: { $regex: slugPattern } },
          { name: decoded },
          { sku: decoded },
        ],
      })
    );

    if (!product && mongoose.Types.ObjectId.isValid(slug)) {
      product = await populateProduct(Product.findById(slug));
    }

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('getProductBySlug error:', error);
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
    const {
      name,
      slug,
      category,
      subCategory,
      sku,
      model,
      description,
      price,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      features,
      specifications,
      isFeatured,
      isActive,
    } = req.body;

    const updateData = {};
    const unsetData = {};

    if (name !== undefined) {
      updateData.name = name.trim();
      if (!slug?.trim()) updateData.slug = generateSlug(name);
    }
    if (slug?.trim()) updateData.slug = generateSlug(slug);
    if (description !== undefined) updateData.description = description.trim();
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle.trim();
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription.trim();
    if (metaKeywords !== undefined) updateData.metaKeywords = metaKeywords.trim();
    if (canonicalUrl !== undefined) updateData.canonicalUrl = canonicalUrl.trim();

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
      const terms = q.trim().split(/\s+/).filter(Boolean);
      if (terms.length === 1) {
        const singleTerm = terms[0];
        filter.$or = [
          { name: { $regex: singleTerm, $options: 'i' } },
          { slug: { $regex: singleTerm, $options: 'i' } },
          { sku: { $regex: singleTerm, $options: 'i' } },
          { description: { $regex: singleTerm, $options: 'i' } },
        ];
      } else {
        filter.$and = terms.map((term) => ({
          $or: [
            { name: { $regex: term, $options: 'i' } },
            { slug: { $regex: term, $options: 'i' } },
            { sku: { $regex: term, $options: 'i' } },
            { description: { $regex: term, $options: 'i' } },
          ],
        }));
      }
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