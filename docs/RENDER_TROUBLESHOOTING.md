# Render Deployment Troubleshooting Guide

This guide covers common issues and solutions when deploying the University SIS to Render.com.

## Table of Contents

1. [Common Build Errors](#common-build-errors)
2. [Runtime Errors](#runtime-errors)
3. [Database Connection Issues](#database-connection-issues)
4. [Environment Variable Problems](#environment-variable-problems)
5. [Performance Issues](#performance-issues)
6. [SSL and Domain Issues](#ssl-and-domain-issues)
7. [Worker Process Issues](#worker-process-issues)
8. [Debugging Tools](#debugging-tools)

## Common Build Errors

### Error: "Module not found"

**Symptoms:**
```
Error: Cannot find module 'some-package'
npm ERR! code ELIFECYCLE
```

**Solutions:**

1. **Check package.json dependencies:**
   ```bash
   # Make sure all dependencies are listed
   npm list --depth=0
   npm audit
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Verify Node.js version compatibility:**
   ```json
   // package.json
   {
     "engines": {
       "node": ">=18.0.0",
       "npm": ">=8.0.0"
     }
   }
   ```

### Error: "Build exceeded memory limit"

**Symptoms:**
```
JavaScript heap out of memory
FATAL ERROR: Reached heap limit
```

**Solutions:**

1. **Increase Node.js memory limit:**
   ```json
   // package.json
   {
     "scripts": {
       "build": "NODE_OPTIONS='--max-old-space-size=2048' npm run build:app"
     }
   }
   ```

2. **Optimize build process:**
   ```javascript
   // webpack.config.js or similar
   module.exports = {
     optimization: {
       splitChunks: {
         chunks: 'all',
         cacheGroups: {
           vendor: {
             test: /[\\/]node_modules[\\/]/,
             name: 'vendors',
             chunks: 'all',
           },
         },
       },
     },
   };
   ```

3. **Upgrade to higher Render plan** with more memory.

### Error: "Build timeout"

**Symptoms:**
```
Build timed out after 15 minutes
```

**Solutions:**

1. **Optimize build scripts:**
   ```json
   {
     "scripts": {
       "build": "npm run build:fast",
       "build:fast": "SKIP_PREFLIGHT_CHECK=true npm run build:app"
     }
   }
   ```

2. **Remove unnecessary devDependencies:**
   ```bash
   npm prune --production
   ```

3. **Use build caching:**
   ```bash
   npm ci --cache .npm --prefer-offline
   ```

## Runtime Errors

### Error: "Application failed to start"

**Symptoms:**
```
Error: listen EADDRINUSE :::3000
Application exited with code 1
```

**Solutions:**

1. **Check PORT environment variable:**
   ```javascript
   // app.js
   const PORT = process.env.PORT || 10000;
   app.listen(PORT, '0.0.0.0', () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

2. **Verify start command:**
   ```json
   // package.json
   {
     "scripts": {
       "start": "NODE_ENV=production node src/app.js"
     }
   }
   ```

3. **Check health endpoint:**
   ```javascript
   // routes/health.js
   app.get('/health', (req, res) => {
     res.status(200).json({ status: 'healthy' });
   });
   ```

### Error: "CORS policy errors"

**Symptoms:**
```
Access to fetch blocked by CORS policy
```

**Solutions:**

1. **Update CORS configuration:**
   ```javascript
   // middleware/cors.js
   const allowedOrigins = [
     process.env.CORS_ORIGIN,
     'https://your-frontend.onrender.com'
   ];

   app.use(cors({
     origin: (origin, callback) => {
       if (!origin || allowedOrigins.includes(origin)) {
         callback(null, true);
       } else {
         callback(new Error('Not allowed by CORS'));
       }
     },
     credentials: true
   }));
   ```

2. **Update environment variables:**
   ```env
   CORS_ORIGIN=https://your-frontend.onrender.com
   ```

### Error: "502 Bad Gateway"

**Symptoms:**
- Service shows as "Live" but returns 502 errors
- Intermittent connection failures

**Solutions:**

1. **Add graceful shutdown:**
   ```javascript
   // app.js
   process.on('SIGTERM', () => {
     console.log('SIGTERM received, shutting down gracefully');
     server.close(() => {
       mongoose.connection.close();
       process.exit(0);
     });
   });
   ```

2. **Implement health checks:**
   ```javascript
   app.get('/api/health', async (req, res) => {
     try {
       // Check database connection
       await mongoose.connection.db.admin().ping();
       
       res.status(200).json({
         status: 'healthy',
         timestamp: new Date().toISOString(),
         uptime: process.uptime()
       });
     } catch (error) {
       res.status(503).json({
         status: 'unhealthy',
         error: error.message
       });
     }
   });
   ```

3. **Check resource limits:**
   - Monitor memory usage in Render dashboard
   - Consider upgrading to higher plan

## Database Connection Issues

### Error: "MongoNetworkError"

**Symptoms:**
```
MongoNetworkError: connection 0 to cluster0-shard-00-00.mongodb.net:27017 closed
```

**Solutions:**

1. **Check connection string:**
   ```javascript
   // config/database.js
   const mongoUri = process.env.MONGODB_URI;
   
   if (!mongoUri) {
     throw new Error('MONGODB_URI environment variable is required');
   }

   mongoose.connect(mongoUri, {
     useNewUrlParser: true,
     useUnifiedTopology: true,
     serverSelectionTimeoutMS: 30000,
     retryWrites: true,
     retryReads: true,
     maxPoolSize: 10,
     minPoolSize: 2
   });
   ```

2. **Implement connection retry logic:**
   ```javascript
   const connectDB = async (retries = 5) => {
     try {
       await mongoose.connect(process.env.MONGODB_URI, options);
       console.log('MongoDB connected successfully');
     } catch (error) {
       console.error('MongoDB connection error:', error.message);
       
       if (retries > 0) {
         console.log(`Retrying connection in 5 seconds... (${retries} retries left)`);
         setTimeout(() => connectDB(retries - 1), 5000);
       } else {
         process.exit(1);
       }
     }
   };
   ```

3. **Verify MongoDB Atlas configuration:**
   - Check IP whitelist (0.0.0.0/0 for Render)
   - Verify database user permissions
   - Test connection string locally

### Error: "Authentication failed"

**Solutions:**

1. **Check credentials:**
   ```bash
   # Test connection string
   mongosh "mongodb+srv://username:password@cluster.mongodb.net/database"
   ```

2. **Encode special characters:**
   ```javascript
   const username = encodeURIComponent('user@domain.com');
   const password = encodeURIComponent('password!with#special$chars');
   const uri = `mongodb+srv://${username}:${password}@cluster.mongodb.net/database`;
   ```

## Environment Variable Problems

### Error: "Environment variable not set"

**Debugging steps:**

1. **List all environment variables:**
   ```javascript
   // Add temporary endpoint for debugging
   app.get('/debug/env', (req, res) => {
     const env = Object.keys(process.env)
       .filter(key => !key.includes('SECRET') && !key.includes('PASSWORD'))
       .reduce((obj, key) => {
         obj[key] = process.env[key];
         return obj;
       }, {});
     
     res.json(env);
   });
   ```

2. **Check Render dashboard:**
   - Go to Service → Environment
   - Verify all variables are set
   - Check for typos in variable names

3. **Use dotenv for local testing:**
   ```javascript
   // Load environment variables
   if (process.env.NODE_ENV !== 'production') {
     require('dotenv').config();
   }
   ```

### Error: "JWT secrets not configured"

**Solutions:**

1. **Generate secure secrets:**
   ```bash
   # Generate random secrets
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Set in Render dashboard:**
   ```
   JWT_SECRET=your_generated_secret_here
   JWT_REFRESH_SECRET=another_generated_secret_here
   ```

## Performance Issues

### Issue: "Slow response times"

**Solutions:**

1. **Add caching middleware:**
   ```javascript
   // middleware/cache.js
   const cache = require('memory-cache');
   
   const cacheMiddleware = (duration) => {
     return (req, res, next) => {
       const key = req.originalUrl;
       const cached = cache.get(key);
       
       if (cached) {
         return res.json(cached);
       }
       
       res.sendResponse = res.json;
       res.json = (body) => {
         cache.put(key, body, duration * 1000);
         res.sendResponse(body);
       };
       
       next();
     };
   };
   ```

2. **Optimize database queries:**
   ```javascript
   // Add indexes
   userSchema.index({ email: 1 }, { unique: true });
   studentSchema.index({ studentId: 1 }, { unique: true });
   enrollmentSchema.index({ student: 1, semester: 1 });
   
   // Use lean queries
   const students = await Student.find().lean();
   
   // Implement pagination
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 20;
   const skip = (page - 1) * limit;
   
   const results = await Model.find()
     .skip(skip)
     .limit(limit)
     .sort({ createdAt: -1 });
   ```

3. **Use compression:**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

### Issue: "Memory leaks"

**Solutions:**

1. **Monitor memory usage:**
   ```javascript
   // Add memory monitoring
   setInterval(() => {
     const used = process.memoryUsage();
     console.log('Memory usage:', {
       rss: Math.round(used.rss / 1024 / 1024) + ' MB',
       heapTotal: Math.round(used.heapTotal / 1024 / 1024) + ' MB',
       heapUsed: Math.round(used.heapUsed / 1024 / 1024) + ' MB'
     });
   }, 30000);
   ```

2. **Close database connections:**
   ```javascript
   // Properly close connections
   process.on('SIGINT', () => {
     mongoose.connection.close();
     process.exit(0);
   });
   ```

## SSL and Domain Issues

### Issue: "SSL certificate not working"

**Solutions:**

1. **Wait for propagation:**
   - SSL certificates can take up to 24 hours to propagate
   - Check status in Render dashboard

2. **Verify DNS configuration:**
   ```bash
   # Check DNS records
   nslookup your-domain.com
   dig your-domain.com CNAME
   ```

3. **Force HTTPS redirect:**
   ```javascript
   // middleware/security.js
   app.use((req, res, next) => {
     if (req.header('x-forwarded-proto') !== 'https') {
       res.redirect(`https://${req.header('host')}${req.url}`);
     } else {
       next();
     }
   });
   ```

## Worker Process Issues

### Issue: "Background jobs not processing"

**Solutions:**

1. **Check worker health:**
   ```bash
   # Test worker health endpoint
   curl https://your-worker.onrender.com/health
   ```

2. **Monitor Redis connection:**
   ```javascript
   // workers/base.js
   redis.on('connect', () => {
     console.log('Redis connected');
   });

   redis.on('error', (err) => {
     console.error('Redis error:', err);
   });
   ```

3. **Add error handling:**
   ```javascript
   // Process jobs with error handling
   const processJob = async (job) => {
     try {
       await handleJob(job);
       console.log('Job completed:', job.id);
     } catch (error) {
       console.error('Job failed:', job.id, error.message);
       // Optionally retry or move to failed queue
     }
   };
   ```

## Debugging Tools

### 1. View Logs

**Render Dashboard:**
- Go to your service
- Click "Logs" tab
- Filter by severity/time

**Command line (if using Render CLI):**
```bash
render logs --service=your-service-name --follow
```

### 2. Environment Variables Check

```javascript
// Temporary debugging route
app.get('/debug/config', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    mongoConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});
```

### 3. Database Connection Test

```javascript
app.get('/debug/db', async (req, res) => {
  try {
    const result = await mongoose.connection.db.admin().ping();
    res.json({ 
      status: 'connected', 
      result,
      readyState: mongoose.connection.readyState 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});
```

### 4. Health Check Endpoint

```javascript
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    memory: process.memoryUsage(),
    connections: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    }
  };

  // Check external services
  try {
    await mongoose.connection.db.admin().ping();
    health.connections.database = 'healthy';
  } catch (error) {
    health.connections.database = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

## Getting Help

### 1. Render Support

- **Community Forum:** https://community.render.com
- **Documentation:** https://render.com/docs
- **Status Page:** https://status.render.com

### 2. Project Support

- **GitHub Issues:** Create detailed issue reports
- **Documentation:** Check project README and docs
- **Logs:** Always include relevant log excerpts

### 3. Useful Resources

- **MongoDB Atlas Status:** https://status.cloud.mongodb.com
- **Node.js Documentation:** https://nodejs.org/docs
- **Express.js Guide:** https://expressjs.com/guide

## Emergency Recovery

### If your service is completely down:

1. **Check Render status page**
2. **Review recent deployments** in dashboard
3. **Rollback to previous version** if needed
4. **Check environment variables** for changes
5. **Verify external service status** (MongoDB, etc.)

### Quick fixes:

```bash
# Force redeploy
git commit --allow-empty -m "Force redeploy"
git push origin main

# Reset to working state
git revert HEAD~1
git push origin main
```

---

**Remember:** Always test changes in a staging environment before deploying to production. Keep your dependencies updated and monitor your application's health regularly.

For immediate assistance, check the Render community forum or create a support ticket with detailed error logs and steps to reproduce the issue.