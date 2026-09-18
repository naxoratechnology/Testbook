const test = require('node:test');
const assert = require('node:assert/strict');
const { validate } = require('../src/modules/settings/settings.validation');
const base = { platformName: 'Academy', supportEmail: 'help@example.com', defaultExam: 'SSC', aboutTitle: 'About', aboutDescription: 'Our academy', contactEmail: 'contact@example.com' };
test('public About route serves only public content without requiring login', async () => {
  const service = require('../src/modules/settings/settings.service');
  const controller = require('../src/modules/settings/settings.controller');
  const router = require('../src/modules/settings/settings.routes');
  assert.equal(router.stack[0].route.path, '/about');
  assert.equal(router.stack[0].route.stack.length, 1);
  const original = service.get;
  service.get = async () => ({ ...base, founderName: 'Founder', thumbnail: 'https://example.com/photo.jpg', thumbnailPublicId: 'private-id', autoNotify: true });
  try {
    let response;
    await controller.about({}, { json: data => { response = data; } }, error => { throw error; });
    assert.equal(response.data.content.founderName, 'Founder');
    assert.equal(response.data.content.founderPhoto, 'https://example.com/photo.jpg');
    assert.equal(response.data.content.thumbnailPublicId, undefined);
    assert.equal(response.data.content.autoNotify, undefined);
  } finally { service.get = original; }
});
test('founder and social fields remain optional for existing settings', () => {
  const result = validate(base);
  assert.deepEqual(result.errors, {});
  assert.equal(result.value.founderName, '');
});
test('founder and social contact details are accepted and trimmed', () => {
  const result = validate({ ...base, founderName: ' Founder ', founderEmail: 'founder@example.com', founderPhone: '9876543210', instagramUrl: 'https://instagram.com/academy', whatsappUrl: 'https://wa.me/919876543210', telegramUrl: 'https://t.me/academy', youtubeUrl: 'https://youtube.com/@academy', thumbnailPublicId: 'untrusted' });
  assert.deepEqual(result.errors, {});
  assert.equal(result.value.founderName, 'Founder');
  assert.equal(result.value.thumbnailPublicId, undefined);
});
test('unsafe social links and invalid founder email are rejected', () => {
  const result = validate({ ...base, instagramUrl: 'javascript:alert(1)', whatsappUrl: 'http://wa.me/test', founderEmail: 'invalid' });
  assert.ok(result.errors.instagramUrl);
  assert.ok(result.errors.whatsappUrl);
  assert.ok(result.errors.founderEmail);
});
