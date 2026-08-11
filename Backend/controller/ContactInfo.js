const ContactInfo = require('../models/ContactInfo');

// ── GET CONTACT INFO ──────────────────────────────────────────────────────────
exports.getContactInfo = async (req, res) => {
  try {
    let contactInfo = await ContactInfo.findOne().lean();
    if (!contactInfo) {
      contactInfo = await ContactInfo.create({
        salesPhone: '+91-8448825572, +91-9268825571, +91-9599090411',
        servicePhone: '+91 9311125574',
        email: 'info@technomac.com',
        address:
          'Plot no.-88, Pocket- L, Sector 1, Bawana Industrial Area, DSIIDC Sub-city, New Delhi-110039, India',
        whatsappPhone: '+919311125574',
      });
    }

    res.status(200).json({
      success: true,
      data: contactInfo,
    });
  } catch (error) {
    console.error('getContactInfo error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ── UPDATE CONTACT INFO ───────────────────────────────────────────────────────
exports.updateContactInfo = async (req, res) => {
  try {
    const { salesPhone, servicePhone, email, address, whatsappPhone } = req.body;

    let contactInfo = await ContactInfo.findOne();

    const updateFields = {
      salesPhone: salesPhone !== undefined ? salesPhone.trim() : contactInfo?.salesPhone,
      servicePhone: servicePhone !== undefined ? servicePhone.trim() : contactInfo?.servicePhone,
      email: email !== undefined ? email.trim() : contactInfo?.email,
      address: address !== undefined ? address.trim() : contactInfo?.address,
      whatsappPhone: whatsappPhone !== undefined ? whatsappPhone.trim() : contactInfo?.whatsappPhone,
    };

    if (contactInfo) {
      contactInfo = await ContactInfo.findByIdAndUpdate(contactInfo._id, updateFields, {
        new: true,
        runValidators: true,
      });
    } else {
      contactInfo = await ContactInfo.create(updateFields);
    }

    res.status(200).json({
      success: true,
      message: 'Contact details updated successfully',
      data: contactInfo,
    });
  } catch (error) {
    console.error('updateContactInfo error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
