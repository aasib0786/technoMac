const mongoose = require('mongoose');

const contactInfoSchema = new mongoose.Schema(
  {
    salesPhone: {
      type: String,
      default: '+91-8448825572, +91-9268825571, +91-9599090411',
    },
    servicePhone: {
      type: String,
      default: '+91 9311125574',
    },
    email: {
      type: String,
      default: 'info@technomac.com',
    },
    address: {
      type: String,
      default:
        'Plot no.-88, Pocket- L, Sector 1, Bawana Industrial Area, DSIIDC Sub-city, New Delhi-110039, India',
    },
    whatsappPhone: {
      type: String,
      default: '+919311125574',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactInfo', contactInfoSchema);
