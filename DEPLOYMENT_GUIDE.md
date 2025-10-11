# Deployment Guide for Next.js AI Chatbot

## Fixed Issues

The following issues have been resolved for successful Vercel deployment:

1. ✅ Added missing exports to `lib/constants.ts`:
   - `isDevelopmentEnvironment`
   - `guestRegex`

2. ✅ Updated `package.json` with missing peer dependencies:
   - `@opentelemetry/instrumentation@^0.55.0`
   - `@opentelemetry/sdk-logs@^0.55.0`
   - `@playwright/test@^1.51.1`

## Environment Variables Setup

### For Vercel Deployment

Set these environment variables in your Vercel project settings:

```bash
# Auth Secret (generate with: openssl rand -base64 32)
AUTH_SECRET=your_auth_secret_here

# Database URL (Vercel Postgres)
POSTGRES_URL=your_postgres_url_here

# Vercel Blob Storage (auto-configured on Vercel)
BLOB_READ_WRITE_TOKEN=your_blob_token_here

# Redis URL (optional, for rate limiting)
REDIS_URL=your_redis_url_here

# Groq API Key (optional, if using Groq models)
GROQ_API_KEY=gsk_your_actual_api_key_here

# AI Gateway API Key (for non-Vercel deployments)
# AI_GATEWAY_API_KEY=your_gateway_api_key_here
```

### For Local Development

Create a `.env.local` file in the root directory with the same variables above.

## Deployment Steps

### Option 1: Deploy to Vercel (Recommended)

1. **Push your changes to GitHub:**
   ```bash
   git add .
   git commit -m "Fix build errors and add deployment configuration"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables:**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add all required environment variables listed above

4. **Add Vercel Postgres:**
   - Go to Storage tab in your Vercel project
   - Create a new Postgres database
   - The `POSTGRES_URL` will be automatically added to your environment

5. **Add Vercel Blob:**
   - Go to Storage tab
   - Create a new Blob store
   - The `BLOB_READ_WRITE_TOKEN` will be automatically added

6. **Deploy:**
   - Click "Deploy" or push to your main branch
   - Vercel will automatically build and deploy

### Option 2: Local Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in all required values

3. **Generate AUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

4. **Run database migrations:**
   ```bash
   pnpm db:migrate
   ```

5. **Start development server:**
   ```bash
   pnpm dev
   ```

6. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup

The project uses Drizzle ORM with PostgreSQL. You need to:

1. **Create a Postgres database** (use Vercel Postgres or any PostgreSQL provider)

2. **Run migrations:**
   ```bash
   pnpm db:migrate
   ```

3. **Optional - View database:**
   ```bash
   pnpm db:studio
   ```

## Troubleshooting

### Build Errors

If you encounter module resolution errors:
- Ensure all files in `lib/` directory are committed
- Check that `tsconfig.json` has correct path mappings
- Verify `.vercelignore` isn't excluding necessary files

### Authentication Issues

- Ensure `AUTH_SECRET` is set in environment variables
- For production, use a secure random string
- Check that `POSTGRES_URL` is correctly configured

### Database Connection Errors

- Verify `POSTGRES_URL` is correct
- Ensure database is accessible from your deployment environment
- Check that migrations have been run

## AI Model Configuration

The project uses Vercel AI Gateway by default with xAI models. To use different providers:

1. **OpenAI:**
   - Add `OPENAI_API_KEY` to environment variables
   - Update model configuration in `lib/ai/models.ts`

2. **Anthropic:**
   - Add `ANTHROPIC_API_KEY` to environment variables
   - Update model configuration accordingly

3. **Groq:**
   - Add `GROQ_API_KEY` to environment variables
   - Models are already configured

## Production Checklist

- [ ] All environment variables are set in Vercel
- [ ] Database is created and migrations are run
- [ ] Blob storage is configured
- [ ] AUTH_SECRET is a secure random string
- [ ] API keys are valid and have sufficient credits
- [ ] Domain is configured (optional)
- [ ] Analytics are enabled (optional)

## Support

For issues or questions:
- Check the [AI SDK documentation](https://ai-sdk.dev/docs/introduction)
- Review [Next.js documentation](https://nextjs.org/docs)
- Visit [Vercel documentation](https://vercel.com/docs)
