# 🔐 Document Protection System
**Professional Secure Document Sharing & Access Logging**

---

## 📋 Features

✅ **Password Protected Access**
- Şifrə ilə giriş qorumas
- Session-based authentication
- 24 saat session timeout

✅ **PDF Viewer**
- HTML5 + PDF.js
- Dinamik watermark (müəlliflik)
- Zoom in/out
- Page navigation

✅ **Comprehensive Logging**
- Hər giriş qeyd olunur
- IP address tracking
- Device fingerprinting
- Screenshot/Print attempt detection
- Page view tracking
- Timestamp + session info

✅ **Security Measures**
- ❌ Copy/Paste əngəllidir
- ❌ Right-click əngəllidir
- ❌ Print əngəllidir
- ❌ DevTools əngəllidir
- ❌ Screenshot detection
- ❌ Save as əngəllidir
- 🔐 Session-based access
- 🔒 Password hashing

✅ **Watermark**
- © Ramiz Ələkbərov Professor
- Dinamik tarix əlavə
- Hər səhifədə görsəniz
- Rasterize edilə bilməz (vector-based)

---

## 🚀 Local Testing

### 1. Install Dependencies
```bash
cd document-protect
npm install
```

### 2. Copy PDF to project
```bash
cp /home/claude/Azerimed_v4_RAlekperov.pdf ./
```

### 3. Update server.js
Change this line:
```javascript
const PDF_PATH = '/home/claude/Azerimed_v4_RAlekperov.pdf';
```
To:
```javascript
const PDF_PATH = path.join(__dirname, 'Azerimed_v4_RAlekperov.pdf');
```

### 4. Start Server
```bash
npm start
```

### 5. Access Application
```
http://localhost:3000
```

Login with password:
```
@P@M1e10@222@
```

### 6. View Logs
```bash
cat access-logs.json | python -m json.tool
```

Admin logs:
```
http://localhost:3000/api/admin/logs/admin_9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c
```

---

## ☁️ Deployment Options

### Option 1: Render.com (Recommended - FREE)

1. **Push to GitHub**
```bash
cd document-protect
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/document-protect.git
git push -u origin main
```

2. **Connect to Render**
- Go to https://render.com
- Click "New +"
- Select "Web Service"
- Connect GitHub repo
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- Set Environment Variables:
  - `ADMIN_KEY=admin_9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c`
  - `PORT=3000`

3. **Deploy**
- Click Deploy
- Your app will be at: `https://your-app-name.onrender.com`

---

### Option 2: Vercel (FREE)

1. **Create vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "ADMIN_KEY": "@admin_key"
  }
}
```

2. **Deploy**
```bash
npm install -g vercel
vercel
```

---

### Option 3: Heroku (FREE Tier Removed)
- Not recommended (free tier discontinued)

---

## 📊 Log Files Structure

**access-logs.json:**
```json
[
  {
    "timestamp": "2026-05-16T06:45:30.123Z",
    "sessionId": "abc123...",
    "action": "login_success|pdf_accessed|page_viewed|screenshot_attempt|etc",
    "details": {
      "ip": "192.168.1.100",
      "platform": "Windows|Mac|Linux",
      "userAgent": "Mozilla/5.0...",
      "page": 1,
      "duration": "5000ms",
      "tool": "print_attempt|copy_attempt|etc"
    }
  }
]
```

---

## 🔐 Admin Panel

Access logs (şifrə ilə qorunmuş):
```
GET /api/admin/logs/{ADMIN_KEY}
```

Response: JSON array of all access logs

---

## 📱 Mobile Support

✅ Fully responsive
✅ Touch-friendly buttons
✅ Mobile watermark detection
✅ Device fingerprinting works on mobile

---

## 🛡️ Security Notes

1. **Password** is hashed with SHA-256
2. **Sessions** expire after 24 hours
3. **Logs** include IP + Device info
4. **PDF** is NOT accessible without valid session
5. **PDF.js** renders in memory (no caching)
6. **Watermark** is part of canvas (cannot be removed by editing PDF)

---

## 📝 Customization

### Change Password
Edit server.js:
```javascript
const PASSWORD_HASH = crypto.createHash('sha256').update('YOUR_NEW_PASSWORD').digest('hex');
```

### Change Admin Key
Edit .env:
```
ADMIN_KEY=your_custom_key_here
```

### Change Watermark
Edit public/index.html:
```javascript
watermark.innerHTML = `© Your Name<br>Your Text<br>${new Date().toLocaleDateString('az-AZ')}`;
```

### Change Title/Logo
Edit public/index.html:
```html
<p class="subtitle">Your Document Title</p>
```

---

## 🐛 Troubleshooting

**Q: PDF not loading?**
A: Check PDF_PATH in server.js, ensure file exists

**Q: Session expires too fast?**
A: Edit session timeout in server.js (24 hours default)

**Q: Logs not updating?**
A: Check file permissions on access-logs.json

**Q: CORS errors?**
A: Enable CORS in server.js (already enabled)

---

## 📞 Support

For issues or customizations:
1. Check logs: `access-logs.json`
2. Check console errors (F12)
3. Verify password is correct
4. Check network tab for API responses

---

## 📄 Files Structure

```
document-protect/
├── server.js              # Express backend
├── public/
│   └── index.html         # HTML5 viewer
├── access-logs.json       # Auto-generated access logs
├── sessions.json          # Auto-generated sessions
├── .env                   # Environment variables
├── package.json           # Dependencies
├── netlify.toml           # Netlify config (optional)
├── vercel.json            # Vercel config (optional)
└── Azerimed_v4_RAlekperov.pdf  # Your PDF (optional in repo)
```

---

## 🎯 Next Steps

1. **Local test** the system
2. **Verify logs** are working
3. **Deploy to Render.com** or Vercel
4. **Share link** with authorized users
5. **Share password** securely (NOT in URL/email)
6. **Monitor logs** regularly

---

## ⚖️ Legal Notice

This system is designed to protect intellectual property.
All access is logged for legal purposes.
Unauthorized copying or distribution is prohibited.

**© Ramiz Ələkbərov Professor - Bütün Hüquqlar Qorunur**
