const Notice = require('./notice.model');
const notifications = require('../notification/notification.service');
async function list(query = {}, admin = false) { const filter = admin ? {} : { status: 'published' }; if (query.type) filter.type = query.type; if (query.search) filter.$text = { $search: query.search }; return Notice.find(filter).sort({ createdAt: -1 }).lean(); }
async function find(id, admin = false) { const item = await Notice.findOne(admin ? { _id: id } : { _id: id, status: 'published' }).lean(); if (!item) throw Object.assign(new Error('Notice not found.'), { statusCode: 404 }); return item; }
async function create(data, userId) { const item = await Notice.create({ ...data, createdBy: userId }); if (item.status === 'published') await notifications.publish({ title: 'New notice published', message: item.title, type: 'notice', href: `/notices/${item._id}`, userId }); return item; }
async function update(id, data) { const item = await Notice.findByIdAndUpdate(id, data, { new: true, runValidators: true }); if (!item) throw Object.assign(new Error('Notice not found.'), { statusCode: 404 }); return item; }
async function remove(id) { if (!await Notice.findByIdAndDelete(id)) throw Object.assign(new Error('Notice not found.'), { statusCode: 404 }); }
module.exports = { list, find, create, update, remove };
