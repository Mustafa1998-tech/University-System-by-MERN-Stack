const mongoose = require('mongoose');
const Redis = require('ioredis');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const PDFDocument = require('pdfkit');
const archiver = require('archiver');
require('dotenv').config();

// Import models
require('../models/User');
require('../models/Student');
require('../models/Certificate');

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

class FileWorker {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.isProcessing = false;
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.tempDir = path.join(__dirname, '../../temp');
    
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

      // Ensure directories exist
      await this.ensureDirectories();

      // Start processing
      this.startProcessing();
      
    } catch (error) {
      logger.error('Failed to initialize file worker:', error);
      process.exit(1);
    }
  }

  async ensureDirectories() {
    const dirs = [this.uploadDir, this.tempDir];
    
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
        logger.info(`Directory ensured: ${dir}`);
      } catch (error) {
        logger.error(`Failed to create directory ${dir}:`, error);
      }
    }
  }

  async startProcessing() {
    logger.info('File worker started');
    this.isProcessing = true;

    while (this.isProcessing) {
      try {
        // Process image optimization queue
        await this.processImageQueue();
        
        // Process PDF generation queue
        await this.processPDFQueue();
        
        // Process file cleanup queue
        await this.processCleanupQueue();
        
        // Wait before next iteration
        await this.sleep(3000); // 3 seconds
        
      } catch (error) {
        logger.error('Error in file processing loop:', error);
        await this.sleep(10000); // Wait 10 seconds on error
      }
    }
  }

  async processImageQueue() {
    try {
      const imageJob = await this.redis.blpop('image_queue', 1);
      if (!imageJob) return;

      const jobData = JSON.parse(imageJob[1]);
      await this.processImage(jobData);
      
    } catch (error) {
      logger.error('Error processing image queue:', error);
    }
  }

  async processPDFQueue() {
    try {
      const pdfJob = await this.redis.blpop('pdf_queue', 1);
      if (!pdfJob) return;

      const jobData = JSON.parse(pdfJob[1]);
      await this.generatePDF(jobData);
      
    } catch (error) {
      logger.error('Error processing PDF queue:', error);
    }
  }

  async processCleanupQueue() {
    try {
      const cleanupJob = await this.redis.blpop('cleanup_queue', 1);
      if (!cleanupJob) return;

      const jobData = JSON.parse(cleanupJob[1]);
      await this.cleanupFiles(jobData);
      
    } catch (error) {
      logger.error('Error processing cleanup queue:', error);
    }
  }

  async processImage(jobData) {
    try {
      const { inputPath, outputPath, options = {} } = jobData;
      
      const {
        width = 800,
        height = 600,
        quality = 80,
        format = 'jpeg',
        resize = true
      } = options;

      let sharpInstance = sharp(inputPath);

      if (resize) {
        sharpInstance = sharpInstance.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Optimize based on format
      switch (format.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          sharpInstance = sharpInstance.jpeg({ quality });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality });
          break;
      }

      await sharpInstance.toFile(outputPath);
      
      logger.info(`Image processed successfully: ${inputPath} -> ${outputPath}`);

      // Update database if needed
      if (jobData.recordId && jobData.modelName) {
        await this.updateFileRecord(jobData.modelName, jobData.recordId, {
          processedPath: outputPath,
          status: 'processed'
        });
      }

    } catch (error) {
      logger.error(`Failed to process image ${jobData.inputPath}:`, error);
      
      // Update record as failed
      if (jobData.recordId && jobData.modelName) {
        await this.updateFileRecord(jobData.modelName, jobData.recordId, {
          status: 'failed',
          errorMessage: error.message
        });
      }
    }
  }

  async generatePDF(jobData) {
    try {
      const { type, data, outputPath } = jobData;
      
      let pdfContent;
      
      switch (type) {
        case 'transcript':
          pdfContent = await this.generateTranscriptPDF(data);
          break;
        case 'certificate':
          pdfContent = await this.generateCertificatePDF(data);
          break;
        case 'report':
          pdfContent = await this.generateReportPDF(data);
          break;
        default:
          throw new Error(`Unknown PDF type: ${type}`);
      }

      // Save PDF to file
      await fs.writeFile(outputPath, pdfContent);
      
      logger.info(`PDF generated successfully: ${type} -> ${outputPath}`);

      // Update database record
      if (jobData.recordId && jobData.modelName) {
        await this.updateFileRecord(jobData.modelName, jobData.recordId, {
          filePath: outputPath,
          status: 'completed',
          generatedAt: new Date()
        });
      }

    } catch (error) {
      logger.error(`Failed to generate PDF ${jobData.type}:`, error);
      
      // Update record as failed
      if (jobData.recordId && jobData.modelName) {
        await this.updateFileRecord(jobData.modelName, jobData.recordId, {
          status: 'failed',
          errorMessage: error.message
        });
      }
    }
  }

  async generateTranscriptPDF(data) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Header
        doc.fontSize(20).text('Academic Transcript', { align: 'center' });
        doc.moveDown();

        // Student info
        doc.fontSize(12);
        doc.text(`Student Name: ${data.studentName}`);
        doc.text(`Student ID: ${data.studentId}`);
        doc.text(`Department: ${data.department}`);
        doc.moveDown();

        // Courses table
        doc.text('Course History:', { underline: true });
        doc.moveDown(0.5);

        data.courses.forEach(course => {
          doc.text(`${course.code} - ${course.title}: ${course.grade} (${course.credits} credits)`);
        });

        doc.moveDown();
        doc.text(`Total Credits: ${data.totalCredits}`);
        doc.text(`GPA: ${data.gpa}`);

        doc.end();
        
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateCertificatePDF(data) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          layout: 'landscape',
          margin: 50 
        });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Certificate design
        doc.fontSize(24).text('Certificate of Completion', 150, 100, { align: 'center' });
        doc.moveDown(2);

        doc.fontSize(16).text('This is to certify that', { align: 'center' });
        doc.moveDown();

        doc.fontSize(20).text(data.studentName, { align: 'center', underline: true });
        doc.moveDown();

        doc.fontSize(16).text(`has successfully completed the course`, { align: 'center' });
        doc.moveDown();

        doc.fontSize(18).text(data.courseName, { align: 'center', underline: true });
        doc.moveDown(2);

        doc.fontSize(12).text(`Date: ${data.completionDate}`, { align: 'center' });
        doc.text(`Grade: ${data.grade}`, { align: 'center' });

        doc.end();
        
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateReportPDF(data) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Report header
        doc.fontSize(18).text(data.title || 'Report', { align: 'center' });
        doc.moveDown();

        // Report content
        if (data.sections) {
          data.sections.forEach(section => {
            doc.fontSize(14).text(section.title, { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).text(section.content);
            doc.moveDown();
          });
        }

        // Footer
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, {
          align: 'center'
        });

        doc.end();
        
      } catch (error) {
        reject(error);
      }
    });
  }

  async cleanupFiles(jobData) {
    try {
      const { files, olderThanHours = 24 } = jobData;
      const cutoffTime = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000));

      let deletedCount = 0;

      for (const filePath of files) {
        try {
          const stats = await fs.stat(filePath);
          
          if (stats.mtime < cutoffTime) {
            await fs.unlink(filePath);
            deletedCount++;
            logger.info(`Deleted old file: ${filePath}`);
          }
        } catch (error) {
          // File might not exist, skip
          if (error.code !== 'ENOENT') {
            logger.warn(`Failed to delete file ${filePath}:`, error.message);
          }
        }
      }

      logger.info(`Cleanup completed: ${deletedCount} files deleted`);

    } catch (error) {
      logger.error('Failed to cleanup files:', error);
    }
  }

  async updateFileRecord(modelName, recordId, updateData) {
    try {
      const Model = mongoose.model(modelName);
      await Model.findByIdAndUpdate(recordId, updateData);
      logger.info(`Updated ${modelName} record ${recordId}`);
      
    } catch (error) {
      logger.error(`Failed to update ${modelName} record:`, error);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async shutdown() {
    logger.info('Shutting down file worker...');
    this.isProcessing = false;
    
    if (this.redis) {
      await this.redis.disconnect();
    }
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    
    logger.info('File worker shut down gracefully');
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
const worker = new FileWorker();

// Health check endpoint for worker monitoring
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    worker: 'file',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    processing: worker.isProcessing
  });
});

const port = process.env.WORKER_PORT || 3002;
app.listen(port, () => {
  logger.info(`File worker health check listening on port ${port}`);
});

module.exports = FileWorker;