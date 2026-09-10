const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  series: { type: mongoose.Schema.Types.ObjectId, ref: 'TestSeries', required: true },
  status: { type: String, enum: ['active', 'refunded'], default: 'active' },
}, { timestamps: true, versionKey: false });
schema.index({ user: 1, series: 1 }, { unique: true });
module.exports = mongoose.model('TestSeriesPurchase', schema);
