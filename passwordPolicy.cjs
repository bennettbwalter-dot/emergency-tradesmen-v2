const fs = require('fs');
const path = require('path');

const DENYLIST_PATH = path.join(__dirname, 'password-denylist.txt');

// Load denylist into a Set for fast checks. Falls back to empty set if file missing.
let denylist = new Set();
try {
  const data = fs.readFileSync(DENYLIST_PATH, 'utf8');
  denylist = new Set(data.split(/\r?\n/).filter(Boolean).map(s => s.trim()));
  console.log(`Loaded password denylist (${denylist.size} entries)`);
} catch (err) {
  console.warn('Password denylist not found, continuing without it:', err.message);
}

function countCharClasses(pw) {
  let classes = 0;
  if (/[a-z]/.test(pw)) classes++;
  if (/[A-Z]/.test(pw)) classes++;
  if (/[0-9]/.test(pw)) classes++;
  if (/[^A-Za-z0-9]/.test(pw)) classes++;
  return classes;
}

// Middleware factory: allows customizing rules via options
function createPasswordPolicy(options = {}) {
  const minLength = options.minLength ?? 10;
  const minClasses = options.minClasses ?? 2;
  const rejectDenylist = options.rejectDenylist ?? true;

  return function passwordPolicy(req, res, next) {
    const password = String(req.body?.password ?? '');

    if (!password) return res.status(400).json({ error: 'Password is required.' });

    if (password.length < minLength) {
      return res.status(400).json({ error: `Password must be at least ${minLength} characters long.` });
    }

    const classes = countCharClasses(password);
    if (classes < minClasses) {
      return res.status(400).json({
        error: `Password must include at least ${minClasses} of: uppercase letters, lowercase letters, numbers, symbols.`,
      });
    }

    if (rejectDenylist && denylist.has(password)) {
      return res.status(400).json({
        error: 'This password is too common or has appeared in data breaches. Choose a different password.',
      });
    }

    // Optional: reject if password contains parts of the user's email
    const email = String(req.body?.email ?? '');
    if (email) {
      try {
        const local = email.split('@')[0];
        if (local && local.length >= 3 && password.toLowerCase().includes(local.toLowerCase())) {
          return res.status(400).json({ error: 'Password must not contain parts of your email address.' });
        }
      } catch (e) {}
    }

    return next();
  };
}

module.exports = createPasswordPolicy;
