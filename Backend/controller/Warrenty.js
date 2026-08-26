const { Warranty } = require('../models/Warranty');
const cloudinary = require('../config/cloudinary');

exports.registerWarranty = async (req, res) => {
  try {
    const {
      email,
      customerName,
      customerContact,
      clinicName,
      clinicAddress,
      purchaseDate,
      productModel,
      serialNumber,
      dealerName,
      dealerCompany,
      dealerContact,
      dealerAddress,
    } = req.body;

    // Image multer se aayegi
    let productImage = req.file ? req.file.path : '';
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: 'productImage' }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(req.file.buffer);
      });

      productImage = result.secure_url;
    }

    // Same serial number dobara register nahi hona chahiye
    const existing = await Warranty.findOne({ serialNumber });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This serial number is already registered.',
      });
    }

    const warranty = await Warranty.create({
      email,
      customerName,
      customerContact,
      clinicName,
      clinicAddress,
      purchaseDate,
      productModel,
      serialNumber,
      productImage,
      dealerName,
      dealerCompany,
      dealerContact,
      dealerAddress,
    });

    res.status(201).json({
      success: true,
      message: 'Warranty registered successfully!',
      data: warranty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════════
// GET ALL WARRANTIES  →  GET /api/warranty          (Admin)
// ══════════════════════════════════════════════════════════════════
exports.getAllWarranties = async (req, res) => {
  try {
    const warranties = await Warranty.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: warranties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ══════════════════════════════════════════════════════════════════
// GET SINGLE WARRANTY  →  GET /api/warranty/:id
// ══════════════════════════════════════════════════════════════════
exports.getWarrantyById = async (req, res) => {
  try {
    const warranty = await Warranty.findById(req.params.id).lean();
    if (!warranty)
      return res
        .status(404)
        .json({ success: false, message: 'Warranty not found' });

    res.status(200).json({ success: true, data: warranty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ══════════════════════════════════════════════════════════════════
// CHECK BY SERIAL NUMBER  →  GET /api/warranty/check/:serialNumber
// ══════════════════════════════════════════════════════════════════
exports.checkWarrantyBySerial = async (req, res) => {
  try {
    const warranty = await Warranty.findOne({
      serialNumber: req.params.serialNumber,
    });

    if (!warranty) {
      return res.status(404).json({
        success: false,
        message: 'No warranty found for this serial number.',
      });
    }

    res.status(200).json({ success: true, data: warranty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ══════════════════════════════════════════════════════════════════
// UPDATE STATUS  →  PUT /api/warranty/:id/status     (Admin)
// ══════════════════════════════════════════════════════════════════
exports.updateWarrantyStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Pending' | 'Approved' | 'Rejected'

    const warranty = await Warranty.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after' },
    );

    if (!warranty)
      return res
        .status(404)
        .json({ success: false, message: 'Warranty not found' });

    res.status(200).json({
      success: true,
      message: `Warranty status updated to ${status}`,
      data: warranty,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ══════════════════════════════════════════════════════════════════
// DELETE WARRANTY  →  DELETE /api/warranty/:id       (Admin)
// ══════════════════════════════════════════════════════════════════
exports.deleteWarranty = async (req, res) => {
  try {
    const warranty = await Warranty.findByIdAndDelete(req.params.id);
    if (!warranty)
      return res
        .status(404)
        .json({ success: false, message: 'Warranty not found' });

    res.status(200).json({ success: true, message: 'Warranty deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
