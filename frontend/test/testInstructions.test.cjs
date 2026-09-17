const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { buildSync } = require('esbuild');
const filename = path.resolve(__dirname, 'instructions.cjs');
const compiled = buildSync({ entryPoints: [path.resolve(__dirname, '../src/components/tests/TestInstructions.tsx')], bundle: true, write: false, platform: 'node', format: 'cjs', jsx: 'automatic', external: ['react', 'react/jsx-runtime', 'lucide-react'] }).outputFiles[0].text;
const fixture = new Module(filename, module);
fixture.filename = filename;
fixture.paths = Module._nodeModulePaths(__dirname);
fixture._compile(compiled, filename);
const { TestInstructions, CandidatePhoto } = fixture.exports;
const questions = Array.from({ length: 25 }, (_, index) => ({ _id: String(index), text: 'Question', options: ['A', 'B'], marks: 1, negativeMarks: 0.25 }));
const render = (props = {}) => renderToStaticMarkup(React.createElement(TestInstructions, { title: 'SSC CGL Tier I Quant Sectional Live Test', questions, duration: 15, name: 'Candidate', onStart() {}, onExit() {}, ...props }));

test('instructions use actual test counts, duration and scoring', () => {
  const html = render();
  assert.match(html, /Total Number of Questions: 25/);
  assert.match(html, /Total Time Available: 15 Mins/);
  assert.match(html, />0\.25<\/td>/);
  assert.match(html, /SSC CGL Tier I Quant Sectional Live Test/);
});
test('begin button is disabled before declaration acceptance', () => {
  const html = render();
  assert.match(html, /type="checkbox"/);
  assert.match(html, /<button[^>]*disabled=""[^>]*>I am ready to begin<\/button>/);
  assert.match(html, /will not indulge in any unfair practice/);
});
test('instruction content contains navigation, review and answer-saving rules', () => {
  const html = render();
  for (const text of ['General Instructions:', 'Navigating to a Question', 'Answering a Question', 'Question Paper', 'Mark for Review', 'Unmark', 'does NOT save your answer']) assert.ok(html.includes(text), text);
});
test('untimed tests and variable marks are not assigned fictional timing or scoring', () => {
  const html = render({ duration: 0, questions: [...questions, { _id: 'other', text: 'Question', options: ['A', 'B'], marks: 2, negativeMarks: 0 }] });
  assert.match(html, /No time limit/);
  assert.match(html, /Varies by question/);
});
test('photo upload is optional and an icon is used without a photo', () => {
  const html = render();
  assert.match(html, /Upload photo \(optional\)/);
  assert.match(html, /Default user photo/);
  assert.doesNotMatch(html, /<img/);
  const photo = renderToStaticMarkup(React.createElement(CandidatePhoto, { name: 'Candidate', src: 'blob:local-photo' }));
  assert.match(photo, /<img[^>]*src="blob:local-photo"/);
});
