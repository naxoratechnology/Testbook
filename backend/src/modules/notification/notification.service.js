const Notification = require('./notification.model');
async function create(data, userId) { return Notification.create({ ...data, createdBy: userId }); }
async function adminList() { return Notification.find().sort({ createdAt: -1 }).lean(); }
async function userList(userId) { return Notification.find({ $or: [{ audience: 'all' }, { recipients: userId }] }).sort({ createdAt: -1 }).lean(); }
async function update(id, data) { const item = await Notification.findByIdAndUpdate(id, data, { new: true, runValidators: true }); if (!item) throw Object.assign(new Error('Notification not found.'), { statusCode: 404 }); return item; }
async function remove(id) { if (!await Notification.findByIdAndDelete(id)) throw Object.assign(new Error('Notification not found.'), { statusCode: 404 }); }
async function markRead(id, userId) { const item = await Notification.findOneAndUpdate({ _id: id, $or: [{ audience: 'all' }, { recipients: userId }] }, { $addToSet: { readBy: userId } }, { new: true }); if (!item) throw Object.assign(new Error('Notification not found.'), { statusCode: 404 }); return item; }
module.exports = { create, adminList, userList, update, remove, markRead };
