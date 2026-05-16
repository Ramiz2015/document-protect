const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration
const PASSWORD_HASH = crypto.createHash('sha256').update('@P@M1e10@222@').digest('hex');
const PDF_PATH = path.join(__dirname, 'Azerimed_v4_RAlekperov.pdf');
const LOGS_FILE = path.join(__dirname, 'access-logs.json');
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

// Initialize logs
if (!fs.existsSync(LOGS_FILE)) {
  fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(SESSIONS_FILE)) {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify({}, null, 2));
}

// Helper: Get IP
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() || 
         req.socket.remoteAddress || 
         'unknown';
}

// Helper: Get device info
function getDeviceInfo(req) {
  const ua = req.headers['user-agent'] || 'unknown';
  return {
    userAgent: ua,
    platform: ua.includes('Windows') ? 'Windows' : 
              ua.includes('Mac') ? 'Mac' : 
              ua.includes('Linux') ? 'Linux' : 'Unknown'
  };
}

// Helper: Log access
function logAccess(sessionId, action, details = {}) {
  try {
    const logs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'));
    logs.push({
      timestamp: new Date().toISOString(),
      sessionId,
      action,
      details,
      ...details
    });
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('Log error:', err);
  }
}

// Helper: Validate session
function validateSession(sessionId) {
  try {
    const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    const session = sessions[sessionId];
    if (!session) return null;
    
    // 24 saat vaxt limitası
    const sessionAge = Date.now() - new Date(session.createdAt).getTime();
    if (sessionAge > 24 * 60 * 60 * 1000) {
      delete sessions[sessionId];
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
      return null;
    }
    return session;
  } catch (err) {
    return null;
  }
}

// API: Login
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  const ip = getClientIP(req);
  const device = getDeviceInfo(req);
  
  if (!password) {
    logAccess('unauthenticated', 'failed_login', { 
      reason: 'no_password',
      ip,
      ...device
    });
    return res.status(400).json({ error: 'Password required' });
  }

  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  
  if (passwordHash !== PASSWORD_HASH) {
    logAccess('unauthenticated', 'failed_login', { 
      reason: 'wrong_password',
      ip,
      ...device
    });
    return res.status(401).json({ error: 'Wrong password' });
  }

  // Sessiya yaradıl
  const sessionId = crypto.randomUUID();
  const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
  
  sessions[sessionId] = {
    createdAt: new Date().toISOString(),
    ip,
    device: device.platform,
    userAgent: device.userAgent,
    loginTime: new Date().toISOString()
  };
  
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
  
  logAccess(sessionId, 'login_success', { 
    ip,
    ...device
  });

  res.json({ sessionId, message: 'Login successful' });
});

// API: PDF Stream with watermark detection
app.get('/api/pdf', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const ip = getClientIP(req);
  const device = getDeviceInfo(req);

  if (!sessionId || !validateSession(sessionId)) {
    logAccess('invalid', 'unauthorized_pdf_access', { 
      sessionId,
      ip,
      ...device
    });
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!fs.existsSync(PDF_PATH)) {
    return res.status(404).json({ error: 'Document not found' });
  }

  logAccess(sessionId, 'pdf_accessed', { 
    ip,
    ...device,
    timestamp: new Date().toISOString()
  });

  const fileSize = fs.statSync(PDF_PATH).size;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', fileSize);
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  fs.createReadStream(PDF_PATH).pipe(res);
});

// API: Log page view
app.post('/api/log-page-view', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const { page, duration } = req.body;
  const ip = getClientIP(req);

  if (!sessionId || !validateSession(sessionId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  logAccess(sessionId, 'page_viewed', {
    page,
    duration: `${duration}ms`,
    ip,
    timestamp: new Date().toISOString()
  });

  res.json({ ok: true });
});

// API: Log screenshot attempt
app.post('/api/log-screenshot', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const ip = getClientIP(req);

  if (!sessionId || !validateSession(sessionId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  logAccess(sessionId, 'screenshot_attempt', {
    ip,
    timestamp: new Date().toISOString(),
    tool: req.body.tool || 'unknown'
  });

  res.json({ ok: true });
});

// API: Get logs (admin)
app.get('/api/admin/logs/:adminKey', (req, res) => {
  const { adminKey } = req.params;
  
  // Admin keyi qorumalı
  if (adminKey !== process.env.ADMIN_KEY || !process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const logs = JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read logs' });
  }
});

// API: Get session info
app.get('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = validateSession(sessionId);
  
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  res.json(session);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Document Protection Server running on port ${PORT}`);
  console.log(`📄 PDF: ${PDF_PATH}`);
  console.log(`📋 Logs: ${LOGS_FILE}`);
  console.log(`\n🔐 Admin key required for logs access`);
  console.log(`📍 Set ADMIN_KEY in .env file\n`);
});
