const Paper = require('./previousPaper.model');
const { uploadPdf } = require('./previousPaper.upload');
const { destroy } = require('../../config/cloudinary');
async function create(data, file, userId) { const item = new Paper({ ...data, createdBy: userId, pdfUrl: 'pending', pdfPublicId: 'pending' }); Object.assign(item, await uploadPdf(file, item._id.toString())); await item.save(); return item; }
async function list(admin = false, query = {}) { const filter = admin ? {} : { status: 'published' }; if (query.exam) filter.exam = query.exam; if (query.year) filter.year = Number(query.year); if (query.subject) filter.subject = query.subject; return Paper.find(filter).sort({ year: -1, createdAt: -1 }).lean(); }
async function find(id, admin = false) { const item = await Paper.findOne(admin ? { _id: id } : { _id: id, status: 'published' }).lean(); if (!item) throw Object.assign(new Error('Previous year paper not found.'), { statusCode: 404 }); return item; }
async function update(id, data) { const item = await Paper.findByIdAndUpdate(id, data, { new: true, runValidators: true }); if (!item) throw Object.assign(new Error('Previous year paper not found.'), { statusCode: 404 }); return item; }
async function remove(id) { const item = await Paper.findByIdAndDelete(id); if (!item) throw Object.assign(new Error('Previous year paper not found.'), { statusCode: 404 }); await destroy(item.pdfPublicId, 'raw'); }
module.exports = { create, list, find, update, remove };
