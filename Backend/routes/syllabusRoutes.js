// backend/routes/syllabusRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const syllabusController = require('../controllers/syllabusController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/process-syllabus', upload.single('syllabusFile'), syllabusController.processSyllabus);

module.exports = router;