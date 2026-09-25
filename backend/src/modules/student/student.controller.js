const service = require('./student.service');
const { statusSchema, accessSchema } = require('./student.validation');

const parseActive = (value) => {
  if (value === undefined) return undefined;
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return null;
};

const list = async (req, res, next) => {
  try {
    const active = parseActive(req.query.active);
    if (active === null) return res.status(400).json({ success: false, message: 'active must be true or false' });
    const data = await service.listStudents({ active, exam: req.query.exam, search: req.query.search });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const getOne = async (req, res, next) => {
  try {
    const data = await service.getStudent(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

const status = async (req, res, next) => {
  try {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: 'isActive must be a boolean' });
    const data = await service.updateStatus(req.params.id, parsed.data.isActive);
    if (!data) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student status updated', data });
  } catch (error) { next(error); }
};
const grantAccess = async (req, res, next) => {
  try {
    const parsed = accessSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: 'Select a valid paid course or test series.' });
    const data = await service.grantAccess(req.params.id, parsed.data, req.auth.sub);
    res.json({ success: true, message: 'Access granted successfully.', data });
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    const data = await service.deleteStudent(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student deleted' });
  } catch (error) { next(error); }
};

module.exports = { list, getOne, status, grantAccess, remove };
