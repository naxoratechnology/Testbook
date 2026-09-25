const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  series: { type: mongoose.Schema.Types.ObjectId, ref: 'TestSeries', required: true },
  status: { type: String, enum: ['pending', 'active', 'refunded'], default: 'pending' },
  amount: { type: Number, default: 0 }, currency: { type: String, default: 'INR' },
  razorpayOrderId: { type: String, default: '', index: true }, razorpayPaymentId: { type: String, default: '' }, purchasedAt: { type: Date, default: null },
  accessSource: { type: String, enum: ['payment', 'admin'], default: 'payment' }, grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true, versionKey: false });
schema.index({ user: 1, series: 1 }, { unique: true });
module.exports = mongoose.model('TestSeriesPurchase', schema);
