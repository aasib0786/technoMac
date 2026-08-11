const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0, // display order control karne ke liye
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Performance Indexes
FAQSchema.index({ isActive: 1, order: 1, createdAt: 1 });

exports.FAQ = mongoose.model('FAQ', FAQSchema);
