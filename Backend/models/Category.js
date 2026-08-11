const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    // ✅ FIX: parentCategoryId properly defined with ref
    parentCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParentCategory',
      required: true,
    },
    image: {
      type: String,
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
CategorySchema.index({ parentCategoryId: 1, isActive: 1 });
CategorySchema.index({ isActive: 1, createdAt: -1 });

exports.Category = mongoose.model('Category', CategorySchema);