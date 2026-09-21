const Notes = require('./notes.model');
const { uploadPdf } = require('./notes.upload');
const { destroy } = require('../../config/cloudinary');
const notifications = require('../notification/notification.service');
async function create(data, file, userId) { const item = new Notes({ ...data, createdBy: userId, pdfUrl: 'pending', pdfPublicId: 'pending' }); const media = await uploadPdf(file, item._id.toString()); Object.assign(item, media); await item.save(); if (item.status === 'published') await notifications.publish({ title: 'New notes available', message: item.title, type: 'notes', href: '/notes', userId }); return item; }
async function list(query = {}, admin = false) { const filter = admin ? {} : { status: 'published' }; if (query.exam) filter.exam = query.exam; if (query.subject) filter.subject = query.subject; if (query.search) filter.$text = { $search: query.search }; return Notes.find(filter).sort({ createdAt: -1 }).lean(); }
async function find(id, admin = false) { const item = await Notes.findOne(admin ? { _id: id } : { _id: id, status: 'published' }).lean(); if (!item) throw Object.assign(new Error('Notes not found.'), { statusCode: 404 }); return item; }
async function update(id, data) { const item = await Notes.findByIdAndUpdate(id, data, { new: true, runValidators: true }); if (!item) throw Object.assign(new Error('Notes not found.'), { statusCode: 404 }); return item; }
async function remove(id) { const item = await Notes.findById(id).select('+thumbnailPublicId'); if (!item) throw Object.assign(new Error('Notes not found.'), { statusCode: 404 }); if (item.pdfPublicId) await destroy(item.pdfPublicId, 'raw'); if (item.thumbnailPublicId) await destroy(item.thumbnailPublicId, 'image'); await item.deleteOne(); }
module.exports = { create, list, find, update, remove };
