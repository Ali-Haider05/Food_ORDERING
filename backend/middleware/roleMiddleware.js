function isAdmin(request, response, next) {
  if (!request.user || request.user.role !== 'admin') {
    return response.status(403).json({ success: false, message: 'Admin access required' });
  }

  return next();
}

module.exports = { isAdmin };
