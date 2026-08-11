const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Performance Indexes
certificateSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Certificate', certificateSchema);
