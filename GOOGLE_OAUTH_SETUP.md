# Google OAuth Setup Guide

## 🔐 Setting up Google OAuth for Your AI Chatbot

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "AJ STUDIOZ AI Chatbot"
4. Click "Create"

### Step 2: Enable Google+ API

1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (for public use)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: AJ STUDIOZ AI Chatbot
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click "Save and Continue"
6. Skip "Scopes" (click "Save and Continue")
7. Add test users if needed
8. Click "Save and Continue"

### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Configure:
   - **Name**: AJ STUDIOZ Chatbot Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for local development)
     - `https://your-domain.vercel.app` (your production URL)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (local)
     - `https://your-domain.vercel.app/api/auth/callback/google` (production)
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

### Step 5: Add Environment Variables

#### Local Development (.env.local)

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

#### Vercel Deployment

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add these variables:
   - **Name**: `GOOGLE_CLIENT_ID`
   - **Value**: Your Google Client ID
   - Click "Add"
   
   - **Name**: `GOOGLE_CLIENT_SECRET`
   - **Value**: Your Google Client Secret
   - Click "Add"

4. Redeploy your application

### Step 6: Test Google Login

1. Go to your application
2. Click "Sign In"
3. Click "Sign in with Google"
4. Select your Google account
5. Grant permissions
6. You should be logged in!

## ✅ Features Enabled

- ✅ Google OAuth Login
- ✅ User profile from Google
- ✅ Secure authentication
- ✅ Automatic user creation

## 🎨 UI Features

Your chatbot now has:
- ✅ **Real-time streaming** - ChatGPT-like responses
- ✅ **Animated AJ logo** - Pulses and rotates while AI responds
- ✅ **Stylish input bar** - Grok-like design with hover effects
- ✅ **Syntax highlighting** - Beautiful code blocks
- ✅ **Artifacts** - HTML preview and interactive content
- ✅ **Google Login** - Easy authentication

## 🚀 Next Steps

1. Add more OAuth providers (GitHub, Microsoft, etc.)
2. Customize the login page
3. Add user profile management
4. Enable social features

## 📝 Notes

- The Google OAuth is now integrated with NextAuth
- Users can sign in with Google or use guest mode
- All chats are saved to the database
- The AJ logo animates in both the sidebar and messages

Enjoy your fully-featured AI chatbot! 🎉
