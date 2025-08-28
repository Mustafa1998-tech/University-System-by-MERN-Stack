const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  // Staff Identification
  staffId: {
    type: String,
    required: [true, 'Staff ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^STF\d{6}$/, 'Staff ID must be in format STF123456']
  },
  
  // Reference to User account
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  
  // Organizational Structure
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  division: {
    type: String,
    enum: ['academic_affairs', 'student_affairs', 'finance', 'hr', 'it', 'admissions', 'registrar', 'library', 'facilities', 'security', 'other'],
    required: [true, 'Division is required']
  },
  
  // Position Information
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  jobTitleAr: {
    type: String,
    trim: true
  },
  jobDescription: {
    type: String,
    maxlength: [2000, 'Job description cannot exceed 2000 characters']
  },
  jobDescriptionAr: {
    type: String,
    maxlength: [2000, 'Arabic job description cannot exceed 2000 characters']
  },
  
  // Employment Details
  employmentType: {
    type: String,
    enum: {
      values: ['full_time', 'part_time', 'contract', 'temporary', 'intern'],
      message: 'Employment type must be one of: full_time, part_time, contract, temporary, intern'
    },
    default: 'full_time'
  },
  employmentStatus: {
    type: String,
    enum: {
      values: ['active', 'on_leave', 'suspended', 'terminated', 'retired'],
      message: 'Employment status must be one of: active, on_leave, suspended, terminated, retired'
    },
    default: 'active'
  },
  
  // Important Dates
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required']
  },
  probationEndDate: {
    type: Date
  },
  contractStartDate: {
    type: Date
  },
  contractEndDate: {
    type: Date
  },
  terminationDate: {
    type: Date
  },
  retirementDate: {
    type: Date
  },
  
  // Reporting Structure
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  directReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }],
  
  // Compensation
  salary: {
    baseSalary: {
      type: Number,
      min: [0, 'Base salary cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    payFrequency: {
      type: String,
      enum: ['monthly', 'bi_weekly', 'weekly', 'annual'],
      default: 'monthly'
    },
    effectiveDate: Date,
    lastReviewDate: Date,
    nextReviewDate: Date
  },
  
  // Benefits
  benefits: {
    healthInsurance: {
      type: Boolean,
      default: false
    },
    dentalInsurance: {
      type: Boolean,
      default: false
    },
    lifeInsurance: {
      type: Boolean,
      default: false
    },
    retirementPlan: {
      type: Boolean,
      default: false
    },
    paidTimeOff: {
      annual: Number, // days per year
      sick: Number,   // days per year
      personal: Number // days per year
    },
    otherBenefits: [String]
  },
  
  // Skills and Qualifications
  education: [{
    degree: {
      type: String,
      enum: ['high_school', 'associate', 'bachelor', 'master', 'phd', 'other'],
      required: true
    },
    major: String,
    majorAr: String,
    university: String,
    universityAr: String,
    country: String,
    graduationYear: Number,
    gpa: Number
  }],
  
  certifications: [{
    name: String,
    nameAr: String,
    issuingOrganization: String,
    issueDate: Date,
    expiryDate: Date,
    certificateNumber: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  skills: [{
    skill: String,
    skillAr: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    category: {
      type: String,
      enum: ['technical', 'soft', 'language', 'administrative', 'other'],
      default: 'other'
    }
  }],
  
  // Languages
  languages: [{
    language: String,
    proficiency: {
      type: String,
      enum: ['basic', 'intermediate', 'advanced', 'native'],
      default: 'basic'
    }
  }],
  
  // Work Location and Contact
  workLocation: {
    building: String,
    floor: String,
    office: String,
    desk: String,
    phone: String,
    extension: String
  },
  
  // Work Schedule
  workSchedule: {
    workingDays: [{
      type: String,
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    }],
    startTime: String, // Format: "HH:MM"
    endTime: String,   // Format: "HH:MM"
    breakTime: {
      start: String,
      end: String,
      duration: Number // in minutes
    },
    totalHoursPerWeek: {
      type: Number,
      default: 40
    }
  },
  
  // Performance
  performance: {
    lastReviewDate: Date,
    nextReviewDate: Date,
    overallRating: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5']
    },
    reviewComments: String,
    reviewCommentsAr: String,
    goals: [{
      goal: String,
      goalAr: String,
      targetDate: Date,
      status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'cancelled'],
        default: 'not_started'
      },
      progress: {
        type: Number,
        min: [0, 'Progress cannot be negative'],
        max: [100, 'Progress cannot exceed 100'],
        default: 0
      }
    }]
  },
  
  // Training and Development
  training: {
    required: [{
      course: String,
      courseAr: String,
      completionDeadline: Date,
      status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'overdue'],
        default: 'not_started'
      },
      completionDate: Date,
      certificate: String // file path
    }],
    completed: [{
      course: String,
      courseAr: String,
      provider: String,
      completionDate: Date,
      certificateNumber: String,
      certificate: String, // file path
      hoursCompleted: Number
    }]
  },
  
  // Time and Attendance
  attendance: {
    currentYearDays: {
      worked: {
        type: Number,
        default: 0
      },
      absent: {
        type: Number,
        default: 0
      },
      late: {
        type: Number,
        default: 0
      }
    },
    timeOffBalance: {
      annual: {
        type: Number,
        default: 0
      },
      sick: {
        type: Number,
        default: 0
      },
      personal: {
        type: Number,
        default: 0
      }
    }
  },
  
  // Disciplinary Actions
  disciplinaryActions: [{
    type: {
      type: String,
      enum: ['verbal_warning', 'written_warning', 'suspension', 'termination', 'other'],
      required: true
    },
    reason: String,
    reasonAr: String,
    description: String,
    descriptionAr: String,
    actionDate: {
      type: Date,
      default: Date.now
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    expiryDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Awards and Recognition
  awards: [{
    title: String,
    titleAr: String,
    description: String,
    descriptionAr: String,
    dateReceived: Date,
    awardedBy: String,
    category: {
      type: String,
      enum: ['excellence', 'innovation', 'service', 'teamwork', 'other'],
      default: 'other'
    }
  }],
  
  // Emergency Contacts
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String,
    email: String,
    address: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['resume', 'contract', 'id_copy', 'certificate', 'performance_review', 'other'],
      required: true
    },
    title: String,
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
  
  // Access and Permissions
  systemAccess: [{
    system: String,
    accessLevel: {
      type: String,
      enum: ['read', 'write', 'admin'],
      default: 'read'
    },
    grantedDate: Date,
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    expiryDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Notes and Comments
  notes: [{
    content: String,
    contentAr: String,
    category: {
      type: String,
      enum: ['general', 'performance', 'training', 'disciplinary', 'other'],
      default: 'general'
    },
    isConfidential: {
      type: Boolean,
      default: false
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
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
staffSchema.virtual('yearsOfService').get(function() {
  if (this.hireDate) {
    const years = (Date.now() - this.hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.floor(years);
  }
  return 0;
});

staffSchema.virtual('isOnProbation').get(function() {
  return this.probationEndDate && this.probationEndDate > new Date();
});

staffSchema.virtual('totalDirectReports', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'supervisor',
  count: true
});

// Indexes
staffSchema.index({ staffId: 1 });
staffSchema.index({ userId: 1 });
staffSchema.index({ department: 1 });
staffSchema.index({ division: 1 });
staffSchema.index({ employmentStatus: 1 });
staffSchema.index({ supervisor: 1 });
staffSchema.index({ hireDate: -1 });

// Static methods
staffSchema.statics.findByStaffId = function(staffId) {
  return this.findOne({ staffId: staffId.toUpperCase() });
};

staffSchema.statics.findActiveStaff = function() {
  return this.find({ employmentStatus: 'active' });
};

staffSchema.statics.findByDivision = function(division) {
  return this.find({ division, employmentStatus: 'active' });
};

staffSchema.statics.findBySupervisor = function(supervisorId) {
  return this.find({ supervisor: supervisorId, employmentStatus: 'active' });
};

staffSchema.statics.searchStaff = function(searchTerm) {
  return this.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $match: {
        $and: [
          { employmentStatus: 'active' },
          {
            $or: [
              { 'user.firstName': { $regex: searchTerm, $options: 'i' } },
              { 'user.lastName': { $regex: searchTerm, $options: 'i' } },
              { staffId: { $regex: searchTerm, $options: 'i' } },
              { jobTitle: { $regex: searchTerm, $options: 'i' } }
            ]
          }
        ]
      }
    }
  ]);
};

// Instance methods
staffSchema.methods.updateSalary = function(newSalary, effectiveDate) {
  this.salary.baseSalary = newSalary;
  this.salary.effectiveDate = effectiveDate || new Date();
  this.salary.lastReviewDate = new Date();
  
  // Schedule next review (annual)
  const nextReview = new Date();
  nextReview.setFullYear(nextReview.getFullYear() + 1);
  this.salary.nextReviewDate = nextReview;
  
  return this.save();
};

staffSchema.methods.addDisciplinaryAction = function(actionData) {
  this.disciplinaryActions.push({
    ...actionData,
    actionDate: actionData.actionDate || new Date(),
    isActive: true
  });
  
  return this.save();
};

staffSchema.methods.addAward = function(awardData) {
  this.awards.push({
    ...awardData,
    dateReceived: awardData.dateReceived || new Date()
  });
  
  return this.save();
};

staffSchema.methods.updatePerformanceReview = function(rating, comments, commentsAr, goals) {
  this.performance.lastReviewDate = new Date();
  this.performance.overallRating = rating;
  this.performance.reviewComments = comments;
  this.performance.reviewCommentsAr = commentsAr;
  
  if (goals) {
    this.performance.goals = goals;
  }
  
  // Schedule next review
  const nextReview = new Date();
  nextReview.setFullYear(nextReview.getFullYear() + 1);
  this.performance.nextReviewDate = nextReview;
  
  return this.save();
};

staffSchema.methods.recordTrainingCompletion = function(course, provider, certificateNumber, hoursCompleted) {
  this.training.completed.push({
    course,
    provider,
    completionDate: new Date(),
    certificateNumber,
    hoursCompleted
  });
  
  // Update required training status if applicable
  const requiredTraining = this.training.required.find(t => t.course === course);
  if (requiredTraining) {
    requiredTraining.status = 'completed';
    requiredTraining.completionDate = new Date();
  }
  
  return this.save();
};

staffSchema.methods.requestTimeOff = function(type, days, startDate, endDate, reason) {
  const timeOffRequest = {
    type, // 'annual', 'sick', 'personal'
    days,
    startDate,
    endDate,
    reason,
    requestDate: new Date(),
    status: 'pending'
  };
  
  // Check if sufficient balance
  if (this.attendance.timeOffBalance[type] >= days) {
    return timeOffRequest;
  } else {
    throw new Error(`Insufficient ${type} leave balance`);
  }
};

staffSchema.methods.calculateTotalCompensation = function() {
  let total = this.salary.baseSalary || 0;
  
  // Add estimated value of benefits
  if (this.benefits.healthInsurance) total += 5000; // Example value
  if (this.benefits.dentalInsurance) total += 1000;
  if (this.benefits.lifeInsurance) total += 500;
  if (this.benefits.retirementPlan) total += total * 0.05; // 5% contribution
  
  return total;
};

module.exports = mongoose.model('Staff', staffSchema);