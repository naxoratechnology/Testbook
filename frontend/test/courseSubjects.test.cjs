const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const { buildSync } = require('esbuild');
const filename = path.resolve(__dirname, 'courseSubjects.cjs');
const compiled = buildSync({ entryPoints: [path.resolve(__dirname, '../src/services/courses/courseSubjects.ts')], bundle: true, write: false, platform: 'node', format: 'cjs' }).outputFiles[0].text;
const fixture = new Module(filename, module); fixture.filename = filename; fixture.paths = Module._nodeModulePaths(__dirname); fixture._compile(compiled, filename);
const { getCourseLectureGroups } = fixture.exports;
test('courses without subjects keep the original lecture list and order', () => {
  const lectures = [{ _id: '1' }, { _id: '2' }];
  assert.deepEqual(getCourseLectureGroups(undefined, lectures), [{ name: '', lectures }]);
});
test('subjects group lectures in subject order and keep general or unmatched lectures accessible', () => {
  const lectures = [{ _id: '1', subject: 'English' }, { _id: '2' }, { _id: '3', subject: 'Mathematics' }, { _id: '4', subject: 'Legacy' }];
  const groups = getCourseLectureGroups(['Mathematics', 'English'], lectures);
  assert.deepEqual(groups.map((group) => [group.name, group.lectures.map((lecture) => lecture._id)]), [['Mathematics', ['3']], ['English', ['1']], ['General lectures', ['2', '4']]]);
  assert.equal(groups.flatMap((group) => group.lectures).length, lectures.length);
});
