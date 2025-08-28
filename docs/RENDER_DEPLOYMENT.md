# Render.com Deployment Guide for University SIS

This guide provides comprehensive instructions for deploying the University Student Information System to Render.com.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Preparation](#preparation)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Environment Variables](#environment-variables)
7. [Custom Domain Setup](#custom-domain-setup)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- GitHub repository with your SIS code
- Render.com account (free tier available)
- MongoDB Atlas account (recommended) or Render PostgreSQL
- Email service credentials (Gmail, SendGrid, etc.)
- SMS service credentials (Twilio recommended)
- Domain name (optional, for custom domain)

## Preparation

### 1. Repository Setup

Ensure your GitHub repository is public or you have proper access configured:

```bash
# Make sure your repository is up to date
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Environment Configuration

Create production environment files:

**Backend (`backend/.env.production`):**
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-url.onrender.com
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
FILE_UPLOAD_MAX_SIZE=10485760
FILE_UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

**Frontend (`frontend/.env.production`):**
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
REACT_APP_APP_NAME=Student Information System
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production
REACT_APP_DEFAULT_LANGUAGE=en
REACT_APP_SUPPORTED_LANGUAGES=en,ar
GENERATE_SOURCEMAP=false
```

## Database Setup

### Option 1: MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account:**
   - Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Set up database user and network access

2. **Configure Database:**
   ```javascript
   // Database name: sis_production
   // Collections will be created automatically
   ```

3. **Get Connection String:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/sis_production?retryWrites=true&w=majority
   ```

### Option 2: Render PostgreSQL + Prisma (Alternative)

If you prefer PostgreSQL, you can modify the application to use Prisma:

1. Create a PostgreSQL database on Render
2. Configure Prisma schema
3. Update database connection logic

## Backend Deployment

### 1. Create Web Service

1. **Login to Render Dashboard:**
   - Go to [Render.com](https://render.com)
   - Click "New +" → "Web Service"

2. **Connect Repository:**
   - Select your GitHub repository
   - Choose "Connect" on your SIS repository

3. **Configure Service:**
   ```yaml
   Name: sis-backend-api
   Environment: Node
   Region: Oregon (or closest to your users)
   Branch: main
   Root Directory: ./backend
   Build Command: npm ci && npm run build
   Start Command: npm start
   ```

4. **Set Environment Variables:**
   - Add all environment variables from the list above
   - Use Render's secret management for sensitive data

5. **Configure Health Check:**
   ```
   Health Check Path: /api/health
   ```

### 2. Advanced Configuration

**Auto-Deploy Settings:**
- Enable auto-deploy from main branch
- Set up deploy notifications

**Scaling Configuration:**
```yaml
Plan: Starter ($7/month) or Standard ($25/month)
Instances: 1-3 (auto-scaling)
Health Check: /api/health
```

## Frontend Deployment

### 1. Create Static Site

1. **Create New Static Site:**
   - Click "New +" → "Static Site"
   - Connect same repository

2. **Configure Static Site:**
   ```yaml
   Name: sis-frontend
   Root Directory: ./frontend
   Build Command: npm ci && npm run build
   Publish Directory: ./build
   ```

3. **Environment Variables:**
   - Set REACT_APP_API_URL to your backend URL
   - Add other frontend environment variables

### 2. Configure Routing

**Add Redirect Rules:**
```yaml
# In render.yaml or dashboard
- type: rewrite
  source: /*
  destination: /index.html
```

## Environment Variables

### Critical Backend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | Database connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | Auto-generated |
| `CORS_ORIGIN` | Frontend URL for CORS | `https://app.onrender.com` |
| `EMAIL_USER` | Email service username | `your@gmail.com` |
| `EMAIL_PASS` | Email service password | App password |

### Critical Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API endpoint | `https://api.onrender.com/api` |
| `REACT_APP_ENVIRONMENT` | Deployment environment | `production` |

### Setting Environment Variables

**Via Render Dashboard:**
1. Go to your service settings
2. Navigate to "Environment" tab
3. Add key-value pairs
4. Save and redeploy

**Via render.yaml:**
```yaml
envVars:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    generateValue: true  # Auto-generate secure value
  - key: EMAIL_USER
    sync: false  # Set manually in dashboard
```

## Custom Domain Setup

### 1. Configure Custom Domain

1. **Add Domain in Render:**
   - Go to service settings
   - Click "Custom Domains"
   - Add your domain (e.g., `sis.university.edu`)

2. **DNS Configuration:**
   ```
   Type: CNAME
   Name: sis (or @)
   Value: your-app.onrender.com
   ```

3. **SSL Certificate:**
   - Render automatically provisions SSL certificates
   - Certificates auto-renew

### 2. Update Environment Variables

Update CORS_ORIGIN and API URLs to use your custom domain:

```env
CORS_ORIGIN=https://sis.university.edu
REACT_APP_API_URL=https://api.university.edu/api
```

## Monitoring and Maintenance

### 1. Monitoring Setup

**Render Built-in Monitoring:**
- View logs in real-time
- Monitor resource usage
- Set up alerts

**Health Checks:**
```javascript
// backend/src/routes/health.js
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

### 2. Log Management

**Access Logs:**
```bash
# Via Render dashboard
# Logs → View logs → Filter by service
```

**Structured Logging:**
```javascript
// Use winston or similar for structured logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});
```

### 3. Database Maintenance

**MongoDB Atlas:**
- Monitor connection count
- Set up automated backups
- Monitor storage usage

**Performance Optimization:**
- Add database indexes
- Monitor slow queries
- Implement connection pooling

### 4. Security Considerations

**Environment Security:**
- Rotate secrets regularly
- Use Render's secret management
- Implement rate limiting

**Application Security:**
- Enable HTTPS only
- Set security headers
- Implement proper CORS

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Node.js Version Issues:**
```json
// package.json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

**Memory Issues:**
```yaml
# Upgrade to Standard plan for more memory
# Or optimize build process
build:
  env:
    NODE_OPTIONS: "--max-old-space-size=2048"
```

#### 2. Runtime Errors

**Database Connection:**
```javascript
// Add connection timeout and retry logic
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  retryWrites: true,
  retryReads: true
});
```

**CORS Issues:**
```javascript
// backend/src/middleware/cors.js
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'https://your-app.onrender.com',
  'http://localhost:3000' // For development
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

#### 3. Performance Issues

**Optimize Bundle Size:**
```javascript
// frontend/src/index.js
// Implement code splitting
const LazyComponent = lazy(() => import('./components/LazyComponent'));
```

**Database Optimization:**
```javascript
// Add appropriate indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.students.createIndex({ studentId: 1 }, { unique: true });
db.enrollments.createIndex({ student: 1, semester: 1 });
```

### Debug Commands

**View Service Logs:**
```bash
# Via Render CLI (if available)
render logs --service=sis-backend-api --follow

# Or use dashboard web interface
```

**Test Health Endpoints:**
```bash
curl https://your-backend.onrender.com/api/health
curl https://your-frontend.onrender.com/
```

### Support Resources

1. **Render Documentation:** https://render.com/docs
2. **Render Community:** https://community.render.com
3. **MongoDB Atlas Support:** https://docs.atlas.mongodb.com
4. **Project Issues:** Create issues in your GitHub repository

## Deployment Checklist

- [ ] Repository prepared and pushed to GitHub
- [ ] MongoDB Atlas database created and configured
- [ ] Backend service deployed and healthy
- [ ] Frontend static site deployed
- [ ] Environment variables configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Health checks passing
- [ ] Email service tested
- [ ] SMS service tested (if applicable)
- [ ] User authentication working
- [ ] File uploads working
- [ ] PDF generation working
- [ ] Monitoring and alerts configured

## Cost Estimation

### Free Tier Limitations
- 750 hours/month free usage (automatically suspends after 15min of inactivity)
- 100GB bandwidth/month
- 1GB build minutes/month

### Paid Plans
- **Starter ($7/month per service):**
  - Always-on instances
  - Custom domains
  - 100GB bandwidth
  
- **Standard ($25/month per service):**
  - More resources
  - Faster builds
  - Priority support

### Total Monthly Cost (Production Setup)
- Backend service: $7-25/month
- Frontend service: $7/month
- MongoDB Atlas: $0-9/month (M0-M2)
- Domain: $10-15/year
- **Total: ~$14-40/month**

## Next Steps

After successful deployment:

1. **Set up monitoring and alerting**
2. **Configure automated backups**
3. **Implement CI/CD pipeline integration**
4. **Set up staging environment**
5. **Configure user training and documentation**
6. **Plan for scaling and optimization**

## Support

For deployment support, please:

1. Check the troubleshooting section above
2. Review Render.com documentation
3. Create an issue in the project repository
4. Contact the development team

---

**Last Updated:** December 2024
**Version:** 1.0.0