const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      default: '',
    },
    // ✅ Full category chain — optional
    parentCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParentCategory',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
    },
    price: {
      type: Number,
      default: 0,
    },
    images: [{ type: String }],
    sku: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    metaTitle: {
      type: String,
      trim: true,
      default: '',
    },
    metaDescription: {
      type: String,
      trim: true,
      default: '',
    },
    metaKeywords: {
      type: String,
      trim: true,
      default: '',
    },
    canonicalUrl: {
      type: String,
      trim: true,
      default: '',
    },
    specifications: [
      {
        key: { type: String },
        value: { type: String },
      },
    ],
    features: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
)
// Performance Indexes for high-speed queries
ProductSchema.index({ slug: 1 });
ProductSchema.index({ isActive: 1, createdAt: -1 });
ProductSchema.index({ category: 1, isActive: 1, createdAt: -1 });
ProductSchema.index({ subCategory: 1, isActive: 1, createdAt: -1 });
ProductSchema.index({ parentCategoryId: 1, isActive: 1, createdAt: -1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });
ProductSchema.index({ name: 1 });

const Product = mongoose.model('Product', ProductSchema);

// Auto-drop stale 'model_1' unique index if it still exists in MongoDB
Product.collection.dropIndex('model_1').catch(() => {});
Product.syncIndexes().catch(() => {});

exports.Product = Product;