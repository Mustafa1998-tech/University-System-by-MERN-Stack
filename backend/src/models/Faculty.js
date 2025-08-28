const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  // Faculty Identification
  facultyCode: {
    type: String,
    required: [true, 'Faculty code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{2,6}$/, 'Faculty code must be 2-6 uppercase letters']
  },
  
  // Faculty Information
  name: {
    type: String,
    required: [true, 'Faculty name is required'],
    trim: true,
    maxlength: [200, 'Faculty name cannot exceed 200 characters']
  },
  nameAr: {
    type: String,
    trim: true,
    maxlength: [200, 'Arabic faculty name cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Faculty description cannot exceed 2000 characters']
  },
  descriptionAr: {
    type: String,
    maxlength: [2000, 'Arabic faculty description cannot exceed 2000 characters']
  },
  
  // Leadership
  dean: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor'
  },
  viceDeans: [{
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor'
    },
    position: {
      type: String,
      enum: ['academic_affairs', 'student_affairs', 'research', 'community_service', 'quality_assurance']
    },
    positionAr: String,
    appointmentDate: Date
  }],
  
  // Contact Information
  contact: {
    email: {
      type: String,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      trim: true
    },
    fax: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  
  // Location
  location: {
    campus: String,
    building: String,
    address: String,
    addressAr: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Academic Information
  establishedYear: {
    type: Number,
    min: [1800, 'Established year must be after 1800'],
    max: [new Date().getFullYear(), 'Established year cannot be in the future']
  },
  
  // Status
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'merged', 'split'],
      message: 'Status must be one of: active, inactive, merged, split'
    },
    default: 'active'
  },
  
  // Academic Structure
  departments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  
  // Research Information
  researchCenters: [{
    name: String,
    nameAr: String,
    director: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor'
    },
    establishedYear: Number,
    focus: String,
    focusAr: String
  }],
  
  // Academic Programs
  degreeTypes: [{
    type: String,
    enum: ['bachelor', 'master', 'doctoral', 'diploma', 'certificate']
  }],
  
  // Budget Information
  budget: {
    annual: {
      type: Number,
      min: [0, 'Budget cannot be negative']
    },
    research: {
      type: Number,
      min: [0, 'Research budget cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    fiscalYear: String
  },
  
  // Statistics
  statistics: {
    totalStudents: {
      type: Number,
      default: 0
    },
    totalInstructors: {
      type: Number,
      default: 0
    },
    totalDepartments: {
      type: Number,
      default: 0
    },
    totalPrograms: {
      type: Number,
      default: 0
    },
    graduationRate: {
      type: Number,
      default: 0
    },
    researchPublications: {
      type: Number,
      default: 0
    },
    researchGrants: {
      type: Number,
      default: 0
    }
  },
  
  // Quality Assurance
  accreditation: {
    isAccredited: {
      type: Boolean,
      default: false
    },
    accreditingBodies: [{
      name: String,
      accreditationDate: Date,
      expiryDate: Date,
      certificate: String // File path
    }],
    rankings: [{
      rankingBody: String,
      rank: Number,
      year: Number,
      category: String
    }]
  },
  
  // Mission, Vision, and Values
  mission: {
    type: String,
    maxlength: [2000, 'Mission cannot exceed 2000 characters']
  },
  missionAr: {
    type: String,
    maxlength: [2000, 'Arabic mission cannot exceed 2000 characters']
  },
  vision: {
    type: String,
    maxlength: [2000, 'Vision cannot exceed 2000 characters']
  },
  visionAr: {
    type: String,
    maxlength: [2000, 'Arabic vision cannot exceed 2000 characters']
  },
  values: [{
    value: String,
    valueAr: String,
    description: String,
    descriptionAr: String
  }],
  
  // Strategic Objectives
  strategicObjectives: [{
    objective: String,
    objectiveAr: String,
    description: String,
    descriptionAr: String,
    targetDate: Date,
    status: {
      type: String,
      enum: ['planned', 'in_progress', 'completed', 'delayed'],
      default: 'planned'
    }
  }],
  
  // Social Media and Communication
  socialMedia: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String,
    youtube: String
  },
  
  // Documents and Policies
  documents: [{
    type: {
      type: String,
      enum: ['handbook', 'brochure', 'accreditation', 'policy', 'strategic_plan', 'annual_report', 'other'],
      required: true
    },
    title: String,
    titleAr: String,
    filename: String,
    path: String,
    size: Number,
    version: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // News and Events
  news: [{
    title: String,
    titleAr: String,
    content: String,
    contentAr: String,
    category: {
      type: String,
      enum: ['academic', 'research', 'student_life', 'awards', 'general'],
      default: 'general'
    },
    featured: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date,
      default: Date.now
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    image: String
  }],
  
  // Partnerships and Collaborations
  partnerships: [{
    organization: String,
    organizationAr: String,
    type: {
      type: String,
      enum: ['academic', 'research', 'industry', 'international', 'community'],
      required: true
    },
    country: String,
    startDate: Date,
    endDate: Date,
    description: String,
    descriptionAr: String,
    contactPerson: String,
    contactEmail: String
  }],
  
  // Facilities
  facilities: [{
    name: String,
    nameAr: String,
    type: {
      type: String,
      enum: ['library', 'laboratory', 'auditorium', 'clinic', 'sports', 'cafeteria', 'other']
    },
    capacity: Number,
    equipment: [String],
    location: String,
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    }
  }],
  
  // Audit Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
facultySchema.virtual('fullName').get(function() {
  return `${this.facultyCode} - ${this.name}`;
});

facultySchema.virtual('totalDepartments', {
  ref: 'Department',
  localField: '_id',
  foreignField: 'faculty',
  count: true,
  match: { status: 'active' }
});

facultySchema.virtual('totalStudents', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'faculty',
  count: true,
  match: { status: 'active' }
});

facultySchema.virtual('totalInstructors', {
  ref: 'Instructor',
  localField: '_id',
  foreignField: 'faculty',
  count: true,
  match: { status: 'active' }
});

// Indexes
facultySchema.index({ facultyCode: 1 });
facultySchema.index({ status: 1 });
facultySchema.index({ name: 'text', nameAr: 'text' });
facultySchema.index({ establishedYear: 1 });

// Static methods
facultySchema.statics.findByCode = function(facultyCode) {
  return this.findOne({ facultyCode: facultyCode.toUpperCase() });
};

facultySchema.statics.findActiveFaculties = function() {
  return this.find({ status: 'active' });
};

facultySchema.statics.searchFaculties = function(searchTerm) {
  return this.find({
    $and: [
      { status: 'active' },
      {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { nameAr: { $regex: searchTerm, $options: 'i' } },
          { facultyCode: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ]
  });
};

// Instance methods
facultySchema.methods.updateStatistics = async function() {
  const Student = mongoose.model('Student');
  const Instructor = mongoose.model('Instructor');
  const Department = mongoose.model('Department');
  const Program = mongoose.model('Program');
  const Publication = mongoose.model('Publication');
  const Research = mongoose.model('Research');
  
  // Count active students
  this.statistics.totalStudents = await Student.countDocuments({
    faculty: this._id,
    status: 'active'
  });
  
  // Count active instructors
  this.statistics.totalInstructors = await Instructor.countDocuments({
    faculty: this._id,
    status: 'active'
  });
  
  // Count active departments
  this.statistics.totalDepartments = await Department.countDocuments({
    faculty: this._id,
    status: 'active'
  });
  
  // Count active programs
  this.statistics.totalPrograms = await Program.countDocuments({
    faculty: this._id,
    status: 'active'
  });
  
  // Calculate graduation rate
  const totalGraduated = await Student.countDocuments({
    faculty: this._id,
    status: 'graduated'
  });
  
  const totalEverEnrolled = await Student.countDocuments({
    faculty: this._id
  });
  
  if (totalEverEnrolled > 0) {
    this.statistics.graduationRate = (totalGraduated / totalEverEnrolled) * 100;
  }
  
  // Count research publications
  const instructorIds = await Instructor.find({ faculty: this._id }).distinct('_id');
  this.statistics.researchPublications = await Publication.countDocuments({
    authors: { $in: instructorIds }
  });
  
  // Count research grants
  this.statistics.researchGrants = await Research.countDocuments({
    faculty: this._id,
    status: 'active'
  });
  
  return this.save();
};

facultySchema.methods.addNews = function(title, titleAr, content, contentAr, category, publishedBy, featured = false, image = null) {
  this.news.push({
    title,
    titleAr,
    content,
    contentAr,
    category: category || 'general',
    featured,
    publishedBy,
    publishedAt: new Date(),
    image
  });
  
  return this.save();
};

facultySchema.methods.getFeaturedNews = function(limit = 5) {
  return this.news
    .filter(item => item.featured)
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .slice(0, limit);
};

facultySchema.methods.addPartnership = function(partnershipData) {
  this.partnerships.push(partnershipData);
  return this.save();
};

facultySchema.methods.getActivePartnerships = function() {
  return this.partnerships.filter(partnership => 
    !partnership.endDate || partnership.endDate > new Date()
  );
};

module.exports = mongoose.model('Faculty', facultySchema);