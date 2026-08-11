const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // e.g. "Dr. Amit Sharma"
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true, // e.g. "MDS Orthodontist"
    },
    review: {
      type: String,
      required: true, // testimonial text
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    image: {
      type: String,
      default: '', // profile photo path
    },
    order: {
      type: Number,
      default: 0, // display sequence control
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Performance Indexes
TestimonialSchema.index({ isActive: 1, order: 1, createdAt: -1 });

exports.Testimonial = mongoose.model('Testimonial', TestimonialSchema);
