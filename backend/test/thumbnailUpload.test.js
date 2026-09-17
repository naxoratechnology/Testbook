const test = require('node:test');
const assert = require('node:assert/strict');
const cloudinary = require('../src/config/cloudinary');
let uploaded;
let destroyed;
cloudinary.uploadBuffer = async (_buffer, options) => { uploaded = options; return { secure_url: 'https://example.com/new.png', public_id: 'new-image' }; };
cloudinary.destroy = async (id, resourceType) => { destroyed.push({ id, resourceType }); };
const { saveThumbnail, thumbnailUpload, removeThumbnail } = require('../src/utils/thumbnailUpload');
const file = { buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), mimetype: 'image/png' };
const modelFor = (item) => ({ findById: () => ({ select: () => Promise.resolve(item) }) });

test('removing an uploaded thumbnail deletes its image and clears the reference', async () => {
  destroyed = [];
  let saved = false;
  const item = { thumbnail: 'https://example.com/image.png', thumbnailPublicId: 'owned-image', save: async () => { saved = true; } };
  await removeThumbnail(modelFor(item), 'id');
  assert.equal(saved, true);
  assert.equal(item.thumbnail, '');
  assert.equal(item.thumbnailPublicId, '');
  assert.deepEqual(destroyed, [{ id: 'owned-image', resourceType: 'image' }]);
});
test('external thumbnail removal does not delete unowned Cloudinary assets', async () => {
  destroyed = [];
  const item = { thumbnail: 'https://example.com/image.png', save: async () => {} };
  await removeThumbnail(modelFor(item), 'id');
  assert.equal(item.thumbnail, '');
  assert.deepEqual(destroyed, []);
});
test('removing a thumbnail from unknown content returns 404', async () => {
  await assert.rejects(removeThumbnail(modelFor(null), 'id'), { statusCode: 404 });
});

test('missing thumbnail is rejected', async () => {
  await assert.rejects(saveThumbnail(modelFor(null), 'id', null, 'courses'), { statusCode: 400 });
});
test('unknown content is rejected before uploading', async () => {
  await assert.rejects(saveThumbnail(modelFor(null), 'id', file, 'courses'), { statusCode: 404 });
});
test('non-image file bytes are rejected', async () => {
  await assert.rejects(saveThumbnail(modelFor({}), 'id', { buffer: Buffer.from('fake image') }, 'courses'), { statusCode: 400 });
});
test('thumbnail is saved and previous owned image is deleted', async () => {
  destroyed = [];
  let saved = false;
  const item = { thumbnailPublicId: 'old-image', save: async () => { saved = true; } };
  const result = await saveThumbnail(modelFor(item), 'id', file, 'test-series');
  assert.equal(saved, true);
  assert.equal(result.thumbnail, 'https://example.com/new.png');
  assert.equal(result.thumbnailPublicId, 'new-image');
  assert.equal(uploaded.folder, 'testbook/test-series/thumbnails');
  assert.equal(uploaded.resource_type, 'image');
  assert.deepEqual(destroyed, [{ id: 'old-image', resourceType: 'image' }]);
});
test('failed database save removes new image, not the old one', async () => {
  destroyed = [];
  const item = { thumbnailPublicId: 'old-image', save: async () => { throw new Error('save failed'); } };
  await assert.rejects(saveThumbnail(modelFor(item), 'id', file, 'courses'), /save failed/);
  assert.deepEqual(destroyed, [{ id: 'new-image', resourceType: 'image' }]);
});
test('multipart middleware rejects oversized and unsupported images', async () => {
  const express = require('express');
  const app = express();
  app.post('/', thumbnailUpload, (_req, res) => res.json({ success: true }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const url = `http://127.0.0.1:${server.address().port}`;
    const invalid = new FormData(); invalid.append('thumbnail', new Blob(['pdf'], { type: 'application/pdf' }), 'invalid.pdf');
    const unsupported = await fetch(url, { method: 'POST', body: invalid });
    assert.equal(unsupported.status, 400);
    const oversized = new FormData(); oversized.append('thumbnail', new Blob([Buffer.alloc(5 * 1024 * 1024 + 1)], { type: 'image/png' }), 'large.png');
    const tooLarge = await fetch(url, { method: 'POST', body: oversized });
    assert.equal(tooLarge.status, 413);
  } finally { await new Promise((resolve) => server.close(resolve)); }
});
