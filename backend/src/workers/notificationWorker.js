const mongoose = require('mongoose');
const Redis = require('ioredis');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
require('dotenv').config();

// Import models
require('../models/User');
require('../models/Notification');

// Logger setup
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

class NotificationWorker {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.emailTransporter = null;
    this.twilioClient = null;
    this.isProcessing = false;
    
    this.initializeServices();
  }

  async initializeServices() {
    try {
      // Connect to MongoDB
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      logger.info('Connected to MongoDB');

      // Initialize email service
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        this.emailTransporter = nodemailer.createTransporter({
          service: process.env.EMAIL_SERVICE || 'gmail',
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        logger.info('Email service initialized');
      }

      // Initialize SMS service
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        this.twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        logger.info('SMS service initialized');
      }

      // Start processing
      this.startProcessing();
      
    } catch (error) {
      logger.error('Failed to initialize services:', error);
      process.exit(1);
    }
  }

  async startProcessing() {
    logger.info('Notification worker started');
    this.isProcessing = true;

    while (this.isProcessing) {
      try {
        // Process email queue
        await this.processEmailQueue();
        
        // Process SMS queue
        await this.processSMSQueue();
        
        // Wait before next iteration
        await this.sleep(5000); // 5 seconds
        
      } catch (error) {
        logger.error('Error in processing loop:', error);
        await this.sleep(10000); // Wait 10 seconds on error
      }
    }
  }

  async processEmailQueue() {
    try {
      const emailJob = await this.redis.blpop('email_queue', 1);
      if (!emailJob) return;

      const jobData = JSON.parse(emailJob[1]);
      await this.sendEmail(jobData);
      
    } catch (error) {
      logger.error('Error processing email queue:', error);
    }
  }

  async processSMSQueue() {
    try {
      const smsJob = await this.redis.blpop('sms_queue', 1);
      if (!smsJob) return;

      const jobData = JSON.parse(smsJob[1]);
      await this.sendSMS(jobData);
      
    } catch (error) {
      logger.error('Error processing SMS queue:', error);
    }
  }

  async sendEmail(jobData) {
    if (!this.emailTransporter) {
      logger.warn('Email service not configured, skipping email job');
      return;
    }

    try {
      const { to, subject, text, html, attachments } = jobData;
      
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'SIS'}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
        attachments: attachments || []
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}:`, result.messageId);

      // Update notification status in database
      if (jobData.notificationId) {
        await this.updateNotificationStatus(jobData.notificationId, 'sent');
      }

    } catch (error) {
      logger.error(`Failed to send email to ${jobData.to}:`, error);
      
      // Update notification status as failed
      if (jobData.notificationId) {
        await this.updateNotificationStatus(jobData.notificationId, 'failed', error.message);
      }
    }
  }

  async sendSMS(jobData) {
    if (!this.twilioClient) {
      logger.warn('SMS service not configured, skipping SMS job');
      return;
    }

    try {
      const { to, message } = jobData;
      
      const result = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
      });

      logger.info(`SMS sent successfully to ${to}:`, result.sid);

      // Update notification status in database
      if (jobData.notificationId) {
        await this.updateNotificationStatus(jobData.notificationId, 'sent');
      }

    } catch (error) {
      logger.error(`Failed to send SMS to ${jobData.to}:`, error);
      
      // Update notification status as failed
      if (jobData.notificationId) {
        await this.updateNotificationStatus(jobData.notificationId, 'failed', error.message);
      }
    }
  }

  async updateNotificationStatus(notificationId, status, errorMessage = null) {
    try {
      const Notification = mongoose.model('Notification');
      const updateData = { 
        status,
        sentAt: status === 'sent' ? new Date() : undefined,
        errorMessage: status === 'failed' ? errorMessage : undefined
      };

      await Notification.findByIdAndUpdate(notificationId, updateData);
      logger.info(`Updated notification ${notificationId} status to ${status}`);
      
    } catch (error) {
      logger.error(`Failed to update notification status:`, error);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async shutdown() {
    logger.info('Shutting down notification worker...');
    this.isProcessing = false;
    
    if (this.redis) {
      await this.redis.disconnect();
    }
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    
    logger.info('Notification worker shut down gracefully');
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  if (worker) {
    await worker.shutdown();
  }
});

process.on('SIGINT', async () => {
  if (worker) {
    await worker.shutdown();
  }
});

// Start worker
const worker = new NotificationWorker();

// Health check endpoint for worker monitoring
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    worker: 'notification',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    processing: worker.isProcessing
  });
});

const port = process.env.WORKER_PORT || 3001;
app.listen(port, () => {
  logger.info(`Notification worker health check listening on port ${port}`);
});

module.exports = NotificationWorker;