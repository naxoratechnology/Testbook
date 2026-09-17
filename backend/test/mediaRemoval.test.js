const test = require('node:test');
const assert = require('node:assert/strict');
const cloudinary = require('../src/config/cloudinary');
const Course = require('../src/modules/course/course.model');
const Series = require('../src/modules/testSeries/testSeries.model');
let deleted = [];
let failure = false;
cloudinary.destroy = async (id, type) => { if (failure) throw new Error('Cloudinary unavailable'); deleted.push({ id, type }); };
const courses = require('../src/modules/course/course.service');
const series = require('../src/modules/testSeries/testSeries.service');

test('course deletion removes its thumbnail, lecture videos and PDFs', async () => {
  deleted = []; let removed = false;
  Course.findById = () => ({ select: async () => ({ thumbnailPublicId: 'thumbnail', lectures: [{ publicId: 'video', resourceType: 'video', pdfPublicId: 'notes', pdfResourceType: 'raw' }], deleteOne: async () => { removed = true; } }) });
  await courses.remove('id');
  assert.equal(removed, true);
  assert.deepEqual(deleted, [{ id: 'video', type: 'video' }, { id: 'notes', type: 'raw' }, { id: 'thumbnail', type: 'image' }]);
});
test('lecture deletion removes video and PDF before saving', async () => {
  deleted = []; let removed = false; let saved = false;
  const lecture = { publicId: 'video', resourceType: 'video', pdfPublicId: 'notes', deleteOne: () => { removed = true; } };
  Course.findById = async () => ({ lectures: { id: () => lecture }, save: async () => { saved = true; } });
  await courses.removeLesson('course', null, 'lecture');
  assert.equal(removed && saved, true);
  assert.deepEqual(deleted, [{ id: 'video', type: 'video' }, { id: 'notes', type: 'raw' }]);
});
test('failed Cloudinary deletion keeps the test series record available for retry', async () => {
  let removed = false;
  Series.findById = () => ({ select: async () => ({ thumbnailPublicId: 'thumbnail', deleteOne: async () => { removed = true; } }) });
  failure = true;
  try { await assert.rejects(series.remove('id'), /Cloudinary unavailable/); assert.equal(removed, false); }
  finally { failure = false; }
});
