const jwt = require('jsonwebtoken');
const User = require('../models/User');

function unauthorized(response) {
  return response.status(401).json({ success: false, message: 'A valid Bearer token is required' });
}

async function authenticate(request, response, next) {
  const bearer = /^Bearer\s+(\S+)$/i.exec(request.get('Authorization') || '');
  if (!bearer) {
    return unauthorized(response);
  }

  let payload;
  try {
    payload = jwt.verify(bearer[1], process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return unauthorized(response);
  }

  if (typeof payload.sub !== 'string' || !payload.sub || typeof payload.exp !== 'number') {
    return unauthorized(response);
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    return unauthorized(response);
  }

  request.user = User.publicUser(user);
  return next();
}

module.exports = authenticate;
