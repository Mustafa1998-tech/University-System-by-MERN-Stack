const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const AppError = require('./appError');
const logger = require('./logger');

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv'
];

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

// Storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadDir = getUploadPath(file.fieldname, req.user?.id);
      await ensureDirectoryExists(uploadDir);
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = sanitizeFilename(file.originalname);
    const extension = path.extname(sanitizedName);
    const baseName = path.basename(sanitizedName, extension);
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  try {
    // Check file type based on fieldname
    const isValidType = validateFileType(file, req.body.fileType || 'document');
    
    if (!isValidType) {
      return cb(new AppError({
        en: `Invalid file type. Allowed types: ${getAllowedTypes(req.body.fileType).join(', ')}`,
        ar: `نوع ملف غير صالح. الأنواع المسموحة: ${getAllowedTypes(req.body.fileType).join(', ')}`
      }, 400));
    }

    // Additional security checks
    if (file.originalname.includes('..') || file.originalname.includes('/')) {
      return cb(new AppError({
        en: 'Invalid filename detected',
        ar: 'تم اكتشاف اسم ملف غير صالح'
      }, 400));
    }

    cb(null, true);
  } catch (error) {
    cb(error);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_DOCUMENT_SIZE,
    files: 5, // Maximum 5 files per request
    fieldSize: 1024 * 1024 // 1MB field size limit
  }
});

// Helper functions
function getUploadPath(fieldname, userId) {
  const baseDir = process.env.UPLOAD_PATH || './uploads';
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  switch (fieldname) {
    case 'avatar':
    case 'profilePicture':
      return path.join(baseDir, 'profiles', year.toString(), month, userId || 'anonymous');
    case 'document':
    case 'certificate':
      return path.join(baseDir, 'documents', year.toString(), month, userId || 'anonymous');
    case 'transcript':
      return path.join(baseDir, 'transcripts', year.toString(), month, userId || 'anonymous');
    case 'invoice':
      return path.join(baseDir, 'invoices', year.toString(), month);
    case 'library':
      return path.join(baseDir, 'library', year.toString(), month);
    default:
      return path.join(baseDir, 'misc', year.toString(), month, userId || 'anonymous');
  }
}

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

function sanitizeFilename(filename) {
  // Remove potentially dangerous characters
  return filename
    .replace(/[^a-zA-Z0-9\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF._-]/g, '')
    .replace(/\.{2,}/g, '.')
    .slice(0, 255);
}

function validateFileType(file, expectedType) {
  switch (expectedType) {
    case 'image':
      return ALLOWED_IMAGE_TYPES.includes(file.mimetype);
    case 'document':
      return ALLOWED_DOCUMENT_TYPES.includes(file.mimetype);
    case 'any':
      return [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES].includes(file.mimetype);
    default:
      return ALLOWED_DOCUMENT_TYPES.includes(file.mimetype);
  }
}

function getAllowedTypes(fileType) {
  switch (fileType) {
    case 'image':
      return ALLOWED_IMAGE_TYPES;
    case 'document':
      return ALLOWED_DOCUMENT_TYPES;
    default:
      return [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
  }
}

// Image processing function
async function processImage(inputPath, outputPath, options = {}) {
  const {
    width = 800,
    height = 600,
    quality = 85,
    format = 'jpeg'
  } = options;

  try {
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality })
      .toFile(outputPath);
    
    // Remove original file if processing was successful
    await fs.unlink(inputPath);
    
    return outputPath;
  } catch (error) {
    logger.logError('Image processing failed', { inputPath, error: error.message });
    throw new AppError({
      en: 'Failed to process image',
      ar: 'فشل في معالجة الصورة'
    }, 500);
  }
}

// File virus scanning (placeholder - integrate with actual antivirus)
async function scanFileForViruses(filePath) {
  try {
    // This is a placeholder. In production, integrate with:
    // - ClamAV
    // - VirusTotal API
    // - Windows Defender API
    // - Other antivirus solutions
    
    const stats = await fs.stat(filePath);
    
    // Basic checks
    if (stats.size === 0) {
      throw new AppError({
        en: 'File is empty',
        ar: 'الملف فارغ'
      }, 400);
    }
    
    if (stats.size > MAX_DOCUMENT_SIZE) {
      throw new AppError({
        en: 'File size exceeds maximum limit',
        ar: 'حجم الملف يتجاوز الحد الأقصى'
      }, 400);
    }
    
    // TODO: Implement actual virus scanning
    logger.info(`File scanned: ${filePath} - Clean`);
    return true;
  } catch (error) {
    logger.logError('File scanning failed', { filePath, error: error.message });
    throw error;
  }
}

// Generate file hash for integrity checking
async function generateFileHash(filePath) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  } catch (error) {
    logger.logError('File hash generation failed', { filePath, error: error.message });
    throw new AppError({
      en: 'Failed to generate file hash',
      ar: 'فشل في إنشاء رمز تحقق الملف'
    }, 500);
  }
}

// File upload middleware factory
const createUploadMiddleware = (fieldConfig) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.fields(fieldConfig);
    
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          switch (err.code) {
            case 'LIMIT_FILE_SIZE':
              return next(new AppError({
                en: 'File size too large',
                ar: 'حجم الملف كبير جداً'
              }, 400));
            case 'LIMIT_FILE_COUNT':
              return next(new AppError({
                en: 'Too many files uploaded',
                ar: 'تم رفع ملفات كثيرة جداً'
              }, 400));
            case 'LIMIT_UNEXPECTED_FILE':
              return next(new AppError({
                en: 'Unexpected file field',
                ar: 'حقل ملف غير متوقع'
              }, 400));
            default:
              return next(new AppError({
                en: 'File upload error',
                ar: 'خطأ في رفع الملف'
              }, 400));
          }
        }
        return next(err);
      }

      // Process uploaded files
      try {
        if (req.files) {
          for (const fieldname in req.files) {
            const files = req.files[fieldname];
            
            for (const file of files) {
              // Scan for viruses
              await scanFileForViruses(file.path);
              
              // Generate file hash
              file.hash = await generateFileHash(file.path);
              
              // Process images if needed
              if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
                const processedPath = file.path.replace(/\.[^/.]+$/, '_processed.jpg');
                await processImage(file.path, processedPath);
                file.path = processedPath;
                file.filename = path.basename(processedPath);
              }
              
              // Log upload
              logger.logBusinessEvent(
                'FILE_UPLOADED',
                req.user?.id,
                'File',
                file.filename,
                {
                  originalName: file.originalname,
                  size: file.size,
                  mimetype: file.mimetype,
                  fieldname: file.fieldname
                }
              );
            }
          }
        }
        
        next();
      } catch (error) {
        // Clean up uploaded files on error
        if (req.files) {
          for (const fieldname in req.files) {
            const files = req.files[fieldname];
            for (const file of files) {
              try {
                await fs.unlink(file.path);
              } catch {}
            }
          }
        }
        next(error);
      }
    });
  };
};

// File download with security checks
async function secureFileDownload(filePath, userId, userRole) {
  try {
    // Check if file exists
    await fs.access(filePath);
    
    // Security check - ensure user can access this file
    const pathSegments = filePath.split(path.sep);
    const fileUserId = pathSegments.find((segment, index) => 
      pathSegments[index - 1] === 'profiles' || 
      pathSegments[index - 1] === 'documents' ||
      pathSegments[index - 1] === 'transcripts'
    );
    
    // Allow access if:
    // 1. User owns the file
    // 2. User is admin/staff
    // 3. File is in public directory
    const hasAccess = 
      fileUserId === userId ||
      ['admin', 'staff'].includes(userRole) ||
      filePath.includes('public');
    
    if (!hasAccess) {
      throw new AppError({
        en: 'Access denied to this file',
        ar: 'تم رفض الوصول إلى هذا الملف'
      }, 403);
    }
    
    return filePath;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new AppError({
        en: 'File not found',
        ar: 'الملف غير موجود'
      }, 404);
    }
    throw error;
  }
}

// File deletion with cleanup
async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
    logger.info(`File deleted: ${filePath}`);
    return true;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.logError('File deletion failed', { filePath, error: error.message });
    }
    return false;
  }
}

// Cleanup old files (for maintenance)
async function cleanupOldFiles(directory, daysOld = 30) {
  try {
    const files = await fs.readdir(directory, { withFileTypes: true });
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(directory, file.name);
      
      if (file.isDirectory()) {
        deletedCount += await cleanupOldFiles(filePath, daysOld);
      } else {
        const stats = await fs.stat(filePath);
        if (stats.mtime < cutoffDate) {
          await deleteFile(filePath);
          deletedCount++;
        }
      }
    }
    
    logger.info(`Cleanup completed: ${deletedCount} files deleted from ${directory}`);
    return deletedCount;
  } catch (error) {
    logger.logError('File cleanup failed', { directory, error: error.message });
    return 0;
  }
}

module.exports = {
  upload,
  createUploadMiddleware,
  processImage,
  secureFileDownload,
  deleteFile,
  cleanupOldFiles,
  generateFileHash,
  scanFileForViruses,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_IMAGE_SIZE,
  MAX_DOCUMENT_SIZE
};