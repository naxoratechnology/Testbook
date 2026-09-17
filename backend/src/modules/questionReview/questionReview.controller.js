const service = require('./questionReview.service');
const run = (handler) => (req, res, next) => Promise.resolve(handler(req, res)).catch(next);
module.exports = {
  attempts: run(async (req, res) => res.json({ success: true, data: { attempts: await service.attempts(req.auth.sub, req.query) } })),
  solution: run(async (req, res) => res.json({ success: true, data: { result: await service.solution(req.auth.sub, req.query, req.auth.role) } })),
  report: run(async (req, res) => res.status(201).json({ success: true, message: 'Question reported successfully.', data: { report: await service.report(req.auth.sub, req.body, req.auth.role) } })),
  reports: run(async (_req, res) => res.json({ success: true, data: { reports: await service.reports() } })),
  updateReportStatus: run(async (req, res) => res.json({ success: true, data: { report: await service.updateReportStatus(req.params.id, req.body.status) } })),
};
