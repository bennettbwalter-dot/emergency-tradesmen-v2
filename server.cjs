const express = require('express');
const bodyParser = require('body-parser');
const createPasswordPolicy = require('./passwordPolicy.cjs');

const app = express();
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use(bodyParser.json({ limit: '16kb' }));

// Create middleware with specific options
const passwordPolicy = createPasswordPolicy({ 
  minLength: 10, 
  minClasses: 2, 
  rejectDenylist: true 
});

// Example signup route
app.post('/signup', passwordPolicy, async (_req, res) => {
  return res.json({ 
    status: 'ok', 
    message: 'Signup accepted (password policy passed).'
  });
});

// Example change-password route
app.post('/change-password', passwordPolicy, async (_req, res) => {
  return res.json({ 
    status: 'ok', 
    message: 'Password changed (password policy passed).'
  });
});

// Health check
app.get('/health', (req, res) => res.send('ok'));

const port = process.env.PORT || 3000;
const host = process.env.HOST || '127.0.0.1';
app.listen(port, host, () => console.log(`Server running on http://${host}:${port}`));
