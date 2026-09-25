const statusSchema = {
  safeParse(payload) {
    if (!payload || typeof payload.isActive !== 'boolean') return { success: false };
    return { success: true, data: { isActive: payload.isActive } };
  },
};
const accessSchema = {
  safeParse(payload) {
    const type = String(payload?.type || ''); const contentId = String(payload?.contentId || '');
    if (!['course', 'test-series'].includes(type) || !/^[a-f\d]{24}$/i.test(contentId)) return { success: false };
    return { success: true, data: { type, contentId } };
  },
};

module.exports = { statusSchema, accessSchema };
