const mongoose = require('mongoose');
const schema = new mongoose.Schema({ _id: { type: String, default: 'global-pass' }, price: { type: Number, required: true, min: 0, max: 1000000 } }, { timestamps: true, versionKey: false });
module.exports = mongoose.model('PreviousPaperSettings', schema);
