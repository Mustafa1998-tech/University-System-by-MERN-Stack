const express = require('express');
const certificateController = require('../controllers/certificateController');
const authMiddleware = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation middleware
const validateStudentId = [
  param('studentId')
    .isMongoId()
    .withMessage('Invalid student ID format'),
  validate
];

const validateVerificationCode = [
  param('verificationCode')
    .isLength({ min: 32, max: 32 })
    .withMessage('Invalid verification code format'),
  validate
];

const validateLanguage = [
  query('language')
    .optional()
    .isIn(['en', 'ar'])
    .withMessage('Language must be either en or ar'),
  validate
];

const validateFormat = [
  query('format')
    .optional()
    .isIn(['pdf', 'buffer'])
    .withMessage('Format must be either pdf or buffer'),
  validate
];

const validateReportType = [
  query('reportType')
    .optional()
    .isIn(['summary', 'detailed'])
    .withMessage('Report type must be either summary or detailed'),
  validate
];

// Apply authentication to all routes
router.use(authMiddleware.protect);

/**
 * @swagger
 * /api/v1/certificates/graduation/{studentId}:
 *   get:
 *     summary: Generate graduation certificate
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [en, ar]
 *           default: en
 *         description: Certificate language
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, buffer]
 *           default: pdf
 *         description: Response format
 *     responses:
 *       200:
 *         description: Graduation certificate generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     pdf:
 *                       type: string
 *                       description: Base64 encoded PDF
 *                     verificationCode:
 *                       type: string
 *       400:
 *         description: Student has not graduated yet
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Student not found
 */
router.get(
  '/graduation/:studentId',
  validateStudentId,
  validateLanguage,
  validateFormat,
  certificateController.generateGraduationCertificate
);

/**
 * @swagger
 * /api/v1/certificates/transcript/{studentId}:
 *   get:
 *     summary: Generate academic transcript
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [en, ar]
 *           default: en
 *         description: Transcript language
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, buffer]
 *           default: pdf
 *         description: Response format
 *     responses:
 *       200:
 *         description: Transcript generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     pdf:
 *                       type: string
 *                       description: Base64 encoded PDF
 *                     verificationCode:
 *                       type: string
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Student not found
 */
router.get(
  '/transcript/:studentId',
  validateStudentId,
  validateLanguage,
  validateFormat,
  certificateController.generateTranscript
);

/**
 * @swagger
 * /api/v1/certificates/enrollment/{studentId}:
 *   get:
 *     summary: Generate enrollment certificate
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [en, ar]
 *           default: en
 *         description: Certificate language
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, buffer]
 *           default: pdf
 *         description: Response format
 *     responses:
 *       200:
 *         description: Enrollment certificate generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     pdf:
 *                       type: string
 *                       description: Base64 encoded PDF
 *                     verificationCode:
 *                       type: string
 *       400:
 *         description: Student is not currently enrolled
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Student not found
 */
router.get(
  '/enrollment/:studentId',
  validateStudentId,
  validateLanguage,
  validateFormat,
  certificateController.generateEnrollmentCertificate
);

/**
 * @swagger
 * /api/v1/certificates/financial/{studentId}:
 *   get:
 *     summary: Generate financial report
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [en, ar]
 *           default: en
 *         description: Report language
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, buffer]
 *           default: pdf
 *         description: Response format
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [summary, detailed]
 *           default: summary
 *         description: Report detail level
 *     responses:
 *       200:
 *         description: Financial report generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     pdf:
 *                       type: string
 *                       description: Base64 encoded PDF
 *                     verificationCode:
 *                       type: string
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Student not found
 */
router.get(
  '/financial/:studentId',
  validateStudentId,
  validateLanguage,
  validateFormat,
  validateReportType,
  certificateController.generateFinancialReport
);

/**
 * @swagger
 * /api/v1/certificates/verify/{verificationCode}:
 *   get:
 *     summary: Verify certificate authenticity
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: verificationCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate verification code
 *     responses:
 *       200:
 *         description: Certificate verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 messageAr:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       description: Certificate type
 *                     student:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         studentId:
 *                           type: string
 *                         department:
 *                           type: string
 *                         faculty:
 *                           type: string
 *                     issuedAt:
 *                       type: string
 *                       format: date-time
 *                     verificationCode:
 *                       type: string
 *       404:
 *         description: Invalid verification code
 */
router.get(
  '/verify/:verificationCode',
  validateVerificationCode,
  certificateController.verifyCertificate
);

/**
 * @swagger
 * /api/v1/certificates/student/{studentId}:
 *   get:
 *     summary: Get all certificates for a student
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student certificates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     documents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           documentType:
 *                             type: string
 *                           verificationCode:
 *                             type: string
 *                           issuedAt:
 *                             type: string
 *                             format: date-time
 *                           issuedBy:
 *                             type: object
 *                           language:
 *                             type: string
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Student not found
 */
router.get(
  '/student/:studentId',
  validateStudentId,
  certificateController.getStudentCertificates
);

// Admin and staff only routes
router.use(authMiddleware.restrictTo('admin', 'staff'));

module.exports = router;