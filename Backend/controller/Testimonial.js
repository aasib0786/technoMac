const { Testimonial } = require('../models/Testimonial');
const cloudinary = require('../config/cloudinary');

// ── Helper: upload buffer → Cloudinary ──────────────────────────
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'testimonials', quality: 'auto', fetch_format: 'auto' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });
};

// ── CREATE  →  POST /api/testimonial ───────────────────────────
exports.createTestimonial = async (req, res) => {
  try {
    const { name, description, designation, review, rating, order } = req.body;
   
     // Upload image to Cloudinary if a file is sent (multipart/form-data)
      // OR use the URL string from req.body.image if sent via raw JSON
      let imageUrl = '';
      if (req.file) {
          const result = await uploadToCloudinary(req.file.buffer);
          imageUrl = result.secure_url;
      }

    const testimonial = await Testimonial.create({
      name,
      description,
      designation,
      review,
      rating,
      order,
      image :imageUrl,
    });

    res
      .status(201)
      .json({
        success: true,
        message: 'Testimonial created',
        data: testimonial,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET ALL (Frontend)  →  GET /api/testimonial ─────────────────
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true }).sort({
      order: 1,
      createdAt: -1,
    }).lean();

    res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET ALL (Admin)  →  GET /api/testimonial/admin/all ──────────
exports.getAllTestimonialsAdmin = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({
      order: 1,
      createdAt: -1,
    }).lean();
    res.status(200).json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE  →  GET /api/testimonial/:id ─────────────────────
exports.getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id).lean();
    if (!testimonial)
      return res
        .status(404)
        .json({ success: false, message: 'Testimonial not found' });

    res.status(200).json({ success: true, data: testimonial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE  →  PUT /api/testimonial/:id ─────────────────────────
exports.updateTestimonial = async (req, res) => {
  try {
    const { name,description, designation, review, rating, order, isActive } = req.body;
    const updateData = { name, description, designation, review, rating, order, isActive };

    // Upload new image to Cloudinary if a file is sent (multipart/form-data)
    // OR use the URL string from req.body.image if sent via raw JSON
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      updateData.image = result.secure_url;
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after' },
    );
    if (!testimonial)
      return res
        .status(404)
        .json({ success: false, message: 'Testimonial not found' });

    res
      .status(200)
      .json({
        success: true,
        message: 'Testimonial updated',
        data: testimonial,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE  →  DELETE /api/testimonial/:id ──────────────────────
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial)
      return res
        .status(404)
        .json({ success: false, message: 'Testimonial not found' });

    res.status(200).json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
