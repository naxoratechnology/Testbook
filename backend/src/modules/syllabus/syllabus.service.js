const Syllabus = require('./syllabus.model');
const { uploadPdf } = require('./syllabus.upload');
const { destroy } = require('../../config/cloudinary');
const notifications = require('../notification/notification.service');
async function create(data, file, userId) { const item = new Syllabus({ ...data, createdBy: userId, pdfUrl: 'pending', pdfPublicId: 'pending' }); Object.assign(item, await uploadPdf(file, item._id.toString())); await item.save(); if (item.status === 'published') await notifications.publish({ title: 'New syllabus available', message: item.title, type: 'syllabus', href: '/syllabus', userId }); return item; }
async function list(admin = false) { return Syllabus.find(admin ? {} : { status: 'published' }).sort({ createdAt: -1 }).lean(); }
async function find(id, admin = false) { const item = await Syllabus.findOne(admin ? { _id: id } : { _id: id, status: 'published' }).lean(); if (!item) throw Object.assign(new Error('Syllabus not found.'), { statusCode: 404 }); return item; }
async function update(id, data) { const item = await Syllabus.findByIdAndUpdate(id, data, { new: true, runValidators: true }); if (!item) throw Object.assign(new Error('Syllabus not found.'), { statusCode: 404 }); return item; }
async function remove(id) { const item = await Syllabus.findById(id); if (!item) throw Object.assign(new Error('Syllabus not found.'), { statusCode: 404 }); if (item.pdfPublicId) await destroy(item.pdfPublicId, 'raw'); await item.deleteOne(); }
module.exports = { create, list, find, update, remove };
