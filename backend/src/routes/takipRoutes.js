const express = require('express');
const router = express.Router();
const takipController = require('../controllers/takipController');

router.get('/', takipController.getAllTakip);
router.put('/:id', takipController.updateTakip);
router.delete('/', takipController.deleteMultipleTakip);
router.delete('/:id', takipController.deleteTakip);
router.post('/', takipController.createTakip);

module.exports = router;