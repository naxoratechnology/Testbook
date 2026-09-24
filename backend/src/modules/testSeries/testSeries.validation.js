function series(body = {}) {
  const value = { title: String(body.title || '').trim(), description: String(body.description || '').trim(), exam: String(body.exam || '').trim(), kind: String(body.kind || '').trim(), access: body.access === 'paid' ? 'paid' : 'free', price: Number(body.price || 0), difficulty: String(body.difficulty || '').trim(), languages: String(body.languages || 'English'), subjects: Array.isArray(body.subjects) ? body.subjects.map(item => String(item).trim()) : [], status: body.status || 'draft' };
  const errors = {};
  ['title', 'description', 'exam', 'kind', 'difficulty'].forEach((key) => { if (!value[key]) errors[key] = key + ' is required.'; else if (value[key].length > 120 && key !== 'description') errors[key] = key + ' must be 120 characters or fewer.'; });
  if (value.access === 'paid' && value.price <= 0) errors.price = 'Paid series require a price.';
  if (value.subjects.some(item => !item || item.length > 120) || new Set(value.subjects.map(item => item.toLowerCase())).size !== value.subjects.length) errors.subjects = 'Enter unique subject names of 1–120 characters.';
  return { value, errors };
}
function test(body = {}) {
  const value = { title: String(body.title || '').trim(), subject: String(body.subject || '').trim(), duration: Number(body.duration || 0), questions: Array.isArray(body.questions) ? body.questions : [], status: body.status || 'draft', isPreview: body.isPreview === true };
  const errors = {};
  if (!value.title) errors.title = 'Test title is required.';
  if (value.subject.length > 120) errors.subject = 'Subject must be 120 characters or fewer.';
  if (!Number.isInteger(value.duration) || value.duration < 1) errors.duration = 'Duration must be a positive whole number.';
  if (!['draft', 'published', 'unpublished'].includes(value.status)) errors.status = 'Invalid test status.';
  if (!value.questions.length) errors.questions = 'Add at least one question.';
  value.questions.forEach((question, index) => {
    if (!question || typeof question.text !== 'string' || !question.text.trim() || !Array.isArray(question.options) || question.options.length < 2 || question.options.some((option) => typeof option !== 'string' || !option.trim()) || !Number.isInteger(question.correctAnswer) || question.correctAnswer < 0 || question.correctAnswer >= question.options.length || !Number.isFinite(Number(question.marks ?? 1)) || Number(question.marks ?? 1) < 0 || !Number.isFinite(Number(question.negativeMarks ?? 0)) || Number(question.negativeMarks ?? 0) < 0) errors[`questions.${index}`] = 'Provide the question, options, valid correct answer and non-negative marks.';
  });
  return { value, errors };
}
module.exports = { series, test };
