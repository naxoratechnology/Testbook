function validate(body = {}) {
  const value = { title: String(body.title || '').trim(), subtitle: String(body.subtitle || '').trim(), buttonLabel: String(body.buttonLabel || '').trim(), buttonUrl: String(body.buttonUrl || '').trim(), placement: ['home', 'dashboard', 'both'].includes(body.placement) ? body.placement : 'both', status: body.status === 'published' ? 'published' : 'draft', order: Math.max(0, Number(body.order || 0)) };
  const errors = {};
  if (!value.title) errors.title = 'Banner title is required.';
  if (value.buttonUrl && !value.buttonUrl.startsWith('/') && !/^https?:\/\//i.test(value.buttonUrl)) errors.buttonUrl = 'Use an internal path or an HTTP(S) URL.';
  return { value, errors };
}
module.exports = { validate };
