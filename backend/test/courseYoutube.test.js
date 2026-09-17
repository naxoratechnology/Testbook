const test = require('node:test');
const assert = require('node:assert/strict');
const Course = require('../src/modules/course/course.model');
const upload = require('../src/modules/course/course.upload');
const cloudinary = require('../src/config/cloudinary');
let uploads = []; let deletions = [];
upload.uploadLesson = async (_file, kind) => { uploads.push(kind); return { url: `${kind}.url`, publicId: kind, resourceType: kind === 'pdf' ? 'raw' : 'video' }; };
cloudinary.destroy = async (id, type) => { deletions.push({ id, type }); };
const service = require('../src/modules/course/course.service');
const { youtubeEmbedUrl } = require('../src/modules/course/course.youtube');
const id = 'M7lc1UVf-VE';
test('YouTube watch, short, embed, shorts and live URLs become canonical embeds', () => {
  for (const url of [`https://www.youtube.com/watch?v=${id}&t=30`, `https://youtu.be/${id}?si=share`, `https://m.youtube.com/shorts/${id}`, `https://www.youtube.com/live/${id}`, `https://www.youtube-nocookie.com/embed/${id}`]) assert.equal(youtubeEmbedUrl(url), `https://www.youtube.com/embed/${id}`);
  for (const url of ['javascript:alert(1)', `https://youtube.com.evil.test/watch?v=${id}`, 'https://youtube.com/playlist?list=123', 'https://youtu.be/invalid', `https://youtube.com@evil.test/watch?v=${id}`, `https://youtube.com:123/watch?v=${id}`]) assert.throws(() => youtubeEmbedUrl(url), { statusCode: 400 });
});
test('lecture source is exclusive and validation happens before uploads', async () => {
  Course.findById = async () => ({ lectures: [], save: async () => {} }); uploads = [];
  await assert.rejects(service.addLecture('course', {}, { title: 'Lecture' }), { statusCode: 400 });
  await assert.rejects(service.addLecture('course', { video: [{}] }, { title: 'Lecture', youtubeUrl: `https://youtu.be/${id}` }), { statusCode: 400 });
  await assert.rejects(service.addLecture('course', {}, { title: 'Lecture', youtubeUrl: 'https://example.com/video' }), { statusCode: 400 });
  assert.deepEqual(uploads, []);
});
test('YouTube lecture stores an embed and uploads only its optional PDF notes', async () => {
  const course = { lectures: [], save: async () => {} }; Course.findById = async () => course; uploads = [];
  await service.addLecture('course', { pdf: [{}] }, { title: 'Lecture', youtubeUrl: `https://youtu.be/${id}` });
  const lecture = course.lectures[0]; assert.equal(lecture.videoSource, 'youtube'); assert.equal(lecture.url, `https://www.youtube.com/embed/${id}`); assert.equal(lecture.publicId, ''); assert.equal(lecture.pdfPublicId, 'pdf'); assert.deepEqual(uploads, ['pdf']);
  const model = new Course({ title: 'Course', description: 'Description', exam: 'SSC', category: 'SSC', instructor: 'Teacher', access: 'free', createdBy: '507f1f77bcf86cd799439011', lectures: [lecture] });
  assert.equal(model.validateSync(), undefined);
});
test('uploaded-video lectures keep the existing source and upload flow', async () => {
  const course = { lectures: [], save: async () => {} }; Course.findById = async () => course; uploads = [];
  await service.addLecture('course', { video: [{}] }, { title: 'Lecture' });
  assert.equal(course.lectures[0].videoSource, 'upload'); assert.equal(course.lectures[0].publicId, 'video'); assert.deepEqual(uploads, ['video']);
});
test('deleting a YouTube lecture deletes its owned PDF but never a YouTube resource', async () => {
  let removed = false; deletions = [];
  const lecture = { publicId: '', resourceType: 'youtube', pdfPublicId: 'pdf', pdfResourceType: 'raw', deleteOne: () => { removed = true; } };
  Course.findById = async () => ({ lectures: { id: () => lecture }, save: async () => {} });
  await service.removeLesson('course', null, 'lecture'); assert.equal(removed, true); assert.deepEqual(deletions, [{ id: 'pdf', type: 'raw' }]);
});
