const Paper = require('./previousPaper.model');
const Attempt = require('./previousPaper.attempt.model');
const { uploadPdf } = require('./previousPaper.upload');
const { destroy } = require('../../config/cloudinary');
const payment = require('./previousPaper.payment.service');
const Directory = require('./previousPaper.directory.model');
const notifications = require('../notification/notification.service');
async function create(data, file, userId) { if (!file && !data.questions?.length) throw Object.assign(new Error('Upload a PDF or add an online test.'), { statusCode: 400 }); const item = new Paper({ ...data, createdBy: userId }); if (file) Object.assign(item, await uploadPdf(file, item._id.toString())); try { await item.save(); } catch (error) { if (item.pdfPublicId) await destroy(item.pdfPublicId, 'raw').catch(() => undefined); throw error; } if (item.status === 'published') await notifications.publish({ title: 'New previous year paper', message: item.title, type: 'previous-paper', href: `/previous-papers?directory=${encodeURIComponent(item.directory || item.exam)}`, userId }); return item; }
function publicPaper(item, unlocked = false) { const { pdfPublicId, ...safe } = item; return { ...safe, directory: item.directory || item.exam, unlocked, questionCount: (item.questions || []).length, pdfUrl: unlocked ? item.pdfUrl : '', questions: unlocked ? (item.questions || []).map(({ correctAnswer, explanation, ...question }) => question) : [] }; }
async function list(admin = false, query = {}, userId, role) { const filter = admin ? {} : { status: 'published' }; if (query.exam) filter.exam = query.exam; if (query.year) filter.year = Number(query.year); if (query.subject) filter.subject = query.subject; const items = await Paper.find(filter).sort({ year: -1, createdAt: -1 }).lean(); const unlocked = admin || await payment.hasAccess(userId, role); return admin ? items : items.map((item) => publicPaper(item, unlocked)); }
async function find(id, admin = false, userId, role) { const item = await Paper.findOne(admin ? { _id: id } : { _id: id, status: 'published' }).lean(); if (!item) throw Object.assign(new Error('Previous year paper not found.'), { statusCode: 404 }); return admin ? item : publicPaper(item, await payment.hasAccess(userId, role)); }
async function attempt(id, userId, answers = {}) { await payment.requireAccess(userId); const item = await Paper.findOne({ _id: id, status: 'published' }); if (!item) throw Object.assign(new Error('Previous year paper not found.'), { statusCode: 404 }); if (!item.questions.length) throw Object.assign(new Error('Online test is not available for this paper.'), { statusCode: 400 }); let score = 0; let correct = 0; let incorrect = 0; let unanswered = 0; item.questions.forEach((question) => { const answer = answers[question._id.toString()]; if (answer === undefined || answer === null) unanswered += 1; else if (Number(answer) === question.correctAnswer) { correct += 1; score += question.marks; } else { incorrect += 1; score -= question.negativeMarks; } }); const saved = await Attempt.create({ user: userId, paper: id, answers, score, correct, incorrect, unanswered }); return { ...saved.toObject(), title: item.title, totalMarks: item.questions.reduce((total, question) => total + question.marks, 0), questions: item.questions.map((question) => question.toObject()) }; }
async function update(id, data, file) { const existing = await Paper.findById(id); if (!existing) throw Object.assign(new Error('Previous year paper not found.'), { statusCode: 404 }); if (!existing.pdfUrl && !file && !data.questions?.length) throw Object.assign(new Error('A paper without a PDF must have an online test.'), { statusCode: 400 }); let media; if (file) media = await uploadPdf(file, id); try { const item = await Paper.findByIdAndUpdate(id, { ...data, ...(media || {}) }, { new: true, runValidators: true }); if (media && existing.pdfPublicId) await destroy(existing.pdfPublicId, 'raw').catch(error => console.warn('Previous paper PDF cleanup failed:', error.message)); return item; } catch (error) { if (media) await destroy(media.pdfPublicId, 'raw').catch(() => undefined); throw error; } }
async function remove(id) { const item = await Paper.findById(id); if (!item) throw Object.assign(new Error('Previous year paper not found.'), { statusCode: 404 }); if (item.pdfPublicId) await destroy(item.pdfPublicId, 'raw'); await item.deleteOne(); }
module.exports = { create, list, find, update, remove, attempt };

async function directories(admin = false) {
  const [saved, papers] = await Promise.all([Directory.find().sort({ name: 1 }).lean(), Paper.find(admin ? {} : { status: 'published' }).select('directory exam').lean()]);
  const names = new Set([...saved.map((item) => item.name), ...papers.map((item) => item.directory || item.exam)]);
  return [...names].sort().map((name) => ({ name, paperCount: papers.filter((item) => (item.directory || item.exam) === name).length }));
}
async function createDirectory(body) {
  const name = String(body.name || '').trim();
  if (!name || name.length > 120) throw Object.assign(new Error('Directory name is required (maximum 120 characters).'), { statusCode: 400 });
  return Directory.findOneAndUpdate({ name }, { $setOnInsert: { name } }, { upsert: true, new: true, runValidators: true });
}
module.exports.directories = directories;
module.exports.createDirectory = createDirectory;
