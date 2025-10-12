# Quick Fix Guide - User Avatar & API Rate Limits

## ✅ What Was Fixed

### 1. User Avatar Display Issue
**Problem**: Avatar showing "User Avatar" text instead of actual image

**Solution Applied**:
- Added `unoptimized` prop to all Image components for external URLs
- Fixed image sizing with `size-full` class
- Improved alt text for accessibility
- Updated components: `greeting.tsx`, `message.tsx`, `sidebar-user-nav.tsx`

### 2. Groq API Rate Limit Issue
**Problem**: Getting 429 errors when hitting 100k tokens/day limit

**Solution Applied**:
- Implemented automatic API key rotation system
- Support for up to 5 API keys
- Smart failover when keys are rate-limited
- Round-robin selection algorithm

---

## 🚀 How to Set Up API Key Rotation

### Step 1: Get 5 Groq API Keys

1. Go to https://console.groq.com/keys
2. Click **Create API Key** 5 times
3. Copy each key (format: `gsk_...`)

### Step 2: Add to Vercel Environment Variables

1. Go to: https://vercel.com/[your-username]/[your-project]/settings/environment-variables

2. Add these variables:

| Variable Name | Value | Environments |
|--------------|-------|--------------|
| `GROQ_API_KEY` | Your 1st key | ✅ All |
| `GROQ_API_KEY_2` | Your 2nd key | ✅ All |
| `GROQ_API_KEY_3` | Your 3rd key | ✅ All |
| `GROQ_API_KEY_4` | Your 4th key | ✅ All |
| `GROQ_API_KEY_5` | Your 5th key | ✅ All |

3. **Important**: Check all three boxes for each variable:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### Step 3: Redeploy

After adding all keys, Vercel will automatically redeploy. Or you can manually trigger:

```bash
# From your local project
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

---

## 📊 Expected Results

### Before (1 Key):
- ❌ 100,000 tokens per day limit
- ❌ Frequent rate limit errors
- ❌ 15-minute cooldown when limit hit

### After (5 Keys):
- ✅ 500,000 tokens per day capacity
- ✅ Automatic failover between keys
- ✅ No manual intervention needed
- ✅ Better reliability

---

## 🔍 Verify It's Working

### Check Vercel Logs:

1. Go to your Vercel deployment
2. Click **Functions** tab
3. Look for these log messages:

```
✅ [Groq] Initialized with 5 API key(s)
```

When a key hits limit:
```
⚠️ [Groq] Marked key #2 as rate-limited
```

### Test Locally:

1. Create `.env.local` file:
```env
GROQ_API_KEY=gsk_your_first_key
GROQ_API_KEY_2=gsk_your_second_key
GROQ_API_KEY_3=gsk_your_third_key
GROQ_API_KEY_4=gsk_your_fourth_key
GROQ_API_KEY_5=gsk_your_fifth_key
```

2. Run development server:
```bash
pnpm dev
```

3. Check console for initialization message

---

## 🎯 Quick Troubleshooting

### Avatar Still Not Showing?
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check if user is logged in with Google OAuth
4. Verify image URL in browser DevTools

### Still Getting Rate Limits?
1. Verify all 5 keys are added in Vercel
2. Check each key is valid on https://console.groq.com
3. Make sure all keys are from the same account
4. Wait 15 minutes for rate limit reset
5. Try using Lynxa Lite model (separate quota)

### Keys Not Rotating?
1. Check Vercel logs for initialization message
2. Verify environment variables are set for Production
3. Redeploy after adding keys
4. Check for typos in variable names (must be exact)

---

## 💡 Pro Tips

1. **Stagger Key Creation**: Create keys at different times so rate limits don't reset simultaneously

2. **Monitor Usage**: Check https://console.groq.com/usage regularly

3. **Use Different Models**: 
   - Lynxa Lite (llama-3.1-8b-instant) - Separate quota
   - Lynxa Pro (llama-3.3-70b-versatile) - Separate quota
   - Lynxa Reasoning (deepseek-r1) - Separate quota

4. **Upgrade to Dev Tier**: For production apps, consider upgrading at https://console.groq.com/settings/billing

---

## 📞 Need More Help?

- **Full Documentation**: See `GROQ_API_KEY_ROTATION.md`
- **Groq Dashboard**: https://console.groq.com
- **Vercel Dashboard**: https://vercel.com/dashboard

---

**Commit**: `1e1c8d5` - "feat: add user avatar fixes and Groq API key rotation"
**Date**: October 12, 2025
