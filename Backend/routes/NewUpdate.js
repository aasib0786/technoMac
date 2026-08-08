const express = require('express');
const router = express.Router();

const multer = require('multer');
const newUpdateController = require('../controller/NewUpdate');

// multer — memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// fields: only image (no PDF for NewUpdate)
const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
]);

// POST   /api/newupdate/create   → createNewUpdate
router.post('/create', uploadFields, newUpdateController.createNewUpdate);

// GET    /api/newupdate/all      → getAllNewUpdates
router.get('/all', newUpdateController.getAllNewUpdates);

// GET    /api/newupdate/slug/:slug → getNewUpdateBySlug
router.get('/slug/:slug', newUpdateController.getNewUpdateBySlug);

// GET    /api/newupdate/:id      → getNewUpdateById
router.get('/:id', newUpdateController.getNewUpdateById);

// GET    /api/newupdate/subtitle/:subTitle → getBySubTitle
router.get('/subtitle/:subTitle', newUpdateController.getBySubTitle);

// PUT    /api/newupdate/:id      → updateNewUpdate
router.put('/:id', uploadFields, newUpdateController.updateNewUpdate);

// DELETE /api/newupdate/:id      → deleteNewUpdate
router.delete('/:id', newUpdateController.deleteNewUpdate);

module.exports = router;