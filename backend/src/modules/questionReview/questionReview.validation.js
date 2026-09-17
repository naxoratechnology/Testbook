const { validateId } = require('../bookmark/bookmark.validation');
function reference(body = {}) {
  if (!['test-series', 'current-affairs', 'previous-paper'].includes(body.source)) throw Object.assign(new Error('Invalid question source.'), { statusCode: 400 });
  return { source: body.source, sourceId: validateId(body.sourceId), testId: body.source === 'test-series' ? validateId(body.testId) : null };
}
function report(body = {}) {
  const ref = reference(body);
  if (!['wrong-answer', 'question-error', 'translation', 'other'].includes(body.reason)) throw Object.assign(new Error('Choose a valid report reason.'), { statusCode: 400 });
  if (body.details !== undefined && typeof body.details !== 'string') throw Object.assign(new Error('Report details must be text.'), { statusCode: 400 });
  const details = (body.details || '').trim();
  if (details.length > 2000 || (body.reason === 'other' && !details)) throw Object.assign(new Error('Provide report details up to 2000 characters.'), { statusCode: 400 });
  return { ...ref, questionId: validateId(body.questionId), reason: body.reason, details };
}
module.exports = { reference, report };
