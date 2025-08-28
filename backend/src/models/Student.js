const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Student Identification
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^STU\d{6}$/, 'Student ID must be in format STU123456']
  },
  
  // Reference to User account
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  
  // Academic Information
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: [true, 'Faculty is required']
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
    required: [true, 'Program is required']
  },
  
  // Enrollment Details
  admissionDate: {
    type: Date,
    required: [true, 'Admission date is required'],
    default: Date.now
  },
  expectedGraduationDate: {
    type: Date
  },
  actualGraduationDate: {
    type: Date
  },
  currentSemester: {
    type: Number,
    min: [1, 'Semester must be at least 1'],
    max: [12, 'Semester cannot exceed 12'],
    default: 1
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY']
  },
  
  // Academic Status
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'suspended', 'graduated', 'transferred', 'withdrawn'],
      message: 'Status must be one of: active, inactive, suspended, graduated, transferred, withdrawn'
    },
    default: 'active'
  },
  
  // Academic Performance
  gpa: {
    current: {
      type: Number,
      min: [0, 'GPA cannot be negative'],
      max: [4.0, 'GPA cannot exceed 4.0'],
      default: 0
    },
    cumulative: {
      type: Number,
      min: [0, 'GPA cannot be negative'],
      max: [4.0, 'GPA cannot exceed 4.0'],
      default: 0
    }
  },
  totalCreditsEarned: {
    type: Number,
    min: [0, 'Credits cannot be negative'],
    default: 0
  },
  totalCreditsRequired: {
    type: Number,
    min: [1, 'Required credits must be at least 1'],
    default: 120
  },
  
  // Classification
  classification: {
    type: String,
    enum: ['freshman', 'sophomore', 'junior', 'senior', 'graduate'],
    default: 'freshman'
  },
  studyMode: {
    type: String,
    enum: ['full-time', 'part-time'],
    default: 'full-time'
  },
  
  // Parent/Guardian Information
  parentGuardian: {
    father: {
      name: String,
      nameAr: String,
      phone: String,
      email: String,
      occupation: String,
      occupationAr: String
    },
    mother: {
      name: String,
      nameAr: String,
      phone: String,
      email: String,
      occupation: String,
      occupationAr: String
    },
    guardian: {
      name: String,
      nameAr: String,
      phone: String,
      email: String,
      relationship: String,
      relationshipAr: String
    }
  },
  
  // Financial Information
  financialStatus: {
    tuitionStatus: {
      type: String,
      enum: ['paid', 'partial', 'unpaid', 'scholarship'],
      default: 'unpaid'
    },
    balance: {
      type: Number,
      default: 0
    },
    scholarshipAmount: {
      type: Number,
      default: 0
    }
  },
  
  // Health Information
  healthInfo: {
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    allergies: [String],
    medications: [String],
    emergencyMedicalInfo: String,
    insuranceProvider: String,
    insuranceNumber: String
  },
  
  // Academic Advisor
  advisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor'
  },
  
  // Previous Education
  previousEducation: {
    highSchool: {
      name: String,
      nameAr: String,
      graduationYear: Number,
      gpa: Number,
      country: String
    },
    university: {
      name: String,
      nameAr: String,
      degree: String,
      degreeAr: String,
      graduationYear: Number,
      gpa: Number,
      country: String
    }
  },
  
  // Extracurricular Activities
  activities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  clubs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  }],
  
  // Notes and Comments
  notes: [{
    content: String,
    contentAr: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['academic', 'disciplinary', 'financial', 'health', 'general'],
      default: 'general'
    }
  }],
  
  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['transcript', 'certificate', 'id_copy', 'photo', 'medical_record', 'other'],
      required: true
    },
    filename: String,
    originalName: String,
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

  // Generated Certificates
  certificates: [{
    type: {
      type: String,
      enum: ['graduation', 'enrollment', 'completion', 'achievement'],
      required: true
    },
    verificationCode: {
      type: String,
      required: true,
      unique: true
    },
    issuedAt: {
      type: Date,
      default: Date.now
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    language: {
      type: String,
      enum: ['en', 'ar'],
      default: 'en'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  }],

  // Generated Transcripts
  transcripts: [{
    type: {
      type: String,
      default: 'official'
    },
    verificationCode: {
      type: String,
      required: true,
      unique: true
    },
    issuedAt: {
      type: Date,
      default: Date.now
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    language: {
      type: String,
      enum: ['en', 'ar'],
      default: 'en'
    },
    semester: String,
    academicYear: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed
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
studentSchema.virtual('completionPercentage').get(function() {
  if (this.totalCreditsRequired === 0) return 0;
  return Math.round((this.totalCreditsEarned / this.totalCreditsRequired) * 100);
});

studentSchema.virtual('yearsToGraduation').get(function() {
  if (this.expectedGraduationDate) {
    const years = (this.expectedGraduationDate - Date.now()) / (1000 * 60 * 60 * 24 * 365);
    return Math.max(0, Math.ceil(years));
  }
  return null;
});

studentSchema.virtual('isGraduated').get(function() {
  return this.status === 'graduated' && this.actualGraduationDate;
});

// Indexes
studentSchema.index({ studentId: 1 });
studentSchema.index({ userId: 1 });
studentSchema.index({ department: 1 });
studentSchema.index({ faculty: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ academicYear: 1 });
studentSchema.index({ admissionDate: -1 });
studentSchema.index({ 'gpa.cumulative': -1 });

// Pre-save middleware
studentSchema.pre('save', function(next) {
  // Update classification based on credits earned
  if (this.totalCreditsEarned >= 90) {
    this.classification = 'senior';
  } else if (this.totalCreditsEarned >= 60) {
    this.classification = 'junior';
  } else if (this.totalCreditsEarned >= 30) {
    this.classification = 'sophomore';
  } else {
    this.classification = 'freshman';
  }
  
  // Calculate expected graduation date if not set
  if (!this.expectedGraduationDate && this.admissionDate) {
    const graduationDate = new Date(this.admissionDate);
    graduationDate.setFullYear(graduationDate.getFullYear() + 4); // 4 years program
    this.expectedGraduationDate = graduationDate;
  }
  
  next();
});

// Static methods
studentSchema.statics.findByStudentId = function(studentId) {
  return this.findOne({ studentId: studentId.toUpperCase() });
};

studentSchema.statics.findActiveStudents = function() {
  return this.find({ status: 'active' });
};

studentSchema.statics.findByDepartment = function(departmentId) {
  return this.find({ department: departmentId, status: 'active' });
};

studentSchema.statics.findByAcademicYear = function(academicYear) {
  return this.find({ academicYear, status: 'active' });
};

studentSchema.statics.findByClassification = function(classification) {
  return this.find({ classification, status: 'active' });
};

studentSchema.statics.getTopPerformers = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'gpa.cumulative': -1 })
    .limit(limit);
};

// Instance methods
studentSchema.methods.updateGPA = function(newGradePoints, newCredits) {
  const totalPoints = (this.gpa.cumulative * this.totalCreditsEarned) + (newGradePoints * newCredits);
  const totalCredits = this.totalCreditsEarned + newCredits;
  
  if (totalCredits > 0) {
    this.gpa.cumulative = totalPoints / totalCredits;
    this.totalCreditsEarned = totalCredits;
  }
  
  return this.save();
};

studentSchema.methods.addNote = function(content, contentAr, addedBy, category = 'general') {
  this.notes.push({
    content,
    contentAr,
    addedBy,
    category,
    addedAt: new Date()
  });
  
  return this.save();
};

module.exports = mongoose.model('Student', studentSchema);