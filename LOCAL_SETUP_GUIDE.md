# Local Setup Guide

## Error: Invalid URL for POSTGRES_URL

You're seeing this error because the database connection string is not properly configured.

## Quick Fix Options:

### Option 1: Use Vercel Postgres (Recommended for deployment)

1. Go to your Vercel project dashboard
2. Navigate to Storage → Create Database → Postgres
3. Copy the `POSTGRES_URL` from the `.env.local` tab
4. Update your local `.env.local` file with the actual URL

### Option 2: Use Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database: `createdb nextjs_chatbot`
3. Update `.env.local` with:
   ```
   POSTGRES_URL=postgresql://username:password@localhost:5432/nextjs_chatbot
   ```
4. Run migrations: `pnpm db:migrate`

### Option 3: Use Neon (Free PostgreSQL)

1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy the connection string
4. Update `.env.local` with the connection string

## Required Environment Variables:

```env
# Database (REQUIRED)
POSTGRES_URL=postgresql://user:password@host:5432/database

# Groq API Key (REQUIRED for AI features)
GROQ_API_KEY=gsk_your_actual_groq_api_key

# Auth Secret (REQUIRED - generate with: openssl rand -base64 32)
AUTH_SECRET=your_generated_secret_here

# Optional (for file uploads and caching)
BLOB_READ_WRITE_TOKEN=vercel_blob_token
REDIS_URL=redis_connection_string
```

## Steps to Get Running:

1. **Set up Database**: Choose one of the options above
2. **Get Groq API Key**: 
   - Visit https://console.groq.com
   - Create an account and get your API key
   - Add to `.env.local`
3. **Generate Auth Secret**:
   ```bash
   openssl rand -base64 32
   ```
   Or use any random 32+ character string
4. **Update `.env.local`** with real values
5. **Run migrations** (if using fresh database):
   ```bash
   pnpm db:migrate
   ```
6. **Restart dev server**:
   ```bash
   pnpm dev
   ```

## Current Status:

✅ Build successful
❌ Runtime error - Missing valid database URL
❌ Missing Groq API key

## Next Steps:

1. Update `.env.local` with valid credentials
2. Restart the dev server
3. The app should work locally

For Vercel deployment, all these environment variables should be set in your Vercel project settings.
