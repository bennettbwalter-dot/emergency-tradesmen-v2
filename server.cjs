const express = require('express');
const bodyParser = require('body-parser');
const createPasswordPolicy = require('./passwordPolicy.cjs');

const app = express();
app.use(bodyParser.json());

// Create middleware with specific options
const passwordPolicy = createPasswordPolicy({ 
  minLength: 10, 
  minClasses: 2, 
  rejectDenylist: true 
});

// Example signup route
app.post('/signup', passwordPolicy, async (req, res) => {
  const { email } = req.body;
  return res.json({ 
    status: 'ok', 
    message: 'Signup accepted (password policy passed).', 
    email: email || null 
  });
});

// Example change-password route
app.post('/change-password', passwordPolicy, async (req, res) => {
  const { userId } = req.body;
  return res.json({ 
    status: 'ok', 
    message: 'Password changed (policy passed).', 
    userId: userId || null 
  });
});

// Health check
app.get('/health', (req, res) => res.send('ok'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
