const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  // Department Identification
  departmentCode: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{2,6}$/, 'Department code must be 2-6 uppercase letters']
  },
  
  // Department Information
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    maxlength: [200, 'Department name cannot exceed 200 characters']
  },
  nameAr: {
    type: String,
    trim: true,
    maxlength: [200, 'Arabic department name cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Department description cannot exceed 1000 characters']
  },
  descriptionAr: {
    type: String,
    maxlength: [1000, 'Arabic department description cannot exceed 1000 characters']
  },
  
  // Hierarchy
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: [true, 'Faculty is required']
  },
  
  // Leadership
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor'
  },
  deputy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor'
  },
  
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
    building: String,
    floor: String,
    room: String,
    address: String,
    addressAr: String
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
  
  // Academic Programs
  programs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program'
  }],
  
  // Research Areas
  researchAreas: [{
    area: {
      type: String,
      required: true
    },
    areaAr: String,
    description: String,
    descriptionAr: String
  }],
  
  // Budget Information
  budget: {
    annual: {
      type: Number,
      min: [0, 'Budget cannot be negative']
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
    totalCourses: {
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
    }
  },
  
  // Quality Assurance
  accreditation: {
    isAccredited: {
      type: Boolean,
      default: false
    },
    accreditingBody: String,
    accreditationDate: Date,
    expiryDate: Date,
    certificate: String // File path
  },
  
  // Mission and Vision
  mission: {
    type: String,
    maxlength: [1000, 'Mission cannot exceed 1000 characters']
  },
  missionAr: {
    type: String,
    maxlength: [1000, 'Arabic mission cannot exceed 1000 characters']
  },
  vision: {
    type: String,
    maxlength: [1000, 'Vision cannot exceed 1000 characters']
  },
  visionAr: {
    type: String,
    maxlength: [1000, 'Arabic vision cannot exceed 1000 characters']
  },
  
  // Social Media and Communication
  socialMedia: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String,
    youtube: String
  },
  
  // Documents and Files
  documents: [{
    type: {
      type: String,
      enum: ['handbook', 'brochure', 'accreditation', 'policy', 'form', 'other'],
      required: true
    },
    title: String,
    titleAr: String,
    filename: String,
    path: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // News and Announcements
  announcements: [{
    title: String,
    titleAr: String,
    content: String,
    contentAr: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    publishedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Events
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
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
departmentSchema.virtual('fullName').get(function() {
  return `${this.departmentCode} - ${this.name}`;
});

departmentSchema.virtual('totalFaculty', {
  ref: 'Instructor',
  localField: '_id',
  foreignField: 'department',
  count: true,
  match: { status: 'active' }
});

departmentSchema.virtual('totalStudents', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'department',
  count: true,
  match: { status: 'active' }
});

departmentSchema.virtual('totalCourses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'department',
  count: true,
  match: { status: 'active' }
});

// Indexes
departmentSchema.index({ departmentCode: 1 });
departmentSchema.index({ faculty: 1 });
departmentSchema.index({ status: 1 });
departmentSchema.index({ name: 'text', nameAr: 'text' });

// Static methods
departmentSchema.statics.findByCode = function(departmentCode) {
  return this.findOne({ departmentCode: departmentCode.toUpperCase() });
};

departmentSchema.statics.findActiveDepartments = function() {
  return this.find({ status: 'active' });
};

departmentSchema.statics.findByFaculty = function(facultyId) {
  return this.find({ faculty: facultyId, status: 'active' });
};

departmentSchema.statics.searchDepartments = function(searchTerm) {
  return this.find({
    $and: [
      { status: 'active' },
      {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { nameAr: { $regex: searchTerm, $options: 'i' } },
          { departmentCode: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ]
  });
};

// Instance methods
departmentSchema.methods.updateStatistics = async function() {
  const Student = mongoose.model('Student');
  const Instructor = mongoose.model('Instructor');
  const Course = mongoose.model('Course');
  const Program = mongoose.model('Program');
  
  // Count active students
  this.statistics.totalStudents = await Student.countDocuments({
    department: this._id,
    status: 'active'
  });
  
  // Count active instructors
  this.statistics.totalInstructors = await Instructor.countDocuments({
    department: this._id,
    status: 'active'
  });
  
  // Count active courses
  this.statistics.totalCourses = await Course.countDocuments({
    department: this._id,
    status: 'active'
  });
  
  // Count programs
  this.statistics.totalPrograms = await Program.countDocuments({
    department: this._id,
    status: 'active'
  });
  
  // Calculate graduation rate
  const totalGraduated = await Student.countDocuments({
    department: this._id,
    status: 'graduated'
  });
  
  const totalEverEnrolled = await Student.countDocuments({
    department: this._id
  });
  
  if (totalEverEnrolled > 0) {
    this.statistics.graduationRate = (totalGraduated / totalEverEnrolled) * 100;
  }
  
  return this.save();
};

departmentSchema.methods.addAnnouncement = function(title, titleAr, content, contentAr, priority, publishedBy, expiresAt) {
  this.announcements.push({
    title,
    titleAr,
    content,
    contentAr,
    priority: priority || 'medium',
    publishedBy,
    expiresAt,
    publishedAt: new Date(),
    isActive: true
  });
  
  return this.save();
};

departmentSchema.methods.getActiveAnnouncements = function() {
  return this.announcements.filter(announcement => 
    announcement.isActive && 
    (!announcement.expiresAt || announcement.expiresAt > new Date())
  );
};

module.exports = mongoose.model('Department', departmentSchema);