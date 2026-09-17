const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const gateway = { orders: { create: async (data) => ({ ...data, id: 'order_1' }) }, payments: { fetch: async () => ({ id: 'pay_1', order_id: 'order_1', amount: 19900, currency: 'INR', status: 'captured' }) } };
require('razorpay');
require.cache[require.resolve('razorpay')].exports = function FakeRazorpay() { return gateway; };
const Purchase = require('../src/modules/previousPaper/previousPaper.purchase.model');
const Paper = require('../src/modules/previousPaper/previousPaper.model');
const Directory = require('../src/modules/previousPaper/previousPaper.directory.model');
const Settings = require('../src/modules/previousPaper/previousPaper.settings.model');
Settings.findById = () => ({ lean: async () => null });
const payment = require('../src/modules/previousPaper/previousPaper.payment.service');
const service = require('../src/modules/previousPaper/previousPaper.service');
const validation = require('../src/modules/previousPaper/previousPaper.validation');
process.env.RAZORPAY_KEY_ID = 'test-key'; process.env.RAZORPAY_KEY_SECRET = 'test-secret';
test('one active pass grants access independent of exam or directory', async () => {
  Purchase.exists = async (filter) => { assert.deepEqual(filter, { user: 'student', status: 'active' }); return true; };
  assert.equal(await payment.hasAccess('student'), true);
  assert.equal(await payment.hasAccess(null), false);
  assert.equal(await payment.hasAccess(null, 'admin'), true);
});
test('locked catalog hides PDF URLs and question content; pass holders never get answer keys', async () => {
  const paper = { title: 'SSC paper', exam: 'SSC', pdfUrl: 'private.pdf', pdfPublicId: 'owned', questions: [{ text: 'Question', correctAnswer: 0, explanation: 'Answer' }] };
  Paper.find = () => ({ sort: () => ({ lean: async () => [paper] }) });
  Purchase.exists = async () => false;
  const locked = (await service.list())[0]; assert.equal(locked.directory, 'SSC'); assert.equal(locked.pdfUrl, ''); assert.equal(locked.questionCount, 1); assert.deepEqual(locked.questions, []); assert.equal(locked.pdfPublicId, undefined);
  Purchase.exists = async () => true;
  const unlocked = (await service.list(false, {}, 'student'))[0]; assert.equal(unlocked.pdfUrl, 'private.pdf'); assert.equal(unlocked.questions[0].correctAnswer, undefined); assert.equal(unlocked.questions[0].explanation, undefined);
});
test('tests reject users without the global pass before creating attempts', async () => {
  Purchase.exists = async () => false;
  await assert.rejects(service.attempt('paper', 'student'), { statusCode: 403 });
});
test('directories retain legacy papers grouped by exam and custom directories', async () => {
  Directory.find = () => ({ sort: () => ({ lean: async () => [{ name: 'PSC' }] }) });
  Paper.find = () => ({ select: () => ({ lean: async () => [{ exam: 'SSC' }, { exam: 'SSC' }, { exam: 'PSC', directory: 'PSC Mains' }] }) });
  assert.deepEqual(await service.directories(), [{ name: 'PSC', paperCount: 0 }, { name: 'PSC Mains', paperCount: 1 }, { name: 'SSC', paperCount: 2 }]);
});
test('checkout sets the server-owned global price and keeps each order separately', async () => {
  Purchase.exists = async () => false; let saved;
  Purchase.create = async (data) => { saved = data; };
  const result = await payment.checkout('student'); assert.equal(result.order.amount, 19900); assert.equal(saved.amount, 199); assert.equal(saved.user, 'student'); assert.equal(saved.razorpayOrderId, 'order_1');
});
test('verification requires owner-bound order, valid signature, captured payment and exact amount', async () => {
  let activated = false;
  const record = { amount: 199, razorpayOrderId: 'order_1', save: async () => { activated = true; } };
  Purchase.findOne = async (filter) => { assert.equal(filter.user, 'student'); return record; };
  const data = { razorpay_order_id: 'order_1', razorpay_payment_id: 'pay_1', razorpay_signature: 'bad' };
  await assert.rejects(payment.verify('student', data), { statusCode: 400 }); assert.equal(activated, false);
  data.razorpay_signature = crypto.createHmac('sha256', 'test-secret').update('order_1|pay_1').digest('hex');
  gateway.payments.fetch = async () => ({ id: 'pay_1', order_id: 'order_1', amount: 1, currency: 'INR', status: 'captured' });
  await assert.rejects(payment.verify('student', data), { statusCode: 400 }); assert.equal(activated, false);
  gateway.payments.fetch = async () => ({ id: 'pay_1', order_id: 'order_1', amount: 19900, currency: 'INR', status: 'captured' });
  await payment.verify('student', data); assert.equal(record.status, 'active'); assert.equal(activated, true);
  Purchase.findOne = async () => null;
  await assert.rejects(payment.verify('other-user', data), { statusCode: 404 });
});
test('new uploads accept directory selection and legacy payloads default to exam', () => {
  const body = { title: 'Paper', exam: 'SSC', year: 2025, stage: 'Tier 1' };
  assert.equal(validation.validate(body).value.directory, 'SSC'); assert.equal(validation.validate({ ...body, directory: 'SSC CGL' }).value.directory, 'SSC CGL');
});
test('admin price is persisted with validation and checkout uses the saved price', async () => {
  let stored;
  Settings.findByIdAndUpdate = async (id, data, options) => { assert.equal(id, 'global-pass'); assert.equal(options.upsert, true); stored = data.price; return data; };
  for (const invalid of [0, -1, '199', null, NaN, Infinity, 1.123, 1000001]) await assert.rejects(payment.updatePrice(invalid), { statusCode: 400 });
  assert.deepEqual(await payment.updatePrice(349.50), { price: 349.50 });
  Settings.findById = () => ({ lean: async () => ({ price: stored }) });
  assert.equal(await payment.getPrice(), 349.50);
  Purchase.exists = async () => false;
  let saved;
  Purchase.create = async (data) => { saved = data; };
  const result = await payment.checkout('student');
  assert.equal(result.order.amount, 34950); assert.equal(saved.amount, 349.50);
  Settings.findById = () => ({ lean: async () => null });
});
test('free access persists zero price, unlocks papers and skips payment orders', async () => {
  Settings.findByIdAndUpdate = async (_id, data) => data;
  assert.deepEqual(await payment.updatePrice(undefined, 'free'), { price: 0 });
  await assert.rejects(payment.updatePrice(199, 'invalid'), { statusCode: 400 });
  Settings.findById = () => ({ lean: async () => ({ price: 0 }) });
  Purchase.exists = async () => false;
  assert.equal(await payment.hasAccess(null), true);
  await payment.requireAccess('student');
  assert.deepEqual(await payment.checkout('student'), { purchased: true });
  Settings.findById = () => ({ lean: async () => ({ price: 199 }) });
  assert.equal(await payment.hasAccess(null), false);
  await assert.rejects(payment.requireAccess('student'), { statusCode: 403 });
  Settings.findById = () => ({ lean: async () => null });
});
