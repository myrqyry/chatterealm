# Deployment Guide

This guide covers deploying ChatterRealm to production environments.

## 📋 Prerequisites

Before deploying, ensure you have:

- Node.js 20+ installed on your server
- pnpm package manager
- A domain name (for production)
- SSL certificate (recommended for production)
- Environment variables configured

## 🏗️ Build for Production

### 1. Build All Packages

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build
```

This will:
1. Build the `shared` package first
2. Build the `frontend` package (creates `dist/` directory)
3. Build the `backend` package (creates `dist/` directory)

### 2. Verify Builds

```bash
# Check frontend build
ls -la packages/frontend/dist/

# Check backend build
ls -la packages/backend/dist/

# Check shared build
ls -la packages/shared/dist/
```

## 🌐 Frontend Deployment

The frontend is a static site that can be deployed to various hosting platforms.

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd packages/frontend
   vercel --prod
   ```

3. Configure environment variables in Vercel dashboard:
   - `VITE_API_URL`: Your backend API URL
   - `VITE_WS_URL`: Your WebSocket server URL

### Option 2: Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Deploy:
   ```bash
   cd packages/frontend
   netlify deploy --prod --dir=dist
   ```

3. Configure environment variables in Netlify dashboard

### Option 3: Static File Server (nginx, Apache)

1. Copy build files to your web server:
   ```bash
   scp -r packages/frontend/dist/* user@server:/var/www/chatterrealm/
   ```

2. Configure your web server to serve the files

3. Example nginx configuration:
   ```nginx
   server {
       listen 80;
       server_name chatterrealm.com;
       root /var/www/chatterrealm;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Enable gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   }
   ```

## 🖥️ Backend Deployment

### Option 1: Node.js Process Manager (PM2)

1. Install PM2:
   ```bash
   npm install -g pm2
   ```

2. Create ecosystem file `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [{
       name: 'chatterrealm-backend',
       script: './packages/backend/dist/index.js',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         PORT: 3001
       }
     }]
   };
   ```

3. Start the backend:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Option 2: Docker

1. Create `Dockerfile` for backend:
   ```dockerfile
   FROM node:20-alpine

   WORKDIR /app

   # Copy package files
   COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
   COPY packages/shared/package.json ./packages/shared/
   COPY packages/backend/package.json ./packages/backend/

   # Install pnpm and dependencies
   RUN npm install -g pnpm
   RUN pnpm install --frozen-lockfile

   # Copy source code
   COPY packages/shared ./packages/shared
   COPY packages/backend ./packages/backend

   # Build
   RUN pnpm build:shared
   RUN pnpm --filter backend build

   # Expose port
   EXPOSE 3001

   # Start backend
   CMD ["node", "packages/backend/dist/index.js"]
   ```

2. Build and run:
   ```bash
   docker build -t chatterrealm-backend .
   docker run -d -p 3001:3001 --name chatterrealm chatterrealm-backend
   ```

### Option 3: Cloud Platform (Heroku, Railway, Render)

Follow the platform-specific deployment guides. Key points:

- Ensure `NODE_ENV=production`
- Set environment variables
- Configure port binding
- Build the shared package before starting

## 🔐 Environment Configuration

### Frontend Environment Variables

Create `.env.production`:

```env
VITE_API_URL=https://api.chatterrealm.com
VITE_WS_URL=wss://api.chatterrealm.com
```

### Backend Environment Variables

Create `.env.production`:

```env
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://chatterrealm.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important:** Never commit `.env` files to version control!

## 🔒 Security Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS with specific origins (not `*`)
- [ ] Set up rate limiting appropriately
- [ ] Use HTTPS/WSS for all connections
- [ ] Review and set secure environment variables
- [ ] Enable security headers (helmet.js recommended)
- [ ] Set up monitoring and logging
- [ ] Configure firewall rules
- [ ] Regular security updates for dependencies

## 📊 Monitoring

### Application Monitoring

Consider using:
- **PM2 Monitoring**: Built-in process monitoring
- **New Relic**: Application performance monitoring
- **DataDog**: Infrastructure and application monitoring
- **Sentry**: Error tracking and monitoring

### Health Checks

The backend provides a health check endpoint:

```bash
curl https://api.chatterrealm.com/
```

Response:
```json
{
  "status": "ok",
  "message": "ChatterRealm Backend API",
  "version": "1.0.0",
  "world": {
    "players": 10,
    "npcs": 50,
    "items": 100,
    "phase": "normal"
  }
}
```

## 🔄 Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

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
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm build
      
      - name: Deploy Frontend
        run: |
          # Add your deployment commands here
          
      - name: Deploy Backend
        run: |
          # Add your deployment commands here
```

## 🐛 Troubleshooting

### Common Issues

**Build fails with "Cannot find module 'shared'"**
- Solution: Build the shared package first: `pnpm build:shared`

**CORS errors in production**
- Solution: Check `ALLOWED_ORIGINS` environment variable
- Ensure frontend URL is in the allowed origins list

**WebSocket connection fails**
- Solution: Ensure WebSocket endpoint is accessible
- Check that your reverse proxy (nginx/Apache) supports WebSocket upgrades
- Use WSS (WebSocket Secure) in production

**High memory usage**
- Solution: Set `max_memory_restart` in PM2 config
- Monitor and optimize game state management
- Consider implementing cleanup routines

## 📈 Performance Optimization

### Frontend
- Enable gzip compression on your web server
- Use CDN for static assets
- Implement service workers for caching
- Consider code splitting for large bundles

### Backend
- Use clustering to utilize multiple CPU cores
- Implement caching for frequently accessed data
- Monitor and optimize database queries
- Set up load balancing for high traffic

## 🔄 Updates and Rollbacks

### Deploying Updates

1. Pull latest changes:
   ```bash
   git pull origin main
   ```

2. Install new dependencies:
   ```bash
   pnpm install
   ```

3. Rebuild:
   ```bash
   pnpm build
   ```

4. Restart services:
   ```bash
   pm2 restart chatterrealm-backend
   ```

### Rollback Procedure

1. Checkout previous stable version:
   ```bash
   git checkout <previous-commit-hash>
   ```

2. Rebuild and restart:
   ```bash
   pnpm install
   pnpm build
   pm2 restart chatterrealm-backend
   ```

## 📞 Support

For deployment issues:
- Check the logs: `pm2 logs chatterrealm-backend`
- Review the [Troubleshooting](#troubleshooting) section
- Open an issue on GitHub with deployment logs

---

Good luck with your deployment! 🚀
