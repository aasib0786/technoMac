const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: 'General',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    content: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    author: {
      type: String,
      trim: true,
      default: 'TechnoMac Team',
    },
    readTime: {
      type: String,
      trim: true,
      default: '5 min read',
    },
    // ── SEO Fields ─────────────────────────────────────────────────────────────
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
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', BlogSchema);
