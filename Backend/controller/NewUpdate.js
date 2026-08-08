const NewUpdate = require('../models/NewUpdate');
const cloudinary = require('../config/cloudinary');

// ── Helper: Slug generator ───────────────────────────────────────
const generateSlug = (name) =>
    name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

// ── Helper: upload buffer to Cloudinary ──────────────────────────
const uploadToCloudinary = (buffer, options) =>
    new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(options, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            })
            .end(buffer);
    });

// ── CREATE ───────────────────────────────────────────────────────
exports.createNewUpdate = async (req, res) => {
    try {
        const {
            title,
            subTitle,
            description,
            points,
            slug,
            metaTitle,
            metaDescription,
            metaKeywords,
            canonicalUrl,
        } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        // Cover image is required
        if (!req.files?.image?.[0]) {
            return res.status(400).json({
                success: false,
                message: 'Cover image is required',
            });
        }

        let parsedPoints = [];
        if (points) {
            try {
                parsedPoints = JSON.parse(points);
            } catch {
                parsedPoints = points
                    .split(',')
                    .map((p) => p.trim())
                    .filter(Boolean);
            }
        }

        const imageResult = await uploadToCloudinary(req.files.image[0].buffer, {
            folder: 'newupdates/images',
        });

        const finalSlug = slug?.trim() ? generateSlug(slug) : generateSlug(title);

        const newUpdate = await NewUpdate.create({
            title: title.trim(),
            subTitle: subTitle?.trim() || '',
            description: description?.trim() || '',
            image: imageResult.secure_url,
            points: parsedPoints,
            slug: finalSlug,
            metaTitle: metaTitle?.trim() || title.trim(),
            metaDescription: metaDescription?.trim() || description?.trim() || '',
            metaKeywords: metaKeywords?.trim() || '',
            canonicalUrl: canonicalUrl?.trim() || '',
        });

        res.status(201).json({
            success: true,
            message: 'NewUpdate created successfully',
            data: newUpdate,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── GET ALL ──────────────────────────────────────────────────────
exports.getAllNewUpdates = async (req, res) => {
    try {
        const newUpdates = await NewUpdate.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: newUpdates.length,
            data: newUpdates,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── GET SINGLE BY ID ─────────────────────────────────────────────
exports.getNewUpdateById = async (req, res) => {
    try {
        const newUpdate = await NewUpdate.findById(req.params.id);

        if (!newUpdate) {
            return res.status(404).json({
                success: false,
                message: 'NewUpdate not found',
            });
        }

        res.status(200).json({ success: true, data: newUpdate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── GET SINGLE BY SLUG ───────────────────────────────────────────
exports.getNewUpdateBySlug = async (req, res) => {
    try {
        const newUpdate = await NewUpdate.findOne({ slug: req.params.slug });

        if (!newUpdate) {
            return res.status(404).json({
                success: false,
                message: 'NewUpdate not found',
            });
        }

        res.status(200).json({ success: true, data: newUpdate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── GET BY SUBTITLE ──────────────────────────────────────────────
exports.getBySubTitle = async (req, res) => {
    try {
        const { subTitle } = req.params;

        if (!subTitle?.trim()) {
            return res.status(400).json({ success: false, message: 'subTitle param is required' });
        }

        const newUpdate = await NewUpdate.findOne({
            subTitle: { $regex: new RegExp(`^${subTitle.trim()}$`, 'i') },
        });

        if (!newUpdate) {
            return res.status(404).json({
                success: false,
                message: `No update found with subTitle: "${subTitle}"`,
            });
        }

        res.status(200).json({ success: true, data: newUpdate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── UPDATE ───────────────────────────────────────────────────────
exports.updateNewUpdate = async (req, res) => {
    try {
        const newUpdate = await NewUpdate.findById(req.params.id);

        if (!newUpdate) {
            return res.status(404).json({
                success: false,
                message: 'NewUpdate not found',
            });
        }

        const updateData = {
            title: req.body.title !== undefined ? req.body.title.trim() : newUpdate.title,
            subTitle: req.body.subTitle !== undefined ? req.body.subTitle.trim() : newUpdate.subTitle,
            description: req.body.description !== undefined ? req.body.description.trim() : newUpdate.description,
            metaTitle: req.body.metaTitle !== undefined ? req.body.metaTitle.trim() : newUpdate.metaTitle,
            metaDescription: req.body.metaDescription !== undefined ? req.body.metaDescription.trim() : newUpdate.metaDescription,
            metaKeywords: req.body.metaKeywords !== undefined ? req.body.metaKeywords.trim() : newUpdate.metaKeywords,
            canonicalUrl: req.body.canonicalUrl !== undefined ? req.body.canonicalUrl.trim() : newUpdate.canonicalUrl,
            slug: req.body.slug !== undefined && req.body.slug.trim()
                ? generateSlug(req.body.slug)
                : req.body.title
                ? generateSlug(req.body.title)
                : newUpdate.slug,
            points: newUpdate.points,
        };

        if (req.body.points !== undefined) {
            try {
                updateData.points = JSON.parse(req.body.points);
            } catch {
                updateData.points = req.body.points
                    .split(',')
                    .map((p) => p.trim())
                    .filter(Boolean);
            }
        }

        if (req.files?.image?.[0]) {
            const imageResult = await uploadToCloudinary(req.files.image[0].buffer, {
                folder: 'newupdates/images',
            });
            updateData.image = imageResult.secure_url;
        }

        const updated = await NewUpdate.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true },
        );

        res.status(200).json({
            success: true,
            message: 'NewUpdate updated successfully',
            data: updated,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ── DELETE ───────────────────────────────────────────────────────
exports.deleteNewUpdate = async (req, res) => {
    try {
        const newUpdate = await NewUpdate.findById(req.params.id);

        if (!newUpdate) {
            return res.status(404).json({
                success: false,
                message: 'NewUpdate not found',
            });
        }

        await NewUpdate.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'NewUpdate deleted successfully',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};