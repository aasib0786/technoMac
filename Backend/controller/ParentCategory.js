const { ParentCategory } = require('../models/ParentCategory');
const cloudinary = require('../config/cloudinary');

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
exports.createParentCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        // ✅ Check duplicate
        const existing = await ParentCategory.findOne({ name: name.trim() });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Parent Category already exists' });
        }

        let imageUrl = '';
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'parentCategories');
            imageUrl = result.secure_url;
        }

        const parentCategory = await ParentCategory.create({
            name: name.trim(),
            description: description?.trim() || '',
            image: imageUrl,
        });

        res.status(201).json({ success: true, message: 'Parent Category created', data: parentCategory });
    } catch (error) {
        console.error('createParentCategory:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── GET ALL ──────────────────────────────────────────────────────────────────
exports.getAllParentCategory = async (req, res) => {
    try {
        // ✅ FIX: get ALL (admin needs inactive ones too) — remove isActive filter
        const categories = await ParentCategory.find().sort({ createdAt: -1 }).lean();
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        console.error('getAllParentCategory:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── GET SINGLE ───────────────────────────────────────────────────────────────

exports.getParentCategoryById = async (req, res) => {
    try {
        const category = await ParentCategory.findById(req.params.id).lean();
        if (!category) {
            return res.status(404).json({ success: false, message: 'Parent Category not found' });
        }
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        console.error('getParentCategoryById:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── UPDATE ───────────────────────────────────────────────────────────────────
exports.updateParentCategory = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;

        const updateData = {};

        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description.trim();

        // ✅ FIX: handle boolean properly (FormData sends string "true"/"false")
        if (isActive !== undefined) {
            updateData.isActive = isActive === true || isActive === 'true';
        }

        // New image upload
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'parentCategories');
            updateData.image = result.secure_url;
        }

        const category = await ParentCategory.findByIdAndUpdate(
            req.params.id,
            updateData,
            { returnDocument: 'after', runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ success: false, message: 'Parent Category not found' });
        }

        res.status(200).json({ success: true, message: 'Parent Category updated', data: category });
    } catch (error) {
        console.error('updateParentCategory:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteParentCategory = async (req, res) => {
    try {
        const category = await ParentCategory.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Parent Category not found' });
        }
        res.status(200).json({ success: true, message: 'Parent Category deleted' });
    } catch (error) {
        console.error('deleteParentCategory:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};