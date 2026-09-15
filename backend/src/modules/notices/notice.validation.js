function validate(body = {}) {
  const value = {
    title: String(body.title || '').trim(), description: String(body.description || '').trim(),
    type: ['vacancy', 'job', 'general'].includes(body.type) ? body.type : 'general',
    organization: String(body.organization || '').trim(), location: String(body.location || '').trim(),
    eligibility: String(body.eligibility || '').trim(), lastDate: body.lastDate || null,
    applyUrl: String(body.applyUrl || '').trim(),
    status: ['draft', 'published', 'unpublished'].includes(body.status) ? body.status : 'draft',
  };
  const errors = {};
  if (!value.title) errors.title = 'Notice title is required.';
  if (!value.description) errors.description = 'Notice description is required.';
  if (value.applyUrl && !/^https?:\/\//i.test(value.applyUrl)) errors.applyUrl = 'Apply URL must start with http:// or https://.';
  if (value.lastDate && Number.isNaN(new Date(value.lastDate).getTime())) errors.lastDate = 'Enter a valid last date.';
  return { value, errors };
}
module.exports = { validate };
