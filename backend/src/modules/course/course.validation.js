function validateCourse(body = {}) {
  const value = {
    title: String(body.title || '').trim(),
    description: String(body.description || '').trim(),
    exam: String(body.exam || '').trim(),
    category: String(body.category || '').trim(),
    instructor: String(body.instructor || '').trim(),
    thumbnail: String(body.thumbnail || '').trim(),
    access: body.access === 'paid' ? 'paid' : 'free',
    price: Number(body.price || 0),
    lectures: Array.isArray(body.lectures) ? body.lectures : [],
    status: ['draft', 'published', 'unpublished'].includes(body.status) ? body.status : 'draft',
  };
  const errors = {};
  if (body.subjects !== undefined) {
    if (!Array.isArray(body.subjects) || body.subjects.some((subject) => typeof subject !== 'string' || !subject.trim() || subject.trim().length > 120)) errors.subjects = 'Subjects must have names of 1 to 120 characters.';
    else {
      value.subjects = body.subjects.map((subject) => subject.trim());
      if (new Set(value.subjects.map((subject) => subject.toLowerCase())).size !== value.subjects.length) errors.subjects = 'Subject names must be unique.';
      if (value.lectures.some((lecture) => lecture.subject && !value.subjects.includes(lecture.subject))) errors.lectures = 'Each lecture subject must belong to this course.';
    }
  }
  ['title', 'description', 'exam', 'category', 'instructor'].forEach((key) => { if (!value[key]) errors[key] = key + ' is required.'; });
  if (value.access === 'paid' && (!Number.isFinite(value.price) || value.price <= 0)) errors.price = 'Paid courses require a price greater than zero.';
  if (value.lectures.filter((lecture) => lecture.isPreview).length > 2) errors.lectures = 'Choose no more than two free demo lectures.';
  return { value, errors };
}
module.exports = { validateCourse };
