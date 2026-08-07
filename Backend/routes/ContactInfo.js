const express = require('express');
const router = express.Router();
const { getContactInfo, updateContactInfo } = require('../controller/ContactInfo');

router.get('/', getContactInfo);
router.post('/', updateContactInfo);
router.put('/', updateContactInfo);
router.patch('/', updateContactInfo);

module.exports = router;
