# GROQ API Key Setup - Critical Steps

## 🔴 Current Issue: AI Not Responding (500 Error)

The 500 error means the GROQ_API_KEY is not being read by the server.

---

## ✅ EXACT Steps to Fix:

### Step 1: Verify Your Groq API Key

1. Go to https://console.groq.com/keys
2. Sign in to your account
3. **Create a NEW API key** (don't use an old one)
4. Copy the ENTIRE key (starts with `gsk_`)
5. Save it somewhere safe

---

### Step 2: Add to Vercel Environment Variables

**IMPORTANT**: Follow these EXACT steps:

1. Go to: https://vercel.com/ib-studiozs-projects/aj-studioz-07/settings/environment-variables

2. Look for existing `GROQ_API_KEY` variable:
   - If it exists: Click the **3 dots** → **Edit**
   - If it doesn't exist: Click **Add New**

3. Fill in:
   - **Key**: `GROQ_API_KEY` (exactly like this, all caps)
   - **Value**: Paste your Groq API key (starts with `gsk_`)
   - **Environment**: Check ALL three boxes:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

4. Click **Save**

---

### Step 3: Redeploy (CRITICAL!)

**Environment variables only take effect AFTER redeployment!**

**Option A: Redeploy from Vercel Dashboard**
1. Go to: https://vercel.com/ib-studiozs-projects/aj-studioz-07/deployments
2. Click on the **latest deployment**
3. Click the **3 dots** (⋯) in top right
4. Click **Redeploy**
5. Confirm the redeploy

**Option B: Trigger New Deployment**
1. Make any small change to your code
2. Push to GitHub
3. Vercel will auto-deploy

---

### Step 4: Wait for Deployment

1. Watch the deployment progress
2. Wait until it shows **"Ready"** status
3. Should take 2-3 minutes

---

### Step 5: Test

1. **Hard refresh** your browser: `Ctrl + Shift + R`
2. Open your site: https://aj-studioz-chat.vercel.app
3. Send a test message: "Hello"
4. AI should respond within 2-3 seconds

---

## 🔍 How to Verify Environment Variable is Set

### Check in Vercel:

1. Go to: https://vercel.com/ib-studiozs-projects/aj-studioz-07/settings/environment-variables
2. You should see:
   ```
   GROQ_API_KEY
   Value: gsk_••••••••••••••••••••
   Environments: Production, Preview, Development
   ```

### Check Function Logs:

1. Go to: https://vercel.com/ib-studiozs-projects/aj-studioz-07/deployments
2. Click latest deployment
3. Click **Functions** tab
4. Look for `/api/chat` logs
5. Should NOT see "GROQ_API_KEY is not set"

---

## ⚠️ Common Mistakes:

1. ❌ **Not redeploying after adding env var**
   - Solution: Always redeploy!

2. ❌ **Only checking Production environment**
   - Solution: Check all three boxes

3. ❌ **Typo in variable name**
   - Solution: Must be exactly `GROQ_API_KEY`

4. ❌ **Invalid API key**
   - Solution: Create a fresh key from Groq

5. ❌ **Not waiting for deployment to finish**
   - Solution: Wait for "Ready" status

---

## 🧪 Test Your Groq API Key

Before adding to Vercel, test if your key works:

### Using PowerShell:
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_GROQ_API_KEY_HERE"
}
Invoke-RestMethod -Uri "https://api.groq.com/openai/v1/models" -Headers $headers
```

If it returns a list of models, your key is valid.

---

## 📊 Expected Behavior After Fix:

### ✅ Working:
- Chat interface loads
- You can type messages
- AI responds within 2-3 seconds
- No 500 errors in console
- Function logs show successful requests

### ❌ Still Broken:
- 500 error in console
- No AI response
- Function logs show "GROQ_API_KEY is not set"

---

## 🆘 If Still Not Working:

### 1. Check Vercel Function Logs:
```
Deployments → Latest → Functions → /api/chat
```
Look for the exact error message.

### 2. Verify Environment Variable:
```
Settings → Environment Variables → GROQ_API_KEY
```
Make sure it's set for Production.

### 3. Create Fresh API Key:
- Go to Groq console
- Delete old key
- Create new key
- Update in Vercel
- Redeploy

### 4. Check Groq Account:
- Make sure you have API credits
- Check if you hit rate limits
- Verify account is active

---

## 📝 Checklist:

Before asking for help, verify:

- [ ] Created fresh Groq API key
- [ ] Added to Vercel environment variables
- [ ] Checked ALL three environment boxes
- [ ] Clicked Save
- [ ] Redeployed the application
- [ ] Waited for deployment to complete (Ready status)
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Checked function logs for errors
- [ ] Tested API key with curl/PowerShell

---

## 🎯 Quick Fix Summary:

1. **Get API key** from https://console.groq.com/keys
2. **Add to Vercel** at Settings → Environment Variables
3. **Check all 3 boxes** (Production, Preview, Development)
4. **Save**
5. **Redeploy** from Deployments page
6. **Wait** for "Ready" status
7. **Test** your chat

---

**The most common issue is forgetting to REDEPLOY after adding the environment variable!**
