const mongoose = require('mongoose');


const ParentCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // duplicate ParentCategory nahi ban sakti
    },
    image: {
      type: String, // image URL / path
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Performance Indexes
ParentCategorySchema.index({ isActive: 1, createdAt: -1 });

exports.ParentCategory = mongoose.model('ParentCategory', ParentCategorySchema);
