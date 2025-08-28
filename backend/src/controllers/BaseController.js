const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const { formatResponse } = require('../middleware/i18n');
const logger = require('../utils/logger');

class BaseController {
  constructor(Model, modelName) {
    this.Model = Model;
    this.modelName = modelName;
  }

  // Get all documents with filtering, sorting, pagination
  getAll = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(this.Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;
    const total = await this.Model.countDocuments(features.queryObj);

    logger.logDatabaseOperation('READ_ALL', this.modelName, req.user?.id);

    res.status(200).json(formatResponse(
      req,
      'success',
      'success.retrieved',
      docs,
      {
        total,
        page: req.query.page * 1 || 1,
        limit: req.query.limit * 1 || 20,
        pages: Math.ceil(total / (req.query.limit * 1 || 20))
      }
    ));
  });

  // Get single document by ID
  getOne = catchAsync(async (req, res, next) => {
    let query = this.Model.findById(req.params.id);
    
    // Add population if specified
    if (req.query.populate) {
      query = query.populate(req.query.populate.split(',').join(' '));
    }

    const doc = await query;

    if (!doc) {
      return next(new AppError({
        en: `No ${this.modelName} found with that ID`,
        ar: `لم يتم العثور على ${this.modelName} بهذا المعرف`
      }, 404));
    }

    logger.logDatabaseOperation('READ_ONE', this.modelName, req.user?.id, doc._id);

    res.status(200).json(formatResponse(
      req,
      'success',
      'success.retrieved',
      doc
    ));
  });

  // Create new document
  createOne = catchAsync(async (req, res, next) => {
    // Add audit information
    if (req.user) {
      req.body.createdBy = req.user.id;
      req.body.updatedBy = req.user.id;
    }

    const doc = await this.Model.create(req.body);

    logger.logDatabaseOperation('CREATE', this.modelName, req.user?.id, doc._id, req.body);

    res.status(201).json(formatResponse(
      req,
      'success',
      'success.created',
      doc
    ));
  });

  // Update document by ID
  updateOne = catchAsync(async (req, res, next) => {
    // Add audit information
    if (req.user) {
      req.body.updatedBy = req.user.id;
    }

    const doc = await this.Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError({
        en: `No ${this.modelName} found with that ID`,
        ar: `لم يتم العثور على ${this.modelName} بهذا المعرف`
      }, 404));
    }

    logger.logDatabaseOperation('UPDATE', this.modelName, req.user?.id, doc._id, req.body);

    res.status(200).json(formatResponse(
      req,
      'success',
      'success.updated',
      doc
    ));
  });

  // Delete document by ID
  deleteOne = catchAsync(async (req, res, next) => {
    const doc = await this.Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError({
        en: `No ${this.modelName} found with that ID`,
        ar: `لم يتم العثور على ${this.modelName} بهذا المعرف`
      }, 404));
    }

    logger.logDatabaseOperation('DELETE', this.modelName, req.user?.id, doc._id);

    res.status(204).json(formatResponse(
      req,
      'success',
      'success.deleted',
      null
    ));
  });

  // Search documents
  search = catchAsync(async (req, res, next) => {
    const { q } = req.query;
    
    if (!q) {
      return next(new AppError({
        en: 'Search query is required',
        ar: 'مطلوب كلمة البحث'
      }, 400));
    }

    // Use text search if available, otherwise search in common fields
    let searchQuery = {};
    
    if (this.Model.schema.indexes().some(index => index[0].$text)) {
      searchQuery = { $text: { $search: q } };
    } else {
      // Fallback to regex search on common fields
      const searchFields = ['name', 'title', 'firstName', 'lastName', 'email'];
      const regexSearches = searchFields.map(field => ({
        [field]: { $regex: q, $options: 'i' }
      }));
      searchQuery = { $or: regexSearches };
    }

    const features = new APIFeatures(this.Model.find(searchQuery), req.query)
      .sort()
      .limitFields()
      .paginate();

    const docs = await features.query;
    const total = await this.Model.countDocuments(searchQuery);

    logger.logDatabaseOperation('SEARCH', this.modelName, req.user?.id, null, { query: q });

    res.status(200).json(formatResponse(
      req,
      'success',
      'success.retrieved',
      docs,
      {
        total,
        searchQuery: q,
        page: req.query.page * 1 || 1,
        limit: req.query.limit * 1 || 20,
        pages: Math.ceil(total / (req.query.limit * 1 || 20))
      }
    ));
  });

  // Get statistics/aggregation data
  getStats = catchAsync(async (req, res, next) => {
    // Basic stats - override in specific controllers for custom aggregations
    const total = await this.Model.countDocuments();
    const recent = await this.Model.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const stats = {
      total,
      recentlyCreated: recent,
      lastUpdated: new Date()
    };

    res.status(200).json(formatResponse(
      req,
      'success',
      'success.retrieved',
      stats
    ));
  });

  // Bulk operations
  bulkCreate = catchAsync(async (req, res, next) => {
    const { items } = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
      return next(new AppError({
        en: 'Items array is required and cannot be empty',
        ar: 'مصفوفة العناصر مطلوبة ولا يمكن أن تكون فارغة'
      }, 400));
    }

    // Add audit information to all items
    if (req.user) {
      items.forEach(item => {
        item.createdBy = req.user.id;
        item.updatedBy = req.user.id;
      });
    }

    const docs = await this.Model.insertMany(items);

    logger.logDatabaseOperation('BULK_CREATE', this.modelName, req.user?.id, null, { count: items.length });

    res.status(201).json(formatResponse(
      req,
      'success',
      'success.created',
      docs,
      { created: docs.length }
    ));
  });

  bulkUpdate = catchAsync(async (req, res, next) => {
    const { filter, update } = req.body;
    
    if (!filter || !update) {
      return next(new AppError({
        en: 'Filter and update objects are required',
        ar: 'كائنات المرشح والتحديث مطلوبة'
      }, 400));
    }

    // Add audit information
    if (req.user) {
      update.updatedBy = req.user.id;
    }

    const result = await this.Model.updateMany(filter, update);

    logger.logDatabaseOperation('BULK_UPDATE', this.modelName, req.user?.id, null, { filter, update, modified: result.modifiedCount });

    res.status(200).json(formatResponse(
      req,
      'success',
      'success.updated',
      null,
      { 
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    ));
  });

  bulkDelete = catchAsync(async (req, res, next) => {
    const { filter } = req.body;
    
    if (!filter) {
      return next(new AppError({
        en: 'Filter object is required',
        ar: 'كائن المرشح مطلوب'
      }, 400));
    }

    const result = await this.Model.deleteMany(filter);

    logger.logDatabaseOperation('BULK_DELETE', this.modelName, req.user?.id, null, { filter, deleted: result.deletedCount });

    res.status(200).json(formatResponse(
      req,
      'success',
      'success.deleted',
      null,
      { deleted: result.deletedCount }
    ));
  });

  // Export data
  exportData = catchAsync(async (req, res, next) => {
    const { format = 'json' } = req.query;
    
    const features = new APIFeatures(this.Model.find(), req.query)
      .filter()
      .sort()
      .limitFields();

    const docs = await features.query;

    if (format === 'csv') {
      // TODO: Implement CSV export
      return next(new AppError({
        en: 'CSV export not yet implemented',
        ar: 'تصدير CSV غير مُطبق بعد'
      }, 501));
    }

    logger.logDatabaseOperation('EXPORT', this.modelName, req.user?.id, null, { format, count: docs.length });

    res.status(200).json(formatResponse(
      req,
      'success',
      'success.retrieved',
      docs,
      { 
        format,
        exportedAt: new Date(),
        count: docs.length
      }
    ));
  });
}

module.exports = BaseController;