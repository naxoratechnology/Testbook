const User = require('../auth/auth.model');

const projection = '-password';

const listStudents = async ({ active, exam, search }) => {
  const filter = { role: 'student' };
  if (active !== undefined) filter.isActive = active;
  if (exam) filter.targetExam = exam;
  if (search) {
    const term = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: term }, { email: term }, { mobile: term }];
  }
  return User.find(filter, projection).sort({ createdAt: -1 }).lean();
};

const getStudent = (id) => User.findOne({ _id: id, role: 'student' }, projection).lean();
const updateStatus = (id, isActive) => User.findOneAndUpdate({ _id: id, role: 'student' }, { $set: { isActive } }, { new: true, projection }).lean();
const deleteStudent = (id) => User.findOneAndDelete({ _id: id, role: 'student' }, { projection }).lean();

module.exports = { listStudents, getStudent, updateStatus, deleteStudent };
