# Integration Guide - Amanda AI Unified Platform

## Overview

This document explains how to integrate Vínculo and Yo Decreto applications into the Amanda AI core application for unified installation and deployment on Replit production.

## 🏗️ Architecture

### Monorepo Structure
```
amanda-ai-unified/
├── apps/
│   ├── amanda-ai/          # Core app (Rosalba Insight IA)
│   ├── vinculo/            # Connection management
│   ├── yo-decreto/         # Legal document management
│   └── README.md
├── packages/
│   └── shared/             # Shared types and utilities
├── scripts/
│   └── install-apps.js     # Installation orchestrator
├── package.json            # Root workspace configuration
├── .replit                 # Replit deployment config
└── INTEGRATION_GUIDE.md    # This file
```

## 📋 Installation Steps

### Step 1: Copy App Code to Respective Directories

```bash
# Copy Vínculo app
cp -r /path/to/vinculo/* apps/vinculo/

# Copy Yo Decreto app
cp -r /path/to/yo-decreto/* apps/yo-decreto/

# Amanda AI (already in place as root structure)
```

### Step 2: Create Package.json for Each App

Each app directory needs its own `package.json`:

**apps/amanda-ai/package.json**
```json
{
  "name": "amanda-ai",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "private": true,
  "workspaces": false,
  "scripts": {
    "expo:dev": "EXPO_PACKAGER_PROXY_URL=https://$REPLIT_DEV_DOMAIN REACT_NATIVE_PACKAGER_HOSTNAME=$REPLIT_DEV_DOMAIN EXPO_PUBLIC_DOMAIN=$REPLIT_DEV_DOMAIN:5000 npx expo start --localhost",
    "server:dev": "NODE_ENV=development tsx server/index.ts",
    "server:build": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=server_dist",
    "server:prod": "NODE_ENV=production node server_dist/index.js"
  }
}
```

**apps/vinculo/package.json**
```json
{
  "name": "vinculo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-native": "^0.81.0"
  }
}
```

**apps/yo-decreto/package.json**
```json
{
  "name": "yo-decreto",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-native": "^0.81.0"
  }
}
```

### Step 3: Run Installation

```bash
npm run install:apps
```

This will:
- Create all app directories
- Install dependencies
- Set up the unified environment

## 🔌 Integration Points

### 1. Shared Types (packages/shared/)

Create `packages/shared/types.ts`:
```typescript
// Types used across all apps
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Document {
  id: string;
  type: 'decree' | 'connection' | 'ai-response';
  content: string;
  createdAt: Date;
}

export interface AppConfig {
  apiUrl: string;
  wsUrl: string;
  environment: 'development' | 'production';
}
```

### 2. API Endpoints

Amanda AI server exposes endpoints for all apps:

```
POST   /api/vinculo/connect         - Create connection
GET    /api/vinculo/connections     - List connections
POST   /api/yo-decreto/create       - Create decree
GET    /api/yo-decreto/list         - List decrees
POST   /api/amanda/query            - Query AI
```

### 3. Environment Variables

Create `.env` in root:
```
# Core
PORT=5000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://...

# APIs
OPENAI_API_KEY=...

# Replit
REPLIT_DEV_DOMAIN=...
REPLIT_PROD_DOMAIN=...

# Apps
VINCULO_ENABLED=true
YO_DECRETO_ENABLED=true
AMANDA_AI_ENABLED=true
```

## 🚀 Deployment on Replit Production

### Configuration

The `.replit` file is pre-configured to:

1. **Build Phase**:
   - Installs all app dependencies
   - Builds shared packages
   - Prepares Amanda AI server

2. **Run Phase**:
   - Starts Amanda AI main server on port 5000
   - Makes Vínculo and Yo Decreto accessible via API

### Deploy Process

```bash
# 1. Push changes to GitHub
git add .
git commit -m "Integrate Vinculo and Yo Decreto"
git push origin main

# 2. Replit automatically deploys
# Check deployment logs in Replit console

# 3. Access apps via:
# - Amanda AI: https://your-replit.replit.dev
# - Vínculo: https://your-replit.replit.dev/vinculo
# - Yo Decreto: https://your-replit.replit.dev/yo-decreto
```

## 📱 App Communication

### Between Vínculo and Yo Decreto

```typescript
// In Vínculo app
import { useApi } from '@amanda-ai/shared';

const vinculos = await fetch('/api/vinculo/connections');
const decrees = await fetch('/api/yo-decreto/list');
```

### With Amanda AI Backend

```typescript
// Direct server communication
const response = await fetch('http://localhost:5000/api/amanda/query', {
  method: 'POST',
  body: JSON.stringify({ query: 'user query' })
});
```

## 🧪 Testing Integration

```bash
# Test all apps
npm run lint

# Build all apps
npm run build

# Run server in development
npm run server:dev

# Test individual apps
npm run test -w amanda-ai
npm run test -w vinculo
npm run test -w yo-decreto
```

## 🔐 Security Considerations

1. **API Keys**: Store in environment variables, never commit
2. **CORS**: Configure in server for cross-app communication
3. **Authentication**: Implement JWT across all apps
4. **Database**: Use separate schemas for each app if needed

## 📊 Monitoring

Monitor all apps from single dashboard:

```bash
# Check app status
curl http://localhost:5000/api/health

# View logs
tail -f replit.log
```

## 🆘 Troubleshooting

### Installation fails
```bash
rm -rf node_modules package-lock.json
npm run install:apps
```

### Apps not communicating
- Check port 5000 is accessible
- Verify environment variables
- Check CORS settings in server

### Production deployment fails
- Check GitHub sync is enabled
- Verify `.replit` file syntax
- Check Replit logs for errors

## 🔄 Updates

To update individual apps:

```bash
# Update Vínculo
npm update -w vinculo

# Update Yo Decreto
npm update -w yo-decreto

# Update all
npm update
```

## 📚 Additional Resources

- [npm Workspaces Documentation](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Replit Deployment Guide](https://docs.replit.com/hosting/deployments)
- [Amanda AI Documentation](./apps/amanda-ai/README.md)
- [Vínculo Documentation](./apps/vinculo/README.md)
- [Yo Decreto Documentation](./apps/yo-decreto/README.md)