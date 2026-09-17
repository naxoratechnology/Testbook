const mongoose = require('mongoose');
const schema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, status: { type: String, enum: ['pending', 'active'], default: 'pending' }, amount: { type: Number, required: true }, currency: { type: String, default: 'INR' }, razorpayOrderId: { type: String, required: true, unique: true }, razorpayPaymentId: String, purchasedAt: Date }, { timestamps: true, versionKey: false });
module.exports = mongoose.model('PreviousPaperPurchase', schema);
