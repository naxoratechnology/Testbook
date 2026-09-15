const jwt = require('jsonwebtoken');
const env = require('../../config/env');
function requireAuth(request, _response, next) {
  const header = request.headers.authorization || '';
  const token = request.cookies.accessToken || (header.startsWith('Bearer ') ? header.slice(7) : null);
  if (!token) return next(Object.assign(new Error('Authentication required.'), { statusCode: 401 }));
  try { request.auth = jwt.verify(token, env.jwt.accessSecret); return next(); } catch (_error) { return next(Object.assign(new Error('Invalid or expired access token.'), { statusCode: 401 })); }
}
module.exports = { requireAuth };

function requireRole(...roles) {
  return (request, _response, next) => {
    if (!request.auth || !roles.includes(request.auth.role)) {
      return next(Object.assign(new Error('You do not have permission to perform this action.'), { statusCode: 403 }));
    }
    return next();
  };
}

module.exports.requireRole = requireRole;
function optionalAuth(request, _response, next) { const token = request.cookies.accessToken; if (!token) return next(); try { request.auth = jwt.verify(token, env.jwt.accessSecret); } catch (_error) { request.auth = null; } return next(); }
module.exports.optionalAuth = optionalAuth;
