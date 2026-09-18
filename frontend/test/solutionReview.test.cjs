const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { buildSync } = require('esbuild');
const filename = path.resolve(__dirname, 'solutionReview.cjs');
const compiled = buildSync({ entryPoints: [path.resolve(__dirname, '../src/components/tests/SolutionReview.tsx')], bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic', external: ['react', 'react/jsx-runtime', 'lucide-react'] }).outputFiles[0].text;
const fixture = new Module(filename, module); fixture.filename = filename; fixture.paths = Module._nodeModulePaths(__dirname); fixture._compile(compiled, filename);
const { answerStatus, SolutionReview } = fixture.exports;
const result = { _id: 'attempt', title: 'Test', answers: { first: 0, second: 0, third: null }, questions: [
  { _id: 'first', text: 'Correct question', options: ['A', 'B'], correctAnswer: 0, explanation: 'Explanation' },
  { _id: 'second', text: 'Incorrect question', options: ['A', 'B'], correctAnswer: 1, explanation: 'Explanation' },
  { _id: 'third', text: 'Skipped question', options: ['A', 'B'], correctAnswer: 1, explanation: '' },
] };
const render = (index) => renderToStaticMarkup(React.createElement(SolutionReview, { result, index, onJump() {}, name: 'Candidate', actions: null, navigation: null }));

test('solution navigation is fixed at the bottom with content clearance and matching test typography', () => {
  const html = render(0);
  assert.match(html, /<footer aria-label="Solution navigation" class="fixed inset-x-0 bottom-0/);
  assert.match(html, /pb-28/);
  assert.match(html, /<h2 class="mt-5 whitespace-pre-wrap text-lg font-semibold leading-7 text-ink"/);
  assert.match(html, />Previous<\/button>/);
  assert.match(html, />Next<\/button>/);
});
test('first option is correctly classified as an answered question, not skipped', () => {
  assert.equal(answerStatus(result.questions[0], result.answers), 'correct');
  assert.equal(answerStatus(result.questions[1], result.answers), 'incorrect');
  assert.equal(answerStatus(result.questions[2], result.answers), 'skipped');
  assert.equal(answerStatus({ ...result.questions[2], _id: 'missing' }, result.answers), 'skipped');
});
test('question palette shows every question with its status and current selection', () => {
  const html = render(1);
  for (const label of ['Question 1: Correct', 'Question 2: Incorrect', 'Question 3: Skipped']) assert.ok(html.includes(label));
  assert.match(html, /aria-current="step"/);
  assert.match(html, /Filter questions by answer status/);
});
test('correct selections are explicitly marked as both your answer and correct answer', () => {
  const html = render(0); assert.match(html, /Your answer · Correct answer/);
  assert.match(html, /Answer analysis/); assert.match(html, /Explanation/);
});
test('wrong selections and correct answers have separate labels and colours', () => {
  const html = render(1); assert.match(html, /Your answer · Incorrect/);
  assert.match(html, /Correct answer/); assert.match(html, /border-red-300/); assert.match(html, /border-emerald-300/);
});
test('skipped questions show not attempted and still reveal the correct solution', () => {
  const html = render(2); assert.match(html, /Not attempted/);
  assert.match(html, /The correct answer is option B/); assert.doesNotMatch(html, /Your answer · Incorrect/);
});
