const mongoose = require('mongoose');
const schema = new mongoose.Schema({ name: { type: String, required: true, trim: true, maxlength: 120, unique: true } }, { timestamps: true, versionKey: false });
module.exports = mongoose.model('PreviousPaperDirectory', schema);
