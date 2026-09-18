export function getCourseLectureGroups<T extends { subject?: string }>(subjects: string[] = [], lectures: T[] = []): { name: string; lectures: T[] }[] {
  if (!subjects.length) return [{ name: '', lectures }];
  const groups = subjects.map((name) => ({ name, lectures: lectures.filter((lecture) => lecture.subject === name) }));
  const general = lectures.filter((lecture) => !lecture.subject || !subjects.includes(lecture.subject));
  if (general.length) groups.push({ name: 'General lectures', lectures: general });
  return groups;
}
