const path = require('node:path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');

dotenv.config({ path: path.join(__dirname, '.env'), quiet: true });

const app = express();
const port = Number(process.env.PORT || 5000);
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use('/api', healthRoutes);

function handleError(error, _request, response, next) {
  if (response.headersSent) {
    return next(error);
  }

  const status = error.status >= 400 && error.status < 600 ? error.status : 500;
  if (status >= 500) {
    console.error('HTTP request failed with status', status);
  }

  const message = error.type === 'entity.parse.failed' ? 'Invalid JSON request body' : error.message;
  response.status(status).json({
    success: false,
    message: status >= 500 ? 'Internal server error' : message,
  });
}

async function start() {
  const proxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
  if (!Number.isSafeInteger(proxyHops) || proxyHops < 0) {
    throw new Error('TRUST_PROXY_HOPS must be a nonnegative integer');
  }
  app.set('trust proxy', proxyHops);
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || ['replace_with_a_secure_random_secret', 'replace_with_your_generated_jwt_secret'].includes(secret)) {
    throw new Error('Set JWT_SECRET to a secure value before starting the backend');
  }

  const createDatastore = require('./config/db');
  const User = require('./models/User');
  const datastore = createDatastore('test.db');
  const Category = require('./models/Category');
  const MenuItem = require('./models/MenuItem');
  const Order = require('./models/Order');
  await Promise.all([datastore.autoloadPromise, User.ready, Category.ready, MenuItem.ready, Order.ready]);

  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/categories', require('./routes/categoryRoutes'));
  app.use('/api/menu', require('./routes/menuRoutes'));
  app.use('/api/orders', require('./routes/orderRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));
  app.use('/api', (_request, response) => {
    response.status(404).json({ success: false, message: 'API route not found' });
  });
  app.use(handleError);

  const server = app.listen(port, '0.0.0.0', () => {
    console.log('Food Ordering Backend listening on port %d', server.address().port);
  });

  server.on('error', (error) => {
    console.error('Could not start HTTP server:', error.message);
    process.exitCode = 1;
  });
}

start().catch((error) => {
  console.error('Backend startup failed:', error.message);
  process.exitCode = 1;
});
