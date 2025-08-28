const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
  // Instructor Identification
  instructorId: {
    type: String,
    required: [true, 'Instructor ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^INS\d{6}$/, 'Instructor ID must be in format INS123456']
  },
  
  // Reference to User account
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  
  // Academic Affiliation
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
  
  // Academic Information
  academicRank: {
    type: String,
    enum: {
      values: ['assistant_professor', 'associate_professor', 'professor', 'lecturer', 'instructor', 'visiting_professor', 'emeritus'],
      message: 'Academic rank must be one of: assistant_professor, associate_professor, professor, lecturer, instructor, visiting_professor, emeritus'
    },
    required: [true, 'Academic rank is required']
  },
  academicRankAr: {
    type: String
  },
  
  // Employment Information
  employmentType: {
    type: String,
    enum: {
      values: ['full_time', 'part_time', 'adjunct', 'visiting', 'emeritus'],
      message: 'Employment type must be one of: full_time, part_time, adjunct, visiting, emeritus'
    },
    default: 'full_time'
  },
  employmentStatus: {
    type: String,
    enum: {
      values: ['active', 'on_leave', 'sabbatical', 'retired', 'terminated'],
      message: 'Employment status must be one of: active, on_leave, sabbatical, retired, terminated'
    },
    default: 'active'
  },
  
  // Important Dates
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required']
  },
  tenureDate: {
    type: Date
  },
  retirementDate: {
    type: Date
  },
  
  // Education Background
  education: [{
    degree: {
      type: String,
      enum: ['bachelor', 'master', 'phd', 'postdoc'],
      required: true
    },
    major: String,
    majorAr: String,
    university: String,
    universityAr: String,
    country: String,
    graduationYear: Number,
    gpa: Number,
    thesis: String,
    thesisAr: String,
    advisor: String
  }],
  
  // Professional Certifications
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
  
  // Specializations and Expertise
  specializations: [{
    area: String,
    areaAr: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'advanced'
    }
  }],
  
  // Teaching Information
  teaching: {
    maxCoursesPerSemester: {
      type: Number,
      min: [1, 'Max courses per semester must be at least 1'],
      max: [8, 'Max courses per semester cannot exceed 8'],
      default: 4
    },
    preferredSchedule: {
      days: [{
        type: String,
        enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      }],
      timePreference: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'any'],
        default: 'any'
      }
    },
    teachingLoad: {
      currentSemester: {
        type: Number,
        default: 0
      },
      maxLoad: {
        type: Number,
        default: 12
      }
    }
  },
  
  // Research Information
  research: {
    interests: [{
      area: String,
      areaAr: String,
      keywords: [String]
    }],
    currentProjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Research'
    }],
    publications: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publication'
    }],
    grants: [{
      title: String,
      titleAr: String,
      fundingAgency: String,
      amount: Number,
      currency: String,
      startDate: Date,
      endDate: Date,
      role: {
        type: String,
        enum: ['principal_investigator', 'co_investigator', 'researcher'],
        default: 'principal_investigator'
      },
      status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
      }
    }]
  },
  
  // Service and Administrative Roles
  administrativeRoles: [{
    position: String,
    positionAr: String,
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    responsibilities: [String],
    responsibilitiesAr: [String]
  }],
  
  // Committee Memberships
  committees: [{
    name: String,
    nameAr: String,
    role: {
      type: String,
      enum: ['chair', 'member', 'secretary', 'advisor'],
      default: 'member'
    },
    type: {
      type: String,
      enum: ['departmental', 'faculty', 'university', 'external'],
      default: 'departmental'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Office Information
  office: {
    building: String,
    room: String,
    floor: String,
    phone: String,
    extension: String
  },
  
  // Office Hours
  officeHours: [{
    day: {
      type: String,
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      required: true
    },
    startTime: String, // Format: "HH:MM"
    endTime: String,   // Format: "HH:MM"
    location: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Performance Metrics
  performance: {
    teaching: {
      evaluationScore: {
        type: Number,
        min: [1, 'Evaluation score must be between 1 and 5'],
        max: [5, 'Evaluation score must be between 1 and 5']
      },
      evaluationCount: {
        type: Number,
        default: 0
      },
      lastEvaluationDate: Date
    },
    research: {
      publicationsThisYear: {
        type: Number,
        default: 0
      },
      citationCount: {
        type: Number,
        default: 0
      },
      hIndex: {
        type: Number,
        default: 0
      }
    },
    service: {
      committeesServed: {
        type: Number,
        default: 0
      },
      leadershipRoles: {
        type: Number,
        default: 0
      }
    }
  },
  
  // Professional Memberships
  professionalMemberships: [{
    organization: String,
    organizationAr: String,
    membershipType: {
      type: String,
      enum: ['regular', 'fellow', 'honorary', 'student'],
      default: 'regular'
    },
    joinDate: Date,
    expiryDate: Date,
    membershipNumber: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Awards and Honors
  awards: [{
    title: String,
    titleAr: String,
    awardingOrganization: String,
    dateReceived: Date,
    description: String,
    descriptionAr: String,
    category: {
      type: String,
      enum: ['teaching', 'research', 'service', 'lifetime_achievement', 'other'],
      default: 'other'
    }
  }],
  
  // Conferences and Presentations
  conferences: [{
    title: String,
    titleAr: String,
    role: {
      type: String,
      enum: ['presenter', 'keynote', 'organizer', 'attendee', 'reviewer'],
      default: 'attendee'
    },
    venue: String,
    venueAr: String,
    date: Date,
    location: String,
    presentationTitle: String,
    presentationTitleAr: String
  }],
  
  // Students Supervised
  studentsSupervised: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    supervisionType: {
      type: String,
      enum: ['advisor', 'thesis_supervisor', 'dissertation_supervisor', 'research_supervisor'],
      required: true
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['active', 'completed', 'transferred', 'discontinued'],
      default: 'active'
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
  
  // CV and Documents
  documents: [{
    type: {
      type: String,
      enum: ['cv', 'resume', 'certificate', 'transcript', 'publication', 'other'],
      required: true
    },
    title: String,
    filename: String,
    path: String,
    size: Number,
    uploadedAt: {
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
instructorSchema.virtual('yearsOfService').get(function() {
  if (this.hireDate) {
    const years = (Date.now() - this.hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.floor(years);
  }
  return 0;
});

instructorSchema.virtual('currentCourses', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'instructor',
  match: { status: 'active' }
});

instructorSchema.virtual('totalPublications', {
  ref: 'Publication',
  localField: '_id',
  foreignField: 'authors',
  count: true
});

// Indexes
instructorSchema.index({ instructorId: 1 });
instructorSchema.index({ userId: 1 });
instructorSchema.index({ department: 1 });
instructorSchema.index({ faculty: 1 });
instructorSchema.index({ academicRank: 1 });
instructorSchema.index({ employmentStatus: 1 });
instructorSchema.index({ hireDate: -1 });

// Static methods
instructorSchema.statics.findByInstructorId = function(instructorId) {
  return this.findOne({ instructorId: instructorId.toUpperCase() });
};

instructorSchema.statics.findActiveInstructors = function() {
  return this.find({ employmentStatus: 'active' });
};

instructorSchema.statics.findByDepartment = function(departmentId) {
  return this.find({ department: departmentId, employmentStatus: 'active' });
};

instructorSchema.statics.findByRank = function(academicRank) {
  return this.find({ academicRank, employmentStatus: 'active' });
};

instructorSchema.statics.searchInstructors = function(searchTerm) {
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
              { 'user.firstNameAr': { $regex: searchTerm, $options: 'i' } },
              { 'user.lastNameAr': { $regex: searchTerm, $options: 'i' } },
              { instructorId: { $regex: searchTerm, $options: 'i' } }
            ]
          }
        ]
      }
    }
  ]);
};

// Instance methods
instructorSchema.methods.updateTeachingLoad = function(creditHours) {
  this.teaching.teachingLoad.currentSemester += creditHours;
  return this.save();
};

instructorSchema.methods.addPublication = function(publicationId) {
  if (!this.research.publications.includes(publicationId)) {
    this.research.publications.push(publicationId);
    this.performance.research.publicationsThisYear += 1;
  }
  return this.save();
};

instructorSchema.methods.addAward = function(awardData) {
  this.awards.push({
    ...awardData,
    dateReceived: awardData.dateReceived || new Date()
  });
  return this.save();
};

instructorSchema.methods.updateOfficeHours = function(newSchedule) {
  this.officeHours = newSchedule.map(schedule => ({
    ...schedule,
    isActive: true
  }));
  return this.save();
};

instructorSchema.methods.addStudent = function(studentId, supervisionType) {
  const existingSupervision = this.studentsSupervised.find(
    s => s.student.toString() === studentId.toString() && s.status === 'active'
  );
  
  if (!existingSupervision) {
    this.studentsSupervised.push({
      student: studentId,
      supervisionType,
      startDate: new Date(),
      status: 'active'
    });
  }
  
  return this.save();
};

instructorSchema.methods.calculateWorkload = function() {
  const teachingHours = this.teaching.teachingLoad.currentSemester;
  const researchProjects = this.research.currentProjects.length;
  const adminRoles = this.administrativeRoles.filter(role => role.isActive).length;
  const committees = this.committees.filter(committee => committee.isActive).length;
  
  return {
    teaching: teachingHours,
    research: researchProjects * 2, // Assume 2 hours per project per week
    service: (adminRoles * 3) + (committees * 1), // Assume 3 hours per admin role, 1 per committee
    total: teachingHours + (researchProjects * 2) + (adminRoles * 3) + (committees * 1)
  };
};

module.exports = mongoose.model('Instructor', instructorSchema);