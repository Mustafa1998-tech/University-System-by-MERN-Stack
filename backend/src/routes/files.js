const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { protect, restrictTo } = require('../middleware/auth');
const { createUploadMiddleware, secureFileDownload, deleteFile } = require('../utils/fileUpload');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { formatResponse } = require('../middleware/i18n');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

/**
 * @swagger
 * components:
 *   schemas:
 *     FileUpload:
 *       type: object
 *       properties:
 *         filename:
 *           type: string
 *         originalName:
 *           type: string
 *         size:
 *           type: integer
 *         mimetype:
 *           type: string
 *         path:
 *           type: string
 *         hash:
 *           type: string
 */

/**
 * @swagger
 * /files/upload/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: Invalid file or upload error
 */
router.post('/upload/avatar', 
  createUploadMiddleware([{ name: 'avatar', maxCount: 1 }]),
  catchAsync(async (req, res, next) => {
    if (!req.files || !req.files.avatar) {
      return next(new AppError({
        en: 'No avatar file provided',
        ar: 'لم يتم توفير ملف الصورة الشخصية'
      }, 400));
    }

    const file = req.files.avatar[0];
    
    // Update user's avatar path in database
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, {
      avatar: `/api/v1/files/download/${encodeURIComponent(file.filename)}`
    });

    res.status(200).json(formatResponse(
      req,
      'success',
      'Avatar uploaded successfully',
      {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        url: `/api/v1/files/download/${encodeURIComponent(file.filename)}`
      }
    ));
  })
);

/**
 * @swagger
 * /files/upload/document:
 *   post:
 *     summary: Upload document
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *               documentType:
 *                 type: string
 *                 enum: [transcript, certificate, id_copy, medical_record, other]
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 */
router.post('/upload/document',
  createUploadMiddleware([{ name: 'document', maxCount: 5 }]),
  catchAsync(async (req, res, next) => {
    if (!req.files || !req.files.document) {
      return next(new AppError({
        en: 'No document files provided',
        ar: 'لم يتم توفير ملفات المستند'
      }, 400));
    }

    const uploadedFiles = req.files.document.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
      hash: file.hash,
      type: req.body.documentType || 'other',
      description: req.body.description || '',
      uploadedAt: new Date(),
      uploadedBy: req.user.id
    }));

    res.status(200).json(formatResponse(
      req,
      'success',
      'Documents uploaded successfully',
      { files: uploadedFiles }
    ));
  })
);

/**
 * @swagger
 * /files/upload/bulk:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 */
router.post('/upload/bulk',
  restrictTo('admin', 'staff'),
  createUploadMiddleware([
    { name: 'documents', maxCount: 10 },
    { name: 'images', maxCount: 10 }
  ]),
  catchAsync(async (req, res, next) => {
    const uploadedFiles = [];

    if (req.files.documents) {
      uploadedFiles.push(...req.files.documents.map(file => ({
        ...file,
        category: 'document'
      })));
    }

    if (req.files.images) {
      uploadedFiles.push(...req.files.images.map(file => ({
        ...file,
        category: 'image'
      })));
    }

    if (uploadedFiles.length === 0) {
      return next(new AppError({
        en: 'No files provided',
        ar: 'لم يتم توفير ملفات'
      }, 400));
    }

    res.status(200).json(formatResponse(
      req,
      'success',
      'Files uploaded successfully',
      { 
        files: uploadedFiles,
        totalCount: uploadedFiles.length
      }
    ));
  })
);

/**
 * @swagger
 * /files/download/{filename}:
 *   get:
 *     summary: Download file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *       404:
 *         description: File not found
 *       403:
 *         description: Access denied
 */
router.get('/download/:filename',
  catchAsync(async (req, res, next) => {
    const { filename } = req.params;
    
    // Find file in upload directories
    const uploadDirs = [
      'profiles', 'documents', 'transcripts', 'certificates', 
      'invoices', 'library', 'misc'
    ];
    
    let filePath = null;
    const baseDir = process.env.UPLOAD_PATH || './uploads';
    
    for (const dir of uploadDirs) {
      const searchPath = path.join(baseDir, dir);
      
      try {
        // Search recursively for the file
        const found = await findFileRecursive(searchPath, filename);
        if (found) {
          filePath = found;
          break;
        }
      } catch (error) {
        // Directory might not exist, continue searching
        continue;
      }
    }

    if (!filePath) {
      return next(new AppError({
        en: 'File not found',
        ar: 'الملف غير موجود'
      }, 404));
    }

    // Security check
    await secureFileDownload(filePath, req.user.id, req.user.role);

    // Set appropriate headers
    const stat = await fs.stat(filePath);
    const ext = path.extname(filename).toLowerCase();
    
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    };

    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');

    // Stream file to response
    const fileStream = require('fs').createReadStream(filePath);
    fileStream.pipe(res);

    // Log download
    logger.logBusinessEvent(
      'FILE_DOWNLOADED',
      req.user.id,
      'File',
      filename,
      { filePath, fileSize: stat.size }
    );
  })
);

/**
 * @swagger
 * /files/preview/{filename}:
 *   get:
 *     summary: Preview file (for images and PDFs)
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File preview
 */
router.get('/preview/:filename',
  catchAsync(async (req, res, next) => {
    const { filename } = req.params;
    
    // Similar to download but with preview headers
    const baseDir = process.env.UPLOAD_PATH || './uploads';
    const uploadDirs = ['profiles', 'documents', 'transcripts', 'certificates'];
    
    let filePath = null;
    
    for (const dir of uploadDirs) {
      const searchPath = path.join(baseDir, dir);
      try {
        const found = await findFileRecursive(searchPath, filename);
        if (found) {
          filePath = found;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!filePath) {
      return next(new AppError({
        en: 'File not found',
        ar: 'الملف غير موجود'
      }, 404));
    }

    // Security check
    await secureFileDownload(filePath, req.user.id, req.user.role);

    const ext = path.extname(filename).toLowerCase();
    
    // Only allow preview for images and PDFs
    if (!['.jpg', '.jpeg', '.png', '.pdf'].includes(ext)) {
      return next(new AppError({
        en: 'File type not supported for preview',
        ar: 'نوع الملف غير مدعوم للمعاينة'
      }, 400));
    }

    const stat = await fs.stat(filePath);
    const mimeType = ext === '.pdf' ? 'application/pdf' : `image/${ext.slice(1)}`;

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const fileStream = require('fs').createReadStream(filePath);
    fileStream.pipe(res);
  })
);

/**
 * @swagger
 * /files/delete/{filename}:
 *   delete:
 *     summary: Delete file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 */
router.delete('/delete/:filename',
  catchAsync(async (req, res, next) => {
    const { filename } = req.params;
    
    // Find and delete file
    const baseDir = process.env.UPLOAD_PATH || './uploads';
    const uploadDirs = ['profiles', 'documents', 'transcripts', 'certificates'];
    
    let filePath = null;
    
    for (const dir of uploadDirs) {
      const searchPath = path.join(baseDir, dir);
      try {
        const found = await findFileRecursive(searchPath, filename);
        if (found) {
          filePath = found;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!filePath) {
      return next(new AppError({
        en: 'File not found',
        ar: 'الملف غير موجود'
      }, 404));
    }

    // Security check - only allow deletion of own files or by admin/staff
    await secureFileDownload(filePath, req.user.id, req.user.role);

    // Delete the file
    const deleted = await deleteFile(filePath);
    
    if (!deleted) {
      return next(new AppError({
        en: 'Failed to delete file',
        ar: 'فشل في حذف الملف'
      }, 500));
    }

    // Log deletion
    logger.logBusinessEvent(
      'FILE_DELETED',
      req.user.id,
      'File',
      filename,
      { filePath }
    );

    res.status(200).json(formatResponse(
      req,
      'success',
      'File deleted successfully'
    ));
  })
);

/**
 * @swagger
 * /files/list:
 *   get:
 *     summary: List user's files
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [image, document, all]
 *         description: Filter by file type
 *     responses:
 *       200:
 *         description: Files listed successfully
 */
router.get('/list',
  catchAsync(async (req, res, next) => {
    const { type = 'all' } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let searchDirs = [];
    
    if (['admin', 'staff'].includes(userRole)) {
      // Admin and staff can see all files
      searchDirs = ['profiles', 'documents', 'transcripts', 'certificates', 'library'];
    } else {
      // Regular users can only see their own files
      searchDirs = ['profiles', 'documents', 'transcripts'];
    }
    
    const files = [];
    const baseDir = process.env.UPLOAD_PATH || './uploads';
    
    for (const dir of searchDirs) {
      const dirPath = path.join(baseDir, dir);
      try {
        const userFiles = await getUserFiles(dirPath, userId, type, userRole);
        files.push(...userFiles);
      } catch (error) {
        // Directory might not exist
        continue;
      }
    }

    res.status(200).json(formatResponse(
      req,
      'success',
      'Files retrieved successfully',
      { 
        files,
        total: files.length,
        filter: type
      }
    ));
  })
);

// Helper functions
async function findFileRecursive(dir, filename) {
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        const found = await findFileRecursive(fullPath, filename);
        if (found) return found;
      } else if (item.name === filename) {
        return fullPath;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

async function getUserFiles(dir, userId, type, userRole) {
  const files = [];
  
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        // Check if this directory belongs to the user or if user is admin/staff
        if (item.name === userId || ['admin', 'staff'].includes(userRole)) {
          const subFiles = await getUserFiles(fullPath, userId, type, userRole);
          files.push(...subFiles);
        }
      } else {
        // Filter by file type if specified
        if (type !== 'all') {
          const ext = path.extname(item.name).toLowerCase();
          const isImage = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
          const isDocument = ['.pdf', '.doc', '.docx', '.txt'].includes(ext);
          
          if (type === 'image' && !isImage) continue;
          if (type === 'document' && !isDocument) continue;
        }
        
        const stats = await fs.stat(fullPath);
        
        files.push({
          filename: item.name,
          path: fullPath,
          size: stats.size,
          uploadedAt: stats.mtime,
          url: `/api/v1/files/download/${encodeURIComponent(item.name)}`,
          previewUrl: `/api/v1/files/preview/${encodeURIComponent(item.name)}`
        });
      }
    }
  } catch (error) {
    // Handle directory access errors
  }
  
  return files;
}

module.exports = router;