function validate(body = {}) {
  const access = ['free', 'paid'].includes(body.access) ? body.access : 'free'; const price = access === 'paid' ? Number(body.price) : 0;
  const value = { name: String(body.name || '').trim(), description: String(body.description || '').trim(), exam: String(body.exam || '').trim(), subject: String(body.subject || '').trim(), status: ['draft', 'published', 'unpublished'].includes(body.status) ? body.status : 'draft', access, price };
  const errors = {}; ['name', 'exam', 'subject'].forEach((key) => { if (!value[key]) errors[key] = key + ' is required.'; });
  if (value.subject.length > 120) errors.subject = 'Subject folder must be 120 characters or fewer.';
  if (access === 'paid' && (!Number.isFinite(price) || price < 1 || price > 1000000)) errors.price = 'Enter a valid price.';
  return { value, errors };
}
module.exports = { validate };
