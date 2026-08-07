const { FAQ } = require('../models/Faq');

// ── CREATE  →  POST /api/faq ────────────────────────────────────
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer, order } = req.body;

    const faq = await FAQ.create({ question, answer, order });

    res.status(201).json({ success: true, message: 'FAQ created', data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET ALL  →  GET /api/faq ────────────────────────────────────
exports.getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({
      order: 1,
      createdAt: 1,
    });
    res.status(200).json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET ALL (Admin — inactive bhi)  →  GET /api/faq/admin/all ──
exports.getAllFAQsAdmin = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1, createdAt: 1 });
    res.status(200).json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE  →  GET /api/faq/:id ────────────────────────────
exports.getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq)
      return res.status(404).json({ success: false, message: 'FAQ not found' });

    res.status(200).json({ success: true, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE  →  PUT /api/faq/:id ─────────────────────────────────
exports.updateFAQ = async (req, res) => {
  try {
    const { question, answer, order, isActive } = req.body;

    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { question, answer, order, isActive },
      { new: true },
    );
    if (!faq)
      return res.status(404).json({ success: false, message: 'FAQ not found' });

    res.status(200).json({ success: true, message: 'FAQ updated', data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE  →  DELETE /api/faq/:id ──────────────────────────────
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq)
      return res.status(404).json({ success: false, message: 'FAQ not found' });

    res.status(200).json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
