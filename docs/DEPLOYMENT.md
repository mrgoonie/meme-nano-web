# Deployment Guide

Complete deployment guide for MemeNano with multiple platform options.

## Quick Links

- **[Vercel Deployment →](./DEPLOYMENT_VERCEL.md)** ⭐ Recommended
- **[VPS Deployment →](./DEPLOYMENT_VPS.md)** Advanced

## Deployment Options Comparison

| Feature | Vercel | VPS (Docker) | Other Platforms |
|---------|--------|--------------|-----------------|
| **Setup Time** | 5 minutes | 30-60 minutes | 10-20 minutes |
| **Difficulty** | ⭐ Easy | ⭐⭐⭐ Advanced | ⭐⭐ Medium |
| **Cost (Free Tier)** | Generous | $5-10/month | Varies |
| **Scaling** | Automatic | Manual | Platform-dependent |
| **SSL** | Automatic | Manual (Let's Encrypt) | Usually automatic |
| **CI/CD** | Built-in | Manual setup | Platform-dependent |
| **Best For** | Quick start, MVP | Full control, enterprise | Specific needs |

## Recommended: Deploy to Vercel

**Why Vercel?**
- ✅ Built specifically for Next.js
- ✅ Zero configuration required
- ✅ Automatic HTTPS and CDN
- ✅ Free tier perfect for MVPs
- ✅ Deploy in under 5 minutes

**Quick Deploy:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**[Full Vercel Guide →](./DEPLOYMENT_VERCEL.md)**

## Advanced: Deploy to VPS

**Why VPS?**
- ✅ Complete control over infrastructure
- ✅ No vendor lock-in
- ✅ Custom configurations
- ✅ Suitable for enterprise needs

**Quick Start:**

```bash
# On your VPS
git clone your-repo
cd meme-nano-web
docker-compose up -d
```

**[Full VPS Guide →](./DEPLOYMENT_VPS.md)**

## Other Deployment Options

### Netlify

**Setup:**

1. Connect GitHub repository
2. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
3. Deploy

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Railway

**Setup:**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

### Render

**Setup:**

1. Create new Web Service
2. Connect repository
3. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Deploy

**render.yaml:**
```yaml
services:
  - type: web
    name: meme-nano-web
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

### Cloudflare Pages

**Setup:**

1. Connect GitHub repository
2. Configure build:
   - **Framework preset:** Next.js
   - **Build command:** `npm run build`
   - **Build output directory:** `.next`
3. Deploy

Note: Requires Next.js Edge Runtime configuration.

### AWS (Amplify)

**Setup:**

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

### Google Cloud Run

**Setup:**

```bash
# Build Docker image
docker build -t gcr.io/your-project/meme-nano-web .

# Push to Container Registry
docker push gcr.io/your-project/meme-nano-web

# Deploy to Cloud Run
gcloud run deploy meme-nano-web \
  --image gcr.io/your-project/meme-nano-web \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure App Service

**Setup:**

```bash
# Install Azure CLI
az login

# Create App Service plan
az appservice plan create --name meme-nano-plan --resource-group myResourceGroup --sku B1 --is-linux

# Create web app
az webapp create --resource-group myResourceGroup --plan meme-nano-plan --name meme-nano-web --runtime "NODE|20-lts"

# Deploy
az webapp deployment source config --name meme-nano-web --resource-group myResourceGroup --repo-url https://github.com/yourusername/meme-nano-web --branch main --manual-integration
```

### DigitalOcean App Platform

**Setup:**

1. Create new app from GitHub
2. Configure:
   - **Resource Type:** Web Service
   - **Build Command:** `npm run build`
   - **Run Command:** `npm start`
3. Deploy

**app.yaml:**
```yaml
name: meme-nano-web
services:
  - name: web
    github:
      repo: yourusername/meme-nano-web
      branch: main
      deploy_on_push: true
    build_command: npm run build
    run_command: npm start
    envs:
      - key: NODE_ENV
        value: production
    http_port: 3000
```

## Docker Deployment

### Docker Hub

**Build and push:**

```bash
# Build image
docker build -t yourusername/meme-nano-web:latest .

# Login to Docker Hub
docker login

# Push image
docker push yourusername/meme-nano-web:latest

# Run on any server
docker run -d -p 3000:3000 yourusername/meme-nano-web:latest
```

### Docker Compose (Standalone)

```bash
# Clone repository
git clone your-repo
cd meme-nano-web

# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Kubernetes Deployment

**deployment.yaml:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: meme-nano-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: meme-nano-web
  template:
    metadata:
      labels:
        app: meme-nano-web
    spec:
      containers:
      - name: meme-nano-web
        image: yourusername/meme-nano-web:latest
        ports:
        - containerPort: 3000
        resources:
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: meme-nano-web-service
spec:
  type: LoadBalancer
  selector:
    app: meme-nano-web
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
```

**Deploy:**

```bash
kubectl apply -f deployment.yaml
kubectl get services
```

## CI/CD Setup

### GitHub Actions

**.github/workflows/deploy.yml:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### GitLab CI

**.gitlab-ci.yml:**

```yaml
image: node:20-alpine

stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - npm ci
    - npm run test
    - npm run type-check

build:
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - .next/

deploy:
  stage: deploy
  script:
    - npm i -g vercel
    - vercel --token=$VERCEL_TOKEN --prod
  only:
    - main
```

## Pre-Deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables configured
- [ ] API keys obtained (Gemini API)
- [ ] Domain name ready (if using custom domain)
- [ ] SSL certificate plan (automatic on most platforms)
- [ ] Monitoring setup planned
- [ ] Backup strategy defined

## Post-Deployment Checklist

- [ ] Application accessible via URL
- [ ] Health check endpoint working (`/api/health`)
- [ ] All pages load correctly
- [ ] Meme generation workflow works end-to-end
- [ ] API key management functional
- [ ] Download feature working
- [ ] Share feature working
- [ ] Mobile responsive design verified
- [ ] SSL certificate active
- [ ] Analytics/monitoring enabled
- [ ] Error tracking configured
- [ ] Performance metrics reviewed

## Monitoring Setup

### Recommended Monitoring Tools

1. **Vercel Analytics** (Built-in)
   - Real-time metrics
   - Web Vitals
   - Free tier available

2. **Sentry** (Error Tracking)
   ```bash
   npm install @sentry/nextjs
   ```

3. **LogRocket** (Session Replay)
   ```bash
   npm install logrocket
   ```

4. **Uptime Robot** (Uptime Monitoring)
   - Free for 50 monitors
   - 5-minute checks

### Basic Health Monitoring

**Simple uptime check:**

```bash
# Create monitoring script
#!/bin/bash
URL="https://your-domain.com/api/health"
if curl -f $URL > /dev/null 2>&1; then
  echo "$(date): Service is UP"
else
  echo "$(date): Service is DOWN"
  # Send alert (email, Slack, etc.)
fi
```

## Performance Optimization

### Edge Caching

**Vercel (automatic):**
```typescript
// app/page.tsx
export const revalidate = 3600 // Cache for 1 hour
```

**Custom CDN:**
```typescript
// next.config.ts
const nextConfig = {
  headers: async () => [
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
}
```

### Image Optimization

Already configured in `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'i.imgflip.com',
    },
  ],
  formats: ['image/avif', 'image/webp'],
}
```

## Cost Comparison

| Platform | Free Tier | Paid Plan | Best For |
|----------|-----------|-----------|----------|
| **Vercel** | 100GB bandwidth | $20/mo | Quick deployment |
| **Netlify** | 100GB bandwidth | $19/mo | JAMstack apps |
| **Railway** | $5 credit | $5-10/mo | Hobby projects |
| **Render** | 750 hours/mo | $7/mo | Simple hosting |
| **VPS** | N/A | $5-10/mo | Full control |
| **AWS** | 12 months free tier | Variable | Enterprise |
| **GCP** | $300 credit | Variable | Enterprise |

## Support

### Platform-Specific Support

- **Vercel:** [Discord](https://vercel.com/discord), [Docs](https://vercel.com/docs)
- **VPS:** Community forums, Stack Overflow
- **AWS:** AWS Support plans
- **GCP:** Google Cloud Support

### Application Support

- **GitHub Issues:** Report bugs and feature requests
- **Documentation:** Check `docs/` folder
- **Logs:** Check application and platform logs

## Next Steps

1. Choose your deployment platform
2. Follow the specific guide for your platform
3. Deploy your application
4. Configure custom domain (optional)
5. Set up monitoring and alerts
6. Share your meme generator! 🎉

---

**Need Help?**

- Check platform-specific guides for detailed instructions
- Review troubleshooting sections
- Ask in community forums
- Open GitHub issue for application bugs