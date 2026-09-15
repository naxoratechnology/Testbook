const statusSchema = {
  safeParse(payload) {
    if (!payload || typeof payload.isActive !== 'boolean') return { success: false };
    return { success: true, data: { isActive: payload.isActive } };
  },
};

module.exports = { statusSchema };
