// const mongoose = require('mongoose');

// const ProductSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     // ✅ Full category chain
//     parentCategoryId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'ParentCategory',
//       required: true,
//     },
//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Category',
//     },
//     subCategory: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'SubCategory',
//     },
//     price: {
//       type: Number,
//       default: 0,
//     },
//     images: [{ type: String }],
//     model: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       index: true,
//     },
//     description: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     specifications: [
//       {
//         key: { type: String },
//         value: { type: String },
//       },
//     ],
//     features: [{ type: String, trim: true }],
//     isActive: { type: Boolean, default: true },
//     isFeatured: { type: Boolean, default: false },
//   },
//   { timestamps: true },
// );

// exports.Product = mongoose.model('Product', ProductSchema);


const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // ✅ Full category chain — all optional now
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
    model: {
      type: String,
      // trim: true,
      // // sparse: lets multiple products have NO model without violating
      // // the unique constraint — a plain unique index only allows ONE
      // // document with a missing/null value, sparse allows many
      // unique: true,
      // sparse: true,
    },
    description: {
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
);

exports.Product = mongoose.model('Product', ProductSchema);