const test = require('node:test');
const assert = require('node:assert/strict');
const Series = require('../src/modules/testSeries/testSeries.model');
const seriesValidation = require('../src/modules/testSeries/testSeries.validation');
const Paper = require('../src/modules/previousPaper/previousPaper.model');
const paperService = require('../src/modules/previousPaper/previousPaper.service');

test('test series accepts unique subjects and tests can identify their folder', () => {
  const series = seriesValidation.series({ title: 'Mocks', description: 'Practice', exam: 'SSC', subjects: [' Reasoning ', 'English'] });
  assert.deepEqual(series.errors, {});
  assert.deepEqual(series.value.subjects, ['Reasoning', 'English']);
  assert.equal(seriesValidation.test({ title: 'Set 1', subject: 'Reasoning', duration: 30, questions: [{ text: 'Q', options: ['A', 'B'], correctAnswer: 0 }] }).value.subject, 'Reasoning');
  assert.ok(seriesValidation.series({ title: 'Mocks', description: 'Practice', exam: 'SSC', subjects: ['English', 'english'] }).errors.subjects);
  const model = new Series({ ...series.value, createdBy: '507f1f77bcf86cd799439010', tests: [{ title: 'Set 1', subject: 'Reasoning', duration: 30 }] });
  assert.equal(model.tests[0].subject, 'Reasoning');
});

test('previous paper can be an online test without a PDF', async () => {
  const originalSave = Paper.prototype.save;
  Paper.prototype.save = async function () { await this.validate(); return this; };
  try {
    const paper = await paperService.create({ directory: 'SSC', title: 'Quantitative 2025', exam: 'SSC', year: 2025, stage: 'Tier 1', subject: 'Quantitative', duration: 30, status: 'draft', questions: [{ text: '2 + 2?', options: ['3', '4'], correctAnswer: 1 }] }, null, '507f1f77bcf86cd799439010');
    assert.equal(paper.pdfUrl, '');
    assert.equal(paper.pdfPublicId, '');
    assert.equal(paper.questions.length, 1);
    await assert.rejects(paperService.create({ title: 'Empty', questions: [] }, null, '507f1f77bcf86cd799439010'), { statusCode: 400 });
  } finally { Paper.prototype.save = originalSave; }
});
