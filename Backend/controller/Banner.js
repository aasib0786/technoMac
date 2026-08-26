const Banner = require('../models/Banner');
const cloudinary = require('../config/cloudinary');

// ─── Helper: upload buffer to Cloudinary ────────────────────────────────────
const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'banners', quality: 'auto', fetch_format: 'auto' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });

// ─── CREATE BANNER ───────────────────────────────────────────────────────────
exports.createBanner = async (req, res) => {
  try {
    const { title, subtitle, buttonText, categoryId, subCategoryId, deviceType } = req.body;

    if (!categoryId && !subCategoryId) {
      return res
        .status(400)
        .json({ success: false, message: 'Category is required' });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'Image is required' });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    const banner = await Banner.create({
      categoryId,
      subCategoryId,
      title,
      subtitle,
      buttonText,
      deviceType: deviceType || 'desktop',
      image: result.secure_url,
    });

    res.status(201).json({ success: true, banner });
  } catch (error) {
    console.error('createBanner error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ALL BANNERS ─────────────────────────────────────────────────────────
exports.getAllBanner = async (req, res) => {
  try {
    // FIX: 'category' was an undefined variable — use the string 'name image'
    const banners = await Banner.find({ isActive: true }).populate(
      'categoryId',
      'name image',
    ).populate("subCategoryId").lean();

    res.status(200).json({ success: true, banners });
  } catch (error) {
    console.error('getAllBanner error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET BANNERS BY CATEGORY ─────────────────────────────────────────────────
exports.getBannerByCategory = async (req, res) => {
  try {
    const banners = await Banner.find({
      categoryId: req.params.categoryId,
      isActive: true,
    }).populate('categoryId', 'name image').lean();

    res.status(200).json({ success: true, banners });
  } catch (error) {
    console.error('getBannerByCategory error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE BANNER ───────────────────────────────────────────────────────────
exports.updateBanner = async (req, res) => {
  try {
    const { categoryId, title, subtitle, buttonText, subCategoryId, deviceType } = req.body;

    if (!categoryId && !subCategoryId) {
      return res
        .status(400)
        .json({ success: false, message: 'Category is required' });
    }

    const updateData = { categoryId, subCategoryId, title, subtitle, buttonText };
    if (deviceType) {
      updateData.deviceType = deviceType;
    }

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      updateData.image = result.secure_url;
    }

    const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: 'after',
    }).populate('categoryId', 'name image').populate('subCategoryId');

    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: 'Banner not found' });
    }

    res.status(200).json({ success: true, banner });
  } catch (error) {
    console.error('updateBanner error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE BANNER ───────────────────────────────────────────────────────────
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res
        .status(404)
        .json({ success: false, message: 'Banner not found' });
    }

    res
      .status(200)
      .json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('deleteBanner error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
