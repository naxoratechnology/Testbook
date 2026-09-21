const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const { buildSync } = require('esbuild');
const filename = path.resolve(__dirname, 'testSubjects.cjs');
const compiled = buildSync({ entryPoints: [path.resolve(__dirname, '../src/services/test-series/testSubjects.ts')], bundle: true, write: false, platform: 'node', format: 'cjs' }).outputFiles[0].text;
const fixture = new Module(filename, module); fixture.filename = filename; fixture.paths = Module._nodeModulePaths(__dirname); fixture._compile(compiled, filename);
const { groupTestsBySubject } = fixture.exports;
test('subject folders preserve test order and retain unassigned tests', () => {
  const grouped = groupTestsBySubject(['Reasoning', 'English'], [{ subject: 'English', title: 'E' }, { subject: 'Reasoning', title: 'R' }, { title: 'General' }]);
  assert.deepEqual(grouped.map(group => [group.name, group.tests.map(item => item.title)]), [['Reasoning', ['R']], ['English', ['E']], ['General tests', ['General']]]);
});
test('series without subjects keeps its original flat test list', () => {
  const tests = [{ title: 'First' }, { title: 'Second' }];
  assert.deepEqual(groupTestsBySubject([], tests), [{ name: '', tests }]);
});
