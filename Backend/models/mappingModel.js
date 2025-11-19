// backend/models/mappingModel.js

const mongoose = require('mongoose');

const mappingSchema = new mongoose.Schema({
    subjectCode: { type: String, required: true, unique: true, uppercase: true },
    department: { type: String },
    year: { type: String },
    mappings: [{
        co_description: String,
    }]
}, { timestamps: true });

module.exports = mongoose.model('Mapping', mappingSchema);