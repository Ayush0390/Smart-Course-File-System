// Backend/models/timetableModel.js
const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    facultyName: { type: String, required: true },
    pattern: { type: String, required: true },  // e.g. 2019, 2024
    year: { type: String, required: true },     // e.g. FE, SE, TE, BE
    subject: { type: String, required: true },
    filePath: { type: String, required: true }, // path to uploaded file
  },
  { timestamps: true }
);

module.exports = mongoose.model('Timetable', timetableSchema);
