const Catalogue = require('../models/catalogue');
const cloudinary = require('../config/cloudinary');

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
// POST /api/catalogue/create
// multipart: title, description, image (required), pdfFile (optional)
exports.createCatalogue = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Cover image is required
    if (!req.files?.image?.[0]) {
      return res.status(400).json({
        success: false,
        message: 'Cover image is required',
      });
    }

    // Upload cover image
    const imageResult = await uploadToCloudinary(req.files.image[0].buffer, {
      folder: 'catalogues/images',
    });

    // Upload PDF if provided
    let pdfUrl = '';
    if (req.files?.pdfFile?.[0]) {
      const pdfResult = await uploadToCloudinary(req.files.pdfFile[0].buffer, {
        folder: 'catalogues/pdfs',
        resource_type: 'raw', // required for non-image files
      });
      pdfUrl = pdfResult.secure_url;
    }

    const catalogue = await Catalogue.create({
      title,
      description,
      image: imageResult.secure_url,
      pdfFile: pdfUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Catalogue created successfully',
      data: catalogue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET ALL ──────────────────────────────────────────────────────
// GET /api/catalogue/all
exports.getAllCatalogues = async (req, res) => {
  try {
    const catalogues = await Catalogue.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: catalogues.length,
      data: catalogues,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE ───────────────────────────────────────────────────
// GET /api/catalogue/:id
exports.getCatalogueById = async (req, res) => {
  try {
    const catalogue = await Catalogue.findById(req.params.id);

    if (!catalogue) {
      return res.status(404).json({
        success: false,
        message: 'Catalogue not found',
      });
    }

    res.status(200).json({ success: true, data: catalogue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE ───────────────────────────────────────────────────────
// PUT /api/catalogue/:id
// multipart: title?, description?, image? (optional), pdfFile? (optional)
exports.updateCatalogue = async (req, res) => {
  try {
    const catalogue = await Catalogue.findById(req.params.id);

    if (!catalogue) {
      return res.status(404).json({
        success: false,
        message: 'Catalogue not found',
      });
    }

    const updateData = {
      title: req.body.title || catalogue.title,
      description: req.body.description || catalogue.description,
    };

    // New cover image uploaded → replace
    if (req.files?.image?.[0]) {
      const imageResult = await uploadToCloudinary(req.files.image[0].buffer, {
        folder: 'catalogues/images',
      });
      updateData.image = imageResult.secure_url;
    }

    // New PDF uploaded → replace
    if (req.files?.pdfFile?.[0]) {
      const pdfResult = await uploadToCloudinary(req.files.pdfFile[0].buffer, {
        folder: 'catalogues/pdfs',
        resource_type: 'raw',
      });
      updateData.pdfFile = pdfResult.secure_url;
    }

    const updated = await Catalogue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: 'Catalogue updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE ───────────────────────────────────────────────────────
// DELETE /api/catalogue/:id
exports.deleteCatalogue = async (req, res) => {
  try {
    const catalogue = await Catalogue.findById(req.params.id);

    if (!catalogue) {
      return res.status(404).json({
        success: false,
        message: 'Catalogue not found',
      });
    }

    await Catalogue.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Catalogue deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
