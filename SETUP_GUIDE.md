# Setup Guide - AI Chatbot with Artifacts

This guide will help you set up and configure your AI chatbot with all the new features.

## ✨ New Features Added

### 1. **Custom Logo & Branding**
- ✅ Custom logo in sidebar (`/public/logo.jpg`)
- ✅ AI avatar using the same logo in chat messages
- ✅ Animated avatar during AI responses

### 2. **Google OAuth Integration**
- ✅ Google Sign-In button on login page
- ✅ Google Sign-Up button on register page
- ✅ Seamless authentication flow

### 3. **Artifacts System**
The chatbot includes a powerful artifacts system similar to Claude's Artifacts:

#### **Code Artifacts**
- Interactive code editor with syntax highlighting
- Support for JavaScript, Python, HTML, CSS
- Live preview for web components
- Code execution and rendering

#### **Text Artifacts**
- Rich text document editing
- Markdown support
- Version control and history
- Real-time collaboration

#### **Sheet Artifacts**
- Spreadsheet/data grid functionality
- CSV import/export
- Data manipulation and analysis
- Interactive tables

#### **Image Artifacts**
- Image generation and display
- Image preview and download
- Support for various formats

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- pnpm package manager
- A Groq API key (free at https://console.groq.com)
- Google OAuth credentials (optional, for Google Sign-In)
- PostgreSQL database (Vercel Postgres recommended)

### Installation

1. **Clone and Install Dependencies**
   ```bash
   cd nextjs-ai-chatbot
   pnpm install
   ```

2. **Set Up Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Groq API Key (Required)
   GROQ_API_KEY=gsk_your_actual_api_key_here
   
   # Auth Secret (Required - generate with: openssl rand -base64 32)
   AUTH_SECRET=your_auth_secret_here
   
   # Google OAuth (Optional - for Google Sign-In)
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   
   # Database (Required)
   POSTGRES_URL=your_postgres_connection_string
   
   # Vercel Blob Storage (Required for file uploads)
   BLOB_READ_WRITE_TOKEN=your_blob_token_here
   
   # Redis (Optional - for caching)
   REDIS_URL=your_redis_url_here
   ```

3. **Set Up Database**
   ```bash
   # Generate database schema
   pnpm db:generate
   
   # Run migrations
   pnpm db:migrate
   
   # (Optional) Open database studio
   pnpm db:studio
   ```

4. **Run Development Server**
   ```bash
   pnpm dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Navigate to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen:
   - User Type: External
   - Add your app name, email, and logo
   - Add scopes: `email`, `profile`, `openid`
6. Create OAuth Client ID:
   - Application type: Web application
   - Authorized redirect URIs:
     - Local: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env.local`

## 🎨 Customizing Your Logo

To use your own logo:

1. Replace `/public/logo.jpg` with your logo image
2. Recommended size: 32x32px or larger (will be scaled)
3. Supported formats: JPG, PNG, SVG, WebP

The logo will automatically appear in:
- Sidebar header
- AI message avatars
- Loading states

## 📦 Using Artifacts

### How to Trigger Artifacts

Ask the AI to create different types of content:

**Code Artifacts:**
- "Create a React component for a todo list"
- "Build a calculator in JavaScript"
- "Make an interactive chart with D3.js"

**Text Documents:**
- "Write a blog post about AI"
- "Create a project proposal"
- "Draft a technical documentation"

**Spreadsheets:**
- "Create a budget spreadsheet"
- "Generate a sales data table"
- "Make a project timeline"

**Images:**
- "Generate a logo design"
- "Create an illustration"

### Artifact Features

- **Live Preview**: See changes in real-time
- **Version History**: Track all changes
- **Edit Mode**: Modify generated content
- **Download**: Export artifacts
- **Share**: Share with others

## 🛠️ Available Scripts

```bash
# Development
pnpm dev              # Start dev server with Turbo
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:generate      # Generate Drizzle schema
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
pnpm db:push          # Push schema changes
pnpm db:pull          # Pull schema from database

# Code Quality
pnpm lint             # Check code quality
pnpm format           # Format code

# Testing
pnpm test             # Run Playwright tests
```

## 🌐 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/nextjs-ai-chatbot)

### Environment Variables for Production

Make sure to set all required environment variables in your Vercel project:
- `GROQ_API_KEY`
- `AUTH_SECRET`
- `GOOGLE_CLIENT_ID` (if using Google OAuth)
- `GOOGLE_CLIENT_SECRET` (if using Google OAuth)
- `POSTGRES_URL`
- `BLOB_READ_WRITE_TOKEN`

## 🔧 Troubleshooting

### Google OAuth Not Working
- Verify redirect URIs match exactly
- Check that Google+ API is enabled
- Ensure credentials are in `.env.local`

### Database Connection Issues
- Verify `POSTGRES_URL` is correct
- Run `pnpm db:migrate` to ensure schema is up to date
- Check database permissions

### Artifacts Not Displaying
- Clear browser cache
- Check browser console for errors
- Verify all dependencies are installed

### Logo Not Showing
- Ensure `/public/logo.jpg` exists
- Check file permissions
- Verify image format is supported

## 📚 Additional Resources

- [AI SDK Documentation](https://ai-sdk.dev/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Groq API Documentation](https://console.groq.com/docs)
- [Auth.js Documentation](https://authjs.dev)
- [Drizzle ORM Documentation](https://orm.drizzle.team)

## 🤝 Support

For issues and questions:
- Check the [GitHub Issues](https://github.com/kamesh6592-cell/nextjs-ai-chatbot/issues)
- Review the documentation
- Join the community discussions

## 📝 License

This project is open source and available under the MIT License.
