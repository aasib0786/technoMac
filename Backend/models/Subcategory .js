const mongoose = require('mongoose');

const SubCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // ✅ Category reference (Category → SubCategory)
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    // ✅ NEW: direct parentCategoryId for easier filtering
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
SubCategorySchema.index({ category: 1, isActive: 1 });
SubCategorySchema.index({ parentCategoryId: 1, isActive: 1 });
SubCategorySchema.index({ isActive: 1, createdAt: -1 });

exports.SubCategory = mongoose.model('SubCategory', SubCategorySchema);