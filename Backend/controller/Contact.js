const Contact = require('../models/Contact');

exports.createContact = async (req, res) => {
  try {
    const { fullName, phoneNumber, email, productInterest, message } = req.body;
    console.log('AAAAAAAA', req.body)
    const contact = await Contact.create({
      fullName,
      phoneNumber,
      email,
      productInterest,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Form submitted successfully',
      contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({
      createdAt: -1,
    }).lean();

    res.status(200).json({
      success: true,
      contacts,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Contact deleted',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
