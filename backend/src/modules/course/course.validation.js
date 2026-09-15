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
  ['title', 'description', 'exam', 'category', 'instructor'].forEach((key) => { if (!value[key]) errors[key] = key + ' is required.'; });
  if (value.access === 'paid' && (!Number.isFinite(value.price) || value.price <= 0)) errors.price = 'Paid courses require a price greater than zero.';
  return { value, errors };
}
module.exports = { validateCourse };
