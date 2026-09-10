function validate(body = {}) { const value = { name: String(body.name || '').trim(), status: ['draft', 'published', 'unpublished'].includes(body.status) ? body.status : 'draft' }; const errors = {}; if (!value.name) errors.name = 'Syllabus name is required.'; return { value, errors }; }
module.exports = { validate };
