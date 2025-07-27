# CancelBuddy - Subscription Management App

## 🚀 Google Cloud Run Deployment

This application is optimized for Google Cloud Run deployment.

### Prerequisites

- Google Cloud Account
- GitHub repository connected
- PostgreSQL database (recommended: Neon Database)

### Deployment Steps

1. **Google Cloud Console**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Navigate to Cloud Run
   - Click "Create Service"

2. **Source Configuration**
   - Choose "Continuously deploy new revisions from a source repository"
   - Connect your GitHub repository
   - Select branch: `main`
   - Build Type: Dockerfile
   - Source location: `/` (root directory)

3. **Service Configuration**
   - Service name: `cancelbuddy`
   - Region: `europe-west1` (or preferred)
   - Authentication: Allow unauthenticated invocations
   - CPU: 1 vCPU
   - Memory: 512 MiB
   - Concurrency: 100

4. **Environment Variables**
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NODE_ENV`: production (automatically set)

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Health Check

The application includes a health check endpoint at `/health` for monitoring.

### Features

- ✅ **Google Cloud Run Optimized**: Follows all official Container Runtime Contract requirements
- ✅ **Port Configuration**: Listens on `0.0.0.0` with `PORT` environment variable (defaults to 8080)
- ✅ **Health Monitoring**: `/health` and `/ready` endpoints for Cloud Run monitoring
- ✅ **Error Handling**: Graceful error handling prevents container crashes
- ✅ **Security**: Non-root user (appuser:nodejs) for production safety
- ✅ **Performance**: Optimized startup time and dependency management
- ✅ **Docker Build**: Single-stage optimized build with security updates
- ✅ **Stateless Architecture**: Suitable for serverless auto-scaling
- ✅ **Database Integration**: PostgreSQL with Drizzle ORM
- ✅ **Progressive Web App**: PWA support with service worker

## Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Docker + Google Cloud Run