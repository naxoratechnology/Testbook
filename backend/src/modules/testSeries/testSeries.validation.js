function series(body = {}) {
  const value = { title: String(body.title || '').trim(), description: String(body.description || '').trim(), exam: String(body.exam || '').trim(), kind: body.kind || 'full', access: body.access === 'paid' ? 'paid' : 'free', price: Number(body.price || 0), difficulty: body.difficulty || 'Moderate', languages: String(body.languages || 'English'), status: body.status || 'draft' };
  const errors = {};
  ['title', 'description', 'exam'].forEach((key) => { if (!value[key]) errors[key] = key + ' is required.'; });
  if (value.access === 'paid' && value.price <= 0) errors.price = 'Paid series require a price.';
  return { value, errors };
}
function test(body = {}) {
  const value = { title: String(body.title || '').trim(), duration: Number(body.duration || 0), questions: Array.isArray(body.questions) ? body.questions : [], status: body.status || 'draft' };
  const errors = {};
  if (!value.title) errors.title = 'Test title is required.';
  if (value.duration < 1) errors.duration = 'Duration must be greater than zero.';
  if (!value.questions.length) errors.questions = 'Add at least one question.';
  return { value, errors };
}
module.exports = { series, test };
