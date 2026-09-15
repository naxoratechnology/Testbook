function parseQuestions(input) {
  if (Array.isArray(input)) return input;
  if (!input) return [];
  try { const parsed = JSON.parse(input); return Array.isArray(parsed) ? parsed : []; } catch (_error) { return null; }
}
function validate(body = {}) {
  const questions = parseQuestions(body.questions);
  const value = { date: body.date, title: String(body.title || '').trim(), exam: String(body.exam || 'All Exams').trim(), highlights: Array.isArray(body.highlights) ? body.highlights.map((item) => String(item).trim()).filter(Boolean) : String(body.highlights || '').split('\\n').map((item) => item.trim()).filter(Boolean), questions: questions || [], status: ['draft', 'published', 'unpublished'].includes(body.status) ? body.status : 'draft' };
  const errors = {};
  if (!value.date) errors.date = 'Date is required.';
  if (!value.title) errors.title = 'Title is required.';
  if (questions === null) errors.questions = 'Questions must be valid JSON.';
  value.questions.forEach((question, index) => {
    if (!String(question.text || '').trim() || !Array.isArray(question.options) || question.options.length < 2 || !Number.isInteger(Number(question.correctAnswer)) || Number(question.correctAnswer) < 0 || Number(question.correctAnswer) >= question.options.length) errors[`questions.${index}`] = 'Each question requires text, options and a valid correct answer.';
  });
  return { value, errors };
}
module.exports = { validate };
