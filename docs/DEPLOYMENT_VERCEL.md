# Vercel Deployment Guide

Complete guide for deploying MemeNano to Vercel - the easiest and recommended deployment method.

## Table of Contents

- [Why Vercel?](#why-vercel)
- [Prerequisites](#prerequisites)
- [Quick Deploy](#quick-deploy)
- [Manual Deployment](#manual-deployment)
- [Environment Variables](#environment-variables)
- [Custom Domain Setup](#custom-domain-setup)
- [Monitoring and Analytics](#monitoring-and-analytics)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## Why Vercel?

Vercel is the **recommended deployment platform** for MemeNano because:

✅ **Zero Configuration** - Works out of the box with Next.js 15
✅ **Automatic HTTPS** - Free SSL certificates included
✅ **Global CDN** - Fast delivery worldwide with Edge Functions
✅ **Automatic Deployments** - Deploy on every git push
✅ **Generous Free Tier** - Perfect for personal projects and MVPs
✅ **Built-in Analytics** - Monitor performance and usage
✅ **Instant Rollbacks** - One-click rollback to previous versions

## Prerequisites

- GitHub, GitLab, or Bitbucket account
- Git repository with MemeNano code
- Vercel account (free at [vercel.com](https://vercel.com))

## Quick Deploy

### Option 1: Deploy Button (Fastest)

If you have the code on GitHub, use the Deploy Button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/meme-nano-web)

1. Click the "Deploy" button
2. Sign in to Vercel with your GitHub account
3. Select your repository
4. Click "Deploy"
5. Wait 2-3 minutes for build to complete
6. Your app is live! 🎉

### Option 2: Vercel CLI (Recommended for Developers)

```bash
# Install Vercel CLI globally
npm i -g vercel

# Navigate to project directory
cd meme-nano-web

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Manual Deployment

### Step 1: Push Code to Git Repository

If you haven't already:

```bash
# Initialize git (if not already done)
git init

# Add remote repository
git remote add origin https://github.com/yourusername/meme-nano-web.git

# Commit and push
git add .
git commit -m "feat: prepare for Vercel deployment"
git push -u origin main
```

### Step 2: Connect to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Sign in with your Git provider

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your repository from the list
   - Click "Import"

3. **Configure Project**
   - **Project Name:** `meme-nano-web` (or your preferred name)
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

4. **Environment Variables** (Optional)
   - Click "Environment Variables" section
   - Add any required variables (see below)

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Your app is now live!

### Step 3: Access Your Application

After deployment completes:

```
Production URL: https://meme-nano-web.vercel.app
Preview URL: https://meme-nano-web-git-branch.vercel.app
```

## Environment Variables

MemeNano uses **BYOK (Bring Your Own Key)** model, so server-side environment variables are **NOT required**. Users provide their own Gemini API keys through the Settings screen.

However, if you want to configure any optional settings:

### Add Environment Variables

1. **Via Vercel Dashboard:**
   - Go to Project Settings → Environment Variables
   - Add variables for all environments (Production, Preview, Development)

2. **Via CLI:**
   ```bash
   # Add production variable
   vercel env add NODE_ENV production

   # Add preview variable
   vercel env add NODE_ENV preview

   # Add development variable
   vercel env add NODE_ENV development
   ```

### Optional Environment Variables

```env
# Node environment
NODE_ENV=production

# Custom analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Feature flags (optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

**Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Custom Domain Setup

### Add Custom Domain

1. **Via Vercel Dashboard:**
   - Go to Project Settings → Domains
   - Click "Add"
   - Enter your domain: `meme-nano.yourdomain.com`
   - Follow DNS configuration instructions

2. **Configure DNS:**

   **Option A: Using Vercel Nameservers (Recommended)**
   ```
   At your domain registrar, point nameservers to:
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

   **Option B: Using A/CNAME Records**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Wait for DNS Propagation** (5-48 hours)

4. **Automatic SSL**
   - Vercel automatically provisions SSL certificates
   - No additional configuration needed
   - Auto-renewal included

### Multiple Domains

Add multiple domains for the same project:

```bash
# Via CLI
vercel domains add yourdomain.com
vercel domains add www.yourdomain.com
vercel domains add meme-nano.yourdomain.com
```

## Monitoring and Analytics

### Built-in Analytics

Vercel provides analytics out of the box:

1. **Enable Analytics:**
   - Go to Project Settings → Analytics
   - Click "Enable Analytics"
   - View real-time metrics

2. **Metrics Available:**
   - Page views
   - Unique visitors
   - Top pages
   - Referrers
   - Devices
   - Locations

### Web Vitals

Monitor Core Web Vitals:

1. Go to Project → Analytics → Web Vitals
2. View metrics:
   - **LCP** (Largest Contentful Paint)
   - **FID** (First Input Delay)
   - **CLS** (Cumulative Layout Shift)
   - **TTFB** (Time to First Byte)

### Custom Analytics

Add Google Analytics or other services:

```typescript
// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## Automatic Deployments

### Git Integration

Vercel automatically deploys:

- **Production:** Every push to `main` branch
- **Preview:** Every push to feature branches
- **Pull Requests:** Every PR gets a unique preview URL

### Deployment Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ... edit files ...

# Commit and push
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Vercel automatically creates preview deployment
# Visit: https://meme-nano-web-git-feature-new-feature.vercel.app
```

### Deployment Notifications

Enable notifications:

1. Go to Project Settings → Git
2. Enable "Deployment notifications"
3. Choose notification channels:
   - Email
   - Slack
   - Discord
   - GitHub comments

## Troubleshooting

### Build Failures

**Check Build Logs:**

1. Go to Vercel Dashboard → Deployments
2. Click on failed deployment
3. View "Build Logs"

**Common Issues:**

#### TypeScript Errors

```bash
# Locally run type check
npm run type-check

# Fix errors before pushing
```

#### Dependency Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Commit updated lock file
git add package-lock.json
git commit -m "fix: update dependencies"
git push
```

#### Build Timeout

If build takes too long:

1. Go to Project Settings → General
2. Increase "Build & Development Settings" → Build timeout
3. Or optimize build process

### Deployment Issues

#### Domain Not Working

```bash
# Check DNS propagation
dig yourdomain.com
nslookup yourdomain.com

# Wait up to 48 hours for DNS propagation
# Clear browser cache
```

#### Environment Variables Not Working

```bash
# Check variable names
vercel env ls

# Pull environment variables locally
vercel env pull

# Redeploy to apply changes
vercel --prod
```

#### 404 Errors

```bash
# Check routes in app directory
# Ensure page.tsx files exist

# Test locally
npm run dev

# Check build output
npm run build
```

### Performance Issues

#### Slow Initial Load

1. **Enable Image Optimization:**
   - Use Next.js `<Image>` component
   - Already configured in the project

2. **Check Bundle Size:**
   ```bash
   # Analyze bundle
   npm run build

   # Review output
   # Look for large chunks
   ```

3. **Enable Caching:**
   - Vercel automatically caches static assets
   - Add cache headers for dynamic routes if needed

#### API Route Timeouts

```typescript
// app/api/your-route/route.ts
export const maxDuration = 60 // Increase timeout to 60s
```

## Advanced Configuration

### Custom Build Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

### Edge Functions

MemeNano API routes automatically run on Vercel Edge Network for fast global response times.

To explicitly configure:

```typescript
// app/api/your-route/route.ts
export const runtime = 'edge' // Use edge runtime
export const dynamic = 'force-dynamic' // Force dynamic rendering
```

### Preview Deployments Protection

Protect preview deployments with password:

1. Go to Project Settings → Deployment Protection
2. Enable "Vercel Authentication"
3. Choose protection level:
   - Standard Protection (Vercel login required)
   - Custom Password

### Incremental Static Regeneration (ISR)

For better performance:

```typescript
// app/page.tsx or any page
export const revalidate = 3600 // Revalidate every hour
```

### Custom Domains for Branches

Deploy specific branches to specific domains:

```bash
# Add domain to branch
vercel domains add staging.yourdomain.com --project meme-nano-web --branch staging
```

## Best Practices

### 1. Use Preview Deployments

```bash
# Always review preview before merging
git push origin feature-branch
# Check preview URL before merging to main
```

### 2. Enable Protection

- Enable Vercel Authentication for sensitive projects
- Use environment variables for secrets
- Never commit API keys

### 3. Monitor Performance

- Check Web Vitals regularly
- Review Analytics dashboard weekly
- Set up alerts for errors

### 4. Optimize Builds

```javascript
// next.config.ts
const nextConfig = {
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Optimize fonts
  optimizeFonts: true,

  // Compress
  compress: true,
}
```

### 5. Use Git Tags for Releases

```bash
# Create release tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Vercel creates deployment with tag
```

## Vercel CLI Commands

```bash
# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs <deployment-url>

# Pull environment variables
vercel env pull

# Add environment variable
vercel env add

# Remove deployment
vercel remove <deployment-url>

# Link local project
vercel link

# Get deployment info
vercel inspect <deployment-url>
```

## Rollback

### Via Dashboard

1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Via CLI

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

## Cost Optimization

### Free Tier Limits

Vercel Free tier includes:
- Unlimited deployments
- 100 GB bandwidth per month
- 100 GB-hours serverless function execution
- Automatic SSL
- Global CDN

### Pro Features ($20/month)

- 1 TB bandwidth
- Advanced analytics
- Team collaboration
- Password protection
- Priority support

**For MemeNano MVP, Free tier is sufficient!**

## Support and Resources

- **Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Discord:** [vercel.com/discord](https://vercel.com/discord)
- **Status:** [vercel-status.com](https://vercel-status.com)
- **Support:** [vercel.com/support](https://vercel.com/support)

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Add custom domain
3. ✅ Enable analytics
4. ✅ Set up automatic deployments
5. ✅ Monitor performance
6. ✅ Share your meme generator with the world! 🎉

---

**Pro Tip:** For production applications, consider setting up staging and production branches:

```bash
# Staging branch → staging.yourdomain.com
git checkout -b staging
git push origin staging

# Production branch → yourdomain.com
git checkout main
git push origin main
```