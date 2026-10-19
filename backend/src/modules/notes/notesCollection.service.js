const Collection = require('./notesCollection.model');
const Notes = require('./notes.model');
const Purchase = require('./notes.purchase.model');
const { destroy } = require('../../config/cloudinary');

const clean = (data = {}) => ({ title: String(data.title || '').trim(), description: String(data.description || '').trim(), exam: String(data.exam || '').trim(), subjects: Array.isArray(data.subjects) ? data.subjects.map((value) => String(value).trim()).filter(Boolean) : [], access: data.access === 'paid' ? 'paid' : 'free', price: data.access === 'paid' ? Number(data.price) : 0, status: ['draft', 'published', 'unpublished'].includes(data.status) ? data.status : 'draft' });
const validate = (value) => { if (!value.title || !value.exam) throw Object.assign(new Error('Title and exam are required.'), { statusCode: 400 }); if (value.access === 'paid' && (!Number.isFinite(value.price) || value.price < 1 || value.price > 1000000)) throw Object.assign(new Error('Enter a valid collection price.'), { statusCode: 400 }); if (new Set(value.subjects.map((item) => item.toLowerCase())).size !== value.subjects.length) throw Object.assign(new Error('Subject names must be unique.'), { statusCode: 400 }); };
async function list(admin = false) { const items = await Collection.find(admin ? {} : { status: 'published' }).sort({ createdAt: -1 }).lean(); const counts = await Notes.aggregate([{ $match: { collection: { $in: items.map((item) => item._id) } } }, { $group: { _id: '$collection', count: { $sum: 1 } } }]); const map = new Map(counts.map((item) => [String(item._id), item.count])); return items.map((item) => ({ ...item, noteCount: map.get(String(item._id)) || 0 })); }
async function find(id, admin = false) { const item = await Collection.findOne(admin ? { _id: id } : { _id: id, status: 'published' }).lean(); if (!item) throw Object.assign(new Error('Notes collection not found.'), { statusCode: 404 }); return item; }
async function create(data, userId) { const value = clean(data); validate(value); return Collection.create({ ...value, createdBy: userId }); }
async function update(id, data) { const value = clean(data); validate(value); const item = await Collection.findByIdAndUpdate(id, value, { new: true, runValidators: true }); if (!item) throw Object.assign(new Error('Notes collection not found.'), { statusCode: 404 }); return item; }
async function remove(id) {
  const collection = await Collection.findById(id).select('+thumbnailPublicId');
  if (!collection) throw Object.assign(new Error('Notes collection not found.'), { statusCode: 404 });

  const notes = await Notes.find({ collection: id }).select('+thumbnailPublicId');
  for (const note of notes) {
    if (note.pdfPublicId) await destroy(note.pdfPublicId, 'raw');
    if (note.thumbnailPublicId) await destroy(note.thumbnailPublicId, 'image');
  }
  if (collection.thumbnailPublicId) await destroy(collection.thumbnailPublicId, 'image');

  const noteIds = notes.map((note) => note._id);
  if (noteIds.length) await Purchase.deleteMany({ notes: { $in: noteIds } });
  await Notes.deleteMany({ collection: id });
  await collection.deleteOne();
}
module.exports = { list, find, create, update, remove };
