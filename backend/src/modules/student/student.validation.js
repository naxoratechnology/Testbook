const { z } = require('zod');

const statusSchema = z.object({ isActive: z.boolean() });

module.exports = { statusSchema };
