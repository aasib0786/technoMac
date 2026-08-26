const Certificate = require('../models/Certificate');
const cloudinary = require('../config/cloudinary');

// CREATE
exports.createCertificate = async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required',
      });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'certificates', quality: 'auto', fetch_format: 'auto' }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(req.file.buffer);
    });

    const certificate = await Certificate.create({
      title,
      image: result.secure_url,
    });

    res.status(201).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL
exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({
      createdAt: -1,
    }).lean();

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE
exports.getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id).lean();

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    res.status(200).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
exports.updateCertificate = async (req, res) => {
  try {
    const { title } = req.body;

    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    let image = certificate.image;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: 'certificates' }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(req.file.buffer);
      });

      image = result.secure_url;
    }

    const updatedCertificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      {
        title: title || certificate.title,
        image,
      },
      {
        returnDocument: 'after',
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      data: updatedCertificate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE
exports.deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    await Certificate.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Certificate deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
