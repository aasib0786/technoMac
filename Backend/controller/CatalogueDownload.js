const CatalogueDownload = require('../models/CatalogueDownload');
const Catalogue = require('../models/catalogue');

exports.createDownload = async (req, res) => {
  try {
    const { catalogueId, customerName, email, phoneNumber, companyName } =
      req.body;

    const catalogue = await Catalogue.findById(catalogueId);

    if (!catalogue) {
      return res.status(404).json({
        success: false,
        message: 'Catalogue not found',
      });
    }

    const download = await CatalogueDownload.create({
      catalogueId,
      customerName,
      email,
      phoneNumber,
      companyName,
    });

    res.status(201).json({
      success: true,
      message: 'Details saved successfully',
      data: download,
      pdfUrl: catalogue.pdfFile,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllDownloads = async (req, res) => {
  try {
    const downloads = await CatalogueDownload.find()
      .populate('catalogueId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: downloads.length,
      data: downloads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDownloadById = async (req, res) => {
  try {
    const download = await CatalogueDownload.findById(req.params.id).populate(
      'catalogueId',
    );

    if (!download) {
      return res.status(404).json({
        success: false,
        message: 'Download request not found',
      });
    }

    res.status(200).json({
      success: true,
      data: download,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.updateDownload = async (req, res) => {
  try {
    const download = await CatalogueDownload.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!download) {
      return res.status(404).json({
        success: false,
        message: 'Download request not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Updated successfully',
      data: download,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteDownload = async (req, res) => {
  try {
    const download = await CatalogueDownload.findByIdAndDelete(req.params.id);

    if (!download) {
      return res.status(404).json({
        success: false,
        message: 'Download request not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDownloadsByCatalogue = async (req, res) => {
  try {
    const downloads = await CatalogueDownload.find({
      catalogueId: req.params.catalogueId,
    })
      .populate('catalogueId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: downloads.length,
      data: downloads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// In your Catalogue controller file (e.g., controllers/Catalogue.js)
exports.getAllCatalogues = async (req, res) => {
  try {
    const catalogues = await Catalogue.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: catalogues.length,
      data: catalogues,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getCatalogueById = async (req, res) => {
  try {
    const catalogue = await Catalogue.findById(req.params.id);
    
    if (!catalogue) {
      return res.status(404).json({
        success: false,
        message: 'Catalogue not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: catalogue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};