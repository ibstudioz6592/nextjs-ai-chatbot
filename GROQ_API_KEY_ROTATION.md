# Groq API Key Rotation Setup

## 🔄 What is API Key Rotation?

API key rotation automatically switches between multiple Groq API keys to avoid rate limits. When one key hits its limit, the system automatically uses the next available key.

## 📊 Benefits

- **5x More Capacity**: With 5 keys, you get 500,000 tokens per day instead of 100,000
- **Automatic Failover**: No manual intervention needed when a key hits rate limit
- **Better Reliability**: Your app stays online even when individual keys are rate-limited
- **Smart Recovery**: Failed keys are automatically retried after cooldown

## 🚀 Setup Instructions

### Step 1: Get Multiple Groq API Keys

1. Go to https://console.groq.com
2. Sign up or log in
3. Create **5 API keys** (or as many as you need)
4. Copy each key (they start with `gsk_`)

### Step 2: Add Keys to Environment Variables

#### For Local Development (`.env.local`):

```env
# Primary key (required)
GROQ_API_KEY=gsk_your_first_api_key_here

# Additional keys for rotation (optional but recommended)
GROQ_API_KEY_2=gsk_your_second_api_key_here
GROQ_API_KEY_3=gsk_your_third_api_key_here
GROQ_API_KEY_4=gsk_your_fourth_api_key_here
GROQ_API_KEY_5=gsk_your_fifth_api_key_here
```

#### For Vercel Deployment:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add each key:
   - `GROQ_API_KEY` → Your first key
   - `GROQ_API_KEY_2` → Your second key
   - `GROQ_API_KEY_3` → Your third key
   - `GROQ_API_KEY_4` → Your fourth key
   - `GROQ_API_KEY_5` → Your fifth key
4. Make sure to check all environments: **Production**, **Preview**, **Development**
5. Redeploy your application

### Step 3: Verify Rotation is Working

After deployment, check your Vercel logs:

```
[Groq] Initialized with 5 API key(s)
```

When a key hits rate limit:

```
[Groq] Marked key #2 as rate-limited
```

## 🔧 How It Works

1. **Round-Robin Selection**: Keys are used in rotation (1 → 2 → 3 → 4 → 5 → 1)
2. **Automatic Failover**: When a key is rate-limited, it's marked as failed
3. **Smart Skipping**: Failed keys are skipped until all keys fail
4. **Auto Reset**: After all keys fail, the system resets and tries again

## 📈 Monitoring

The rotation system logs important events:

- **Startup**: Shows how many keys are configured
- **Rate Limits**: Shows which key was rate-limited
- **Resets**: Shows when failed keys are cleared

## ⚠️ Important Notes

1. **Minimum 1 Key Required**: At least `GROQ_API_KEY` must be set
2. **Optional Additional Keys**: Keys 2-5 are optional but recommended
3. **Same Account**: All keys should be from the same Groq account
4. **Free Tier Limits**: Each free tier key has 100,000 tokens/day limit
5. **Upgrade Option**: Consider upgrading to Dev Tier for higher limits per key

## 🎯 Recommended Setup

### For Development:
- **1-2 keys** are sufficient for testing

### For Production:
- **3-5 keys** recommended for high-traffic applications
- Consider upgrading to Groq Dev Tier for better limits

## 🐛 Troubleshooting

### Issue: "No GROQ_API_KEY found"
**Solution**: Make sure at least `GROQ_API_KEY` is set in environment variables

### Issue: Still getting rate limit errors
**Solutions**:
1. Add more API keys (up to 5)
2. Upgrade to Groq Dev Tier
3. Wait for rate limit cooldown (usually 15 minutes)
4. Use Lynxa Lite model which has separate quotas

### Issue: Keys not rotating
**Solution**: Check Vercel logs to see if all keys are properly loaded

## 📝 Example Usage

The rotation happens automatically. You don't need to change any code:

```typescript
// This automatically uses the rotation system
const response = await model("chat-model").doGenerate({
  // your parameters
});
```

## 🔐 Security Best Practices

1. **Never commit API keys** to git
2. **Use environment variables** for all keys
3. **Rotate keys regularly** (create new ones, delete old ones)
4. **Monitor usage** on Groq dashboard
5. **Set up alerts** for unusual activity

## 💡 Tips

- **Stagger Key Creation**: Create keys at different times to avoid synchronized rate limit resets
- **Monitor Dashboard**: Check https://console.groq.com for usage stats
- **Test Locally First**: Verify rotation works in development before deploying
- **Use Different Models**: Lite, Pro, and Reasoning models have separate quotas

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set correctly
3. Test API keys individually using curl
4. Check Groq status page for service issues

---

**Last Updated**: October 12, 2025
**Version**: 1.0.0
