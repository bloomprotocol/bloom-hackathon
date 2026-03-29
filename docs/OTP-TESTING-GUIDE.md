# Email OTP Testing Guide

## ✅ What's Been Implemented

### Frontend (bloom-protocol-fe)
- ✅ API routes: `/api/auth/email/send-otp` & `/api/auth/email/verify-otp`
- ✅ AuthModal updated with email OTP flow
- ✅ OTPInput component (6-digit code input)
- ✅ Landing page: "Start Journey" CTA + "Login" button

### Backend (bloom-protocol-be)
- ✅ Database: `otp_code` table created
- ✅ Endpoints: `POST /auth/email/send-otp` & `POST /auth/email/verify-otp`
- ✅ Email service: OTP email template
- ✅ Security: Rate limiting, code hashing, expiration
- ✅ Auto-creates users (passwordless registration)

---

## 🧪 Testing Steps

### 1. Start Backend Server

```bash
cd ~/bloom-protocol-be
npm run start:dev
```

Wait for: `✓ Server started on http://localhost:8080`

### 2. Frontend is Already Running

Your frontend dev server is already running on `localhost:3000`

### 3. Test the Flow

#### A) Open Browser
Navigate to: `http://localhost:3000`

#### B) Click "Login" (Top Right)
- Should open AuthModal
- Should show "Welcome to Bloom Protocol"

#### C) Click "Continue with Email"
- Should show email input screen
- Enter your email
- Click "Send Verification Code"

#### D) Check Your Email
- Subject: "Your Bloom Protocol Verification Code"
- Should receive 6-digit code in beautiful gradient box
- Example: `123456`

#### E) Enter Code
- Paste or type the 6-digit code
- Should auto-verify after entering 6th digit
- Should show "Verifying..." spinner
- Should close modal
- Should redirect to `/dashboard`

#### F) Success!
- You're now authenticated ✅
- Check browser cookies: `auth-token`, `SUB`, `ROLE`, `TIA`
- Check dashboard loads properly

---

## 🐛 Troubleshooting

### Issue: "Failed to send code"

**Cause:** Email service (Resend) not configured

**Fix:** Check backend `.env` file has:
```bash
RESEND_API_KEY=re_xxxxxxxxxx
RESEND_FROM_EMAIL=noreply@bloomprotocol.ai
```

If missing, get Resend API key from: https://resend.com

---

### Issue: "Too many requests"

**Cause:** Hit rate limit (3 requests/hour)

**Fix:** Wait 1 hour, or clear database:
```sql
DELETE FROM otp_code WHERE email = 'your@email.com';
```

---

### Issue: "Invalid code"

**Causes:**
1. Code expired (>10 minutes)
2. Wrong code entered
3. Too many attempts (>5 failed attempts)

**Fix:** Request new code

---

### Issue: Backend endpoint 404

**Cause:** Backend not running or routes not registered

**Fix:**
```bash
cd ~/bloom-protocol-be
npm run start:dev
```

Check logs for: `[Nest] Mapped {/auth/email/send-otp, POST}`

---

## 📊 Success Metrics to Track

After testing, verify:

### Database
```sql
-- Check OTP codes table
SELECT * FROM otp_code ORDER BY created_at DESC LIMIT 5;

-- Check new users created via OTP
SELECT * FROM user WHERE email IS NOT NULL ORDER BY created_at DESC LIMIT 5;
```

### Logs
Backend should show:
```
[AuthService] OTP sent to user@example.com
[EmailService] OTP email sent to user@example.com
[AuthService] User authenticated via OTP: user@example.com
```

### Frontend Console
Should show:
```
✅ OTP sent successfully
✅ Authentication successful
Redirecting to dashboard...
```

---

## 🎯 Expected Behavior

### First-Time User
1. Enters email → Receives code
2. Enters code → ✅ **New account created**
3. Redirected to dashboard
4. Role: `user`, Email stored in database

### Returning User
1. Enters email → Receives code
2. Enters code → ✅ **Logged in**
3. Redirected to dashboard
4. Last login timestamp updated

---

## 💰 Cost Savings Verification

After implementation:

### Check Privy Dashboard
- Go to: https://dashboard.privy.io
- Check: "Active Users" metric
- **Should decrease** as users choose email OTP instead

### Expected Reduction
- If 70% choose email → **70% less Privy MAU**
- At 5,000 MAU → Save **$1,800-7,200/month**

---

## 🚀 Next Steps

After successful testing:

1. ✅ Test on staging environment
2. ✅ Monitor email delivery rate (should be >95%)
3. ✅ Monitor OTP verification success rate (should be >80%)
4. ✅ Deploy to production
5. ✅ Watch Privy costs drop! 📉

---

## 📝 Quick Commands

```bash
# Backend
cd ~/bloom-protocol-be
npm run start:dev          # Start backend
npx prisma studio          # View database GUI

# Frontend
cd ~/bloom-protocol-fe
# Already running on localhost:3000

# Database
mysql -u root -p app       # Connect to MySQL
SHOW TABLES;               # List tables
SELECT * FROM otp_code;    # View OTP codes
```

---

## ✅ Definition of Done

- [ ] Backend server running without errors
- [ ] Frontend can send OTP request
- [ ] Email received with 6-digit code
- [ ] Code verification works
- [ ] User authenticated successfully
- [ ] JWT token set in cookies
- [ ] Dashboard loads for authenticated user
- [ ] Rate limiting works (3 requests/hour)
- [ ] Code expiration works (10 minutes)
- [ ] Attempt limiting works (5 attempts)

---

**Built with ❤️ to reduce costs and improve UX!**
