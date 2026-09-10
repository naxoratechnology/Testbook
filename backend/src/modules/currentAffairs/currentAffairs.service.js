const Affairs = require('./currentAffairs.model');
const { uploadPdf } = require('./currentAffairs.upload');
const { destroy } = require('../../config/cloudinary');
async function create(data, file, userId) { const item = new Affairs({ ...data, createdBy: userId, pdfUrl: 'pending', pdfPublicId: 'pending' }); Object.assign(item, await uploadPdf(file, item._id.toString())); await item.save(); return item; }
async function list(admin = false) { return Affairs.find(admin ? {} : { status: 'published' }).sort({ date: -1 }).lean(); }
async function find(id, admin = false) { const item = await Affairs.findOne(admin ? { _id: id } : { _id: id, status: 'published' }).lean(); if (!item) throw Object.assign(new Error('Current affairs entry not found.'), { statusCode: 404 }); return item; }
async function update(id, data) { const item = await Affairs.findByIdAndUpdate(id, data, { new: true, runValidators: true }); if (!item) throw Object.assign(new Error('Current affairs entry not found.'), { statusCode: 404 }); return item; }
async function remove(id) { const item = await Affairs.findByIdAndDelete(id); if (!item) throw Object.assign(new Error('Current affairs entry not found.'), { statusCode: 404 }); await destroy(item.pdfPublicId, 'raw'); }
module.exports = { create, list, find, update, remove };
