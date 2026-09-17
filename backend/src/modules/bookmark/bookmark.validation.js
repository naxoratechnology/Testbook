const mongoose = require('mongoose');

function validateId(id) {
  if (typeof id !== 'string' || !mongoose.isObjectIdOrHexString(id)) throw Object.assign(new Error('Invalid bookmark or question identifier.'), { statusCode: 400 });
  return id;
}
function validateSource(body = {}) {
  if (!['test-series', 'current-affairs', 'previous-paper'].includes(body.source)) throw Object.assign(new Error('Invalid question source.'), { statusCode: 400 });
  return { source: body.source, sourceId: validateId(body.sourceId), questionId: validateId(body.questionId), testId: body.source === 'test-series' ? validateId(body.testId) : null };
}
module.exports = { validateId, validateSource };
