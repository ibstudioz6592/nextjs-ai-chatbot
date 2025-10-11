# Quick Vercel Setup Guide

## What Was Fixed

Your project had the following build errors that have been resolved:

### 1. Missing Constants
**Error:** `Module not found: Can't resolve '@/lib/constants'`

**Fix:** Added missing exports to `lib/constants.ts`:
```typescript
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
export const guestRegex = /^guest-\d+$/;
```

### 2. Missing Peer Dependencies
**Error:** Peer dependency warnings for OpenTelemetry packages

**Fix:** Added to `package.json`:
- `@opentelemetry/instrumentation@^0.55.0`
- `@opentelemetry/sdk-logs@^0.55.0`
- Updated `@playwright/test` to `^1.51.1`

## Deploy to Vercel Now

### Step 1: Commit and Push Changes

```bash
cd C:\Users\LENOVO\CascadeProjects\nextjs-ai-chatbot
git add .
git commit -m "Fix: Add missing constants and peer dependencies for Vercel deployment"
git push origin main
```

### Step 2: Configure Vercel Environment Variables

Go to your Vercel project settings and add these environment variables:

#### Required Variables:

1. **AUTH_SECRET** (Required)
   ```bash
   # Generate with: openssl rand -base64 32
   # Or use: https://generate-secret.vercel.app/32
   ```

2. **POSTGRES_URL** (Required)
   - Option A: Use Vercel Postgres (recommended)
     - Go to Storage tab → Create Database → Postgres
     - Variable is auto-added
   
   - Option B: Use external Postgres
     ```
     postgres://username:password@host:port/database
     ```

3. **BLOB_READ_WRITE_TOKEN** (Required for file uploads)
   - Go to Storage tab → Create Blob Store
   - Variable is auto-added

#### Optional Variables:

4. **REDIS_URL** (Optional - for rate limiting)
   - Go to Storage tab → Create Redis
   - Or use external Redis provider

5. **GROQ_API_KEY** (Optional - for Groq AI models)
   ```
   Get from: https://console.groq.com
   Format: gsk_xxxxxxxxxxxxx
   ```

6. **AI_GATEWAY_API_KEY** (Only for non-Vercel deployments)
   - Not needed if deploying to Vercel
   - Uses OIDC tokens automatically

### Step 3: Deploy

After pushing to GitHub, Vercel will automatically:
1. Detect the changes
2. Install dependencies
3. Build the project
4. Deploy to production

## Verify Deployment

1. **Check Build Logs**
   - Go to Vercel Dashboard → Deployments
   - Click on the latest deployment
   - Verify build completed successfully

2. **Test the Application**
   - Visit your deployment URL
   - You should be automatically logged in as a guest
   - Try sending a message to test the AI chat

3. **Check Database**
   - Run migrations if needed:
     ```bash
     # In Vercel project settings, add this to Build Command:
     pnpm install && pnpm db:migrate && pnpm build
     ```

## Common Issues & Solutions

### Issue: "Module not found" errors
**Solution:** Ensure you've committed and pushed all changes from this fix.

### Issue: Database connection errors
**Solution:** 
- Verify POSTGRES_URL is set correctly
- Ensure database is accessible
- Check if migrations need to be run

### Issue: Authentication not working
**Solution:**
- Verify AUTH_SECRET is set
- Must be at least 32 characters
- Should be different for production and development

### Issue: File upload errors
**Solution:**
- Ensure BLOB_READ_WRITE_TOKEN is set
- Verify Vercel Blob storage is created

## Build Command (if needed)

If you need to customize the build command in Vercel:

```bash
pnpm install && pnpm db:migrate && pnpm build
```

## Environment Variables Template

Copy this to your Vercel project settings:

```bash
# Required
AUTH_SECRET=
POSTGRES_URL=

# Auto-configured by Vercel (if using Vercel Storage)
BLOB_READ_WRITE_TOKEN=
REDIS_URL=

# Optional
GROQ_API_KEY=
```

## Next Steps After Deployment

1. **Set up custom domain** (optional)
   - Go to Settings → Domains
   - Add your custom domain

2. **Enable Analytics** (optional)
   - Already included via `@vercel/analytics`
   - View in Vercel Dashboard → Analytics

3. **Configure AI Models**
   - Default: xAI via Vercel AI Gateway
   - Can switch to OpenAI, Anthropic, etc.
   - Edit `lib/ai/models.ts` to customize

4. **Customize the UI**
   - Edit components in `components/` directory
   - Modify chat behavior in `app/(chat)/` directory

## Testing Locally Before Deploy

```bash
# Install dependencies
pnpm install

# Create .env.local file with your variables
# (copy from .env.example)

# Run migrations
pnpm db:migrate

# Start dev server
pnpm dev
```

## Success Indicators

✅ Build completes without errors
✅ No module resolution errors
✅ All peer dependencies satisfied
✅ Application loads successfully
✅ Guest login works automatically
✅ Chat functionality works
✅ Database connections successful

---

**Your project is now ready for Vercel deployment!** 🚀

Just commit the changes and push to trigger a new deployment.
