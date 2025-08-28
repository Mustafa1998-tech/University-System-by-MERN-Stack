class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.queryObj = {};
  }

  filter() {
    // 1A) Basic filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'populate', 'search', 'q'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|ne|in|nin|regex)\b/g, match => `$${match}`);
    
    const parsedQuery = JSON.parse(queryStr);
    
    // Handle special filters
    this.handleDateFilters(parsedQuery);
    this.handleTextFilters(parsedQuery);
    this.handleNumericFilters(parsedQuery);
    
    this.queryObj = parsedQuery;
    this.query = this.query.find(parsedQuery);

    return this;
  }

  handleDateFilters(queryObj) {
    // Handle date range filters
    if (queryObj.dateFrom || queryObj.dateTo) {
      const dateFilter = {};
      
      if (queryObj.dateFrom) {
        dateFilter.$gte = new Date(queryObj.dateFrom);
        delete queryObj.dateFrom;
      }
      
      if (queryObj.dateTo) {
        dateFilter.$lte = new Date(queryObj.dateTo);
        delete queryObj.dateTo;
      }
      
      // Apply to common date fields
      const dateFields = ['createdAt', 'updatedAt', 'date', 'startDate', 'endDate'];
      dateFields.forEach(field => {
        if (!queryObj[field]) {
          queryObj[field] = dateFilter;
        }
      });
    }

    // Handle academic year filtering
    if (queryObj.academicYear) {
      // Keep as is, already properly formatted
    }

    // Handle semester filtering
    if (queryObj.semester) {
      // Convert to ObjectId if needed
      if (typeof queryObj.semester === 'string' && queryObj.semester.match(/^[0-9a-fA-F]{24}$/)) {
        queryObj.semester = require('mongoose').Types.ObjectId(queryObj.semester);
      }
    }
  }

  handleTextFilters(queryObj) {
    // Handle text search in specific fields
    Object.keys(queryObj).forEach(key => {
      if (typeof queryObj[key] === 'string' && !key.includes('Id') && !key.includes('Date')) {
        // Convert string to case-insensitive regex unless it's an exact match filter
        if (!queryObj[key].startsWith('exact:')) {
          queryObj[key] = { $regex: queryObj[key], $options: 'i' };
        } else {
          queryObj[key] = queryObj[key].replace('exact:', '');
        }
      }
    });

    // Handle multi-language search
    if (queryObj.name && !queryObj.nameAr) {
      const nameQuery = queryObj.name;
      delete queryObj.name;
      queryObj.$or = [
        { name: nameQuery },
        { nameAr: nameQuery }
      ];
    }
  }

  handleNumericFilters(queryObj) {
    // Handle numeric range filters
    const numericFields = ['age', 'gpa', 'creditHours', 'amount', 'balance', 'salary'];
    
    numericFields.forEach(field => {
      if (queryObj[`${field}Min`] || queryObj[`${field}Max`]) {
        const numericFilter = {};
        
        if (queryObj[`${field}Min`]) {
          numericFilter.$gte = parseFloat(queryObj[`${field}Min`]);
          delete queryObj[`${field}Min`];
        }
        
        if (queryObj[`${field}Max`]) {
          numericFilter.$lte = parseFloat(queryObj[`${field}Max`]);
          delete queryObj[`${field}Max`];
        }
        
        queryObj[field] = numericFilter;
      }
    });
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Default sort by creation date (newest first)
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // Exclude sensitive fields by default
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 20;
    const skip = (page - 1) * limit;

    // Limit the maximum number of results per page
    const maxLimit = 100;
    const actualLimit = Math.min(limit, maxLimit);

    this.query = this.query.skip(skip).limit(actualLimit);

    return this;
  }

  populate() {
    if (this.queryString.populate) {
      const populateFields = this.queryString.populate.split(',');
      populateFields.forEach(field => {
        this.query = this.query.populate(field.trim());
      });
    }

    return this;
  }

  // Advanced search functionality
  search(searchFields = []) {
    if (this.queryString.q) {
      const searchTerm = this.queryString.q;
      
      if (searchFields.length === 0) {
        // Default search fields
        searchFields = ['name', 'title', 'firstName', 'lastName', 'email', 'description'];
      }

      // Create search conditions for both English and Arabic fields
      const searchConditions = [];
      
      searchFields.forEach(field => {
        searchConditions.push({ [field]: { $regex: searchTerm, $options: 'i' } });
        
        // Also search in Arabic variant if it exists
        if (!field.endsWith('Ar')) {
          searchConditions.push({ [`${field}Ar`]: { $regex: searchTerm, $options: 'i' } });
        }
      });

      // Add text search if available
      searchConditions.push({ $text: { $search: searchTerm } });

      this.query = this.query.find({ $or: searchConditions });
    }

    return this;
  }

  // Filter by user permissions
  filterByPermissions(user) {
    if (!user) return this;

    // Apply role-based filtering
    switch (user.role) {
      case 'student':
        // Students can only see their own data
        this.query = this.query.find({ 
          $or: [
            { userId: user._id },
            { student: user.studentId },
            { isPublic: true }
          ]
        });
        break;
        
      case 'instructor':
        // Instructors can see their department/faculty data
        this.query = this.query.find({
          $or: [
            { userId: user._id },
            { instructor: user.instructorId },
            { department: user.department },
            { faculty: user.faculty },
            { isPublic: true }
          ]
        });
        break;
        
      case 'staff':
        // Staff can see data based on their division
        this.query = this.query.find({
          $or: [
            { userId: user._id },
            { department: user.department },
            { faculty: user.faculty },
            { division: user.division },
            { isPublic: true }
          ]
        });
        break;
        
      case 'admin':
        // Admins can see everything - no additional filtering
        break;
        
      default:
        // Default: only public data
        this.query = this.query.find({ isPublic: true });
    }

    return this;
  }

  // Filter by status
  filterActive() {
    this.query = this.query.find({ 
      $or: [
        { status: 'active' },
        { isActive: true },
        { status: { $exists: false }, isActive: { $exists: false } }
      ]
    });

    return this;
  }

  // Geographic filtering
  filterByLocation() {
    if (this.queryString.country) {
      this.query = this.query.find({ 
        $or: [
          { 'address.country': this.queryString.country },
          { country: this.queryString.country }
        ]
      });
    }

    if (this.queryString.city) {
      this.query = this.query.find({ 
        $or: [
          { 'address.city': this.queryString.city },
          { city: this.queryString.city }
        ]
      });
    }

    return this;
  }

  // Academic filtering
  filterAcademic() {
    // Filter by academic year
    if (this.queryString.academicYear) {
      this.query = this.query.find({ academicYear: this.queryString.academicYear });
    }

    // Filter by semester
    if (this.queryString.semesterId) {
      this.query = this.query.find({ semester: this.queryString.semesterId });
    }

    // Filter by department
    if (this.queryString.departmentId) {
      this.query = this.query.find({ department: this.queryString.departmentId });
    }

    // Filter by faculty
    if (this.queryString.facultyId) {
      this.query = this.query.find({ faculty: this.queryString.facultyId });
    }

    // Filter by course level
    if (this.queryString.level) {
      this.query = this.query.find({ level: this.queryString.level });
    }

    return this;
  }

  // Financial filtering
  filterFinancial() {
    // Filter by payment status
    if (this.queryString.paymentStatus) {
      this.query = this.query.find({ 
        $or: [
          { 'payment.status': this.queryString.paymentStatus },
          { 'financialStatus.status': this.queryString.paymentStatus }
        ]
      });
    }

    // Filter by amount range
    if (this.queryString.amountMin || this.queryString.amountMax) {
      const amountFilter = {};
      
      if (this.queryString.amountMin) {
        amountFilter.$gte = parseFloat(this.queryString.amountMin);
      }
      
      if (this.queryString.amountMax) {
        amountFilter.$lte = parseFloat(this.queryString.amountMax);
      }
      
      this.query = this.query.find({ 
        $or: [
          { amount: amountFilter },
          { totalAmount: amountFilter },
          { 'fees.tuitionFee': amountFilter }
        ]
      });
    }

    return this;
  }

  // Execute the query
  async execute() {
    return await this.query;
  }

  // Get count without executing the query
  async count() {
    return await this.query.model.countDocuments(this.queryObj);
  }

  // Get aggregation data
  async aggregate(pipeline) {
    return await this.query.model.aggregate(pipeline);
  }
}

module.exports = APIFeatures;