const crypto = require('crypto');
const Razorpay = require('razorpay');
const Purchase = require('./previousPaper.purchase.model');
const Settings = require('./previousPaper.settings.model');
const DEFAULT_PRICE = 199;
const fail = (message, statusCode) => Object.assign(new Error(message), { statusCode });
async function getPrice() { const settings = await Settings.findById('global-pass').lean(); return settings?.price ?? DEFAULT_PRICE; }
async function updatePrice(price, access = 'paid') {
  if (!['free', 'paid'].includes(access)) throw fail('Select Free or Paid access.', 400);
  if (access === 'free') price = 0;
  if (typeof price !== 'number' || !Number.isFinite(price) || (access === 'paid' && price < 1) || price > 1000000 || Math.abs(price * 100 - Math.round(price * 100)) > 0.000001) throw fail('Enter a price between ₹1 and ₹10,00,000 with at most two decimal places.', 400);
  const settings = await Settings.findByIdAndUpdate('global-pass', { price }, { upsert: true, new: true, runValidators: true });
  return { price: settings.price };
}
async function hasAccess(userId, role) { return role === 'admin' || await getPrice() === 0 || Boolean(userId && await Purchase.exists({ user: userId, status: 'active' })); }
async function requireAccess(userId, role) { if (!await hasAccess(userId, role)) throw fail('Purchase the previous papers pass to access all PDFs and tests.', 403); }
function client() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw fail('Razorpay is not configured.', 503);
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}
async function checkout(userId) {
  if (await hasAccess(userId)) return { purchased: true };
  const price = await getPrice();
  if (price === 0) return { free: true, purchased: true };
  const order = await client().orders.create({ amount: Math.round(price * 100), currency: 'INR', receipt: `papers_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`, notes: { userId: String(userId), product: 'all-previous-papers' } });
  await Purchase.create({ user: userId, amount: price, razorpayOrderId: order.id });
  return { order, keyId: process.env.RAZORPAY_KEY_ID };
}
async function verify(userId, data = {}) {
  if (!['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'].every((key) => typeof data[key] === 'string' && data[key])) throw fail('Payment details are required.', 400);
  const purchase = await Purchase.findOne({ user: userId, razorpayOrderId: data.razorpay_order_id });
  if (!purchase) throw fail('Payment order not found.', 404);
  const gateway = client();
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${purchase.razorpayOrderId}|${data.razorpay_payment_id}`).digest();
  const received = Buffer.from(data.razorpay_signature, 'hex');
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) throw fail('Payment verification failed.', 400);
  const payment = await gateway.payments.fetch(data.razorpay_payment_id);
  if (payment.order_id !== purchase.razorpayOrderId || payment.amount !== Math.round(purchase.amount * 100) || payment.currency !== 'INR' || payment.status !== 'captured') throw fail('Payment is not captured. Please retry verification or contact support.', 400);
  purchase.status = 'active'; purchase.razorpayPaymentId = payment.id; purchase.purchasedAt = purchase.purchasedAt || new Date();
  await purchase.save(); return purchase;
}
module.exports = { getPrice, updatePrice, hasAccess, requireAccess, checkout, verify };
