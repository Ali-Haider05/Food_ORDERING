const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// A fixed bcrypt hash keeps the comparison work similar for unknown emails.
const fallbackHash = '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW';

function validEmail(email) {
  return typeof email === 'string' && emailPattern.test(User.normalizeEmail(email));
}

function validPassword(password) {
  return typeof password === 'string' && Buffer.byteLength(password, 'utf8') <= 72;
}

function sendSession(response, status, message, user) {
  const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d',
  });
  return response.status(status).json({ success: true, message, token, user: User.publicUser(user) });
}

function duplicateEmail(response) {
  return response.status(409).json({ success: false, message: 'Email already registered' });
}

async function signup(request, response) {
  const { name, email, password } = request.body || {};
  if (typeof name !== 'string' || !name.trim() || !validEmail(email)) {
    return response.status(400).json({ success: false, message: 'A name and valid email are required' });
  }
  if (!validPassword(password) || [...password].length < 8) {
    return response.status(400).json({
      success: false,
      message: 'Password must contain at least 8 characters and at most 72 UTF-8 bytes',
    });
  }

  if (await User.findByEmail(email)) {
    return duplicateEmail(response);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  let user;
  try {
    user = await User.createUser({ name, email, password: passwordHash });
  } catch (error) {
    // The unique index also catches signups that race past the lookup.
    if (error.errorType === 'uniqueViolated' && error.key === User.normalizeEmail(email)) {
      return duplicateEmail(response);
    }
    throw error;
  }

  return sendSession(response, 201, 'User registered successfully', user);
}

async function login(request, response) {
  const { email, password } = request.body || {};
  if (!validEmail(email) || !validPassword(password) || !password) {
    return response.status(400).json({ success: false, message: 'A valid email and password are required' });
  }

  const user = await User.findByEmail(email);
  const matches = await bcrypt.compare(password, user ? user.password : fallbackHash);
  if (!user || !matches) {
    return response.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  return sendSession(response, 200, 'Login successful', user);
}

function me(request, response) {
  return response.status(200).json({ success: true, user: request.user });
}

module.exports = { signup, login, me };
