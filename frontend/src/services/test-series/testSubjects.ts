export function groupTestsBySubject<T extends { subject?: string }>(subjects: string[] = [], tests: T[] = []) {
  if (!subjects.length) return [{ name: '', tests }];
  const groups = subjects.map(name => ({ name, tests: tests.filter(test => test.subject === name) }));
  const general = tests.filter(test => !test.subject || !subjects.includes(test.subject));
  if (general.length) groups.push({ name: 'General tests', tests: general });
  return groups;
}
