const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  // Core References
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student reference is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor',
    required: [true, 'Instructor reference is required']
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'Semester reference is required']
  },
  
  // Enrollment Information
  enrollmentDate: {
    type: Date,
    required: [true, 'Enrollment date is required'],
    default: Date.now
  },
  status: {
    type: String,
    enum: {
      values: ['enrolled', 'completed', 'dropped', 'withdrawn', 'failed', 'audit'],
      message: 'Status must be one of: enrolled, completed, dropped, withdrawn, failed, audit'
    },
    default: 'enrolled'
  },
  enrollmentType: {
    type: String,
    enum: {
      values: ['regular', 'audit', 'credit', 'non_credit', 'retake'],
      message: 'Enrollment type must be one of: regular, audit, credit, non_credit, retake'
    },
    default: 'regular'
  },
  
  // Academic Details
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true,
    uppercase: true
  },
  creditHours: {
    type: Number,
    required: [true, 'Credit hours is required'],
    min: [0, 'Credit hours cannot be negative']
  },
  
  // Grading Information
  grades: {
    assignments: [{
      title: String,
      titleAr: String,
      type: {
        type: String,
        enum: ['quiz', 'exam', 'assignment', 'project', 'presentation', 'participation'],
        required: true
      },
      maxPoints: {
        type: Number,
        required: true,
        min: [0, 'Maximum points cannot be negative']
      },
      earnedPoints: {
        type: Number,
        min: [0, 'Earned points cannot be negative']
      },
      percentage: Number,
      submissionDate: Date,
      dueDate: Date,
      feedback: String,
      feedbackAr: String,
      gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      gradedAt: Date
    }],
    midtermGrade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I', 'W']
    },
    finalGrade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I', 'W']
    },
    gradePoints: {
      type: Number,
      min: [0, 'Grade points cannot be negative'],
      max: [4, 'Grade points cannot exceed 4']
    },
    totalPercentage: {
      type: Number,
      min: [0, 'Total percentage cannot be negative'],
      max: [100, 'Total percentage cannot exceed 100']
    }
  },
  
  // Attendance Information
  attendance: {
    totalSessions: {
      type: Number,
      default: 0,
      min: [0, 'Total sessions cannot be negative']
    },
    attendedSessions: {
      type: Number,
      default: 0,
      min: [0, 'Attended sessions cannot be negative']
    },
    attendancePercentage: {
      type: Number,
      default: 0,
      min: [0, 'Attendance percentage cannot be negative'],
      max: [100, 'Attendance percentage cannot exceed 100']
    },
    attendanceRecords: [{
      date: {
        type: Date,
        required: true
      },
      status: {
        type: String,
        enum: ['present', 'absent', 'late', 'excused'],
        required: true
      },
      sessionType: {
        type: String,
        enum: ['lecture', 'lab', 'tutorial', 'exam'],
        default: 'lecture'
      },
      duration: Number, // in minutes
      notes: String,
      recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      recordedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Payment Information
  payment: {
    tuitionAmount: {
      type: Number,
      min: [0, 'Tuition amount cannot be negative']
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative']
    },
    balanceAmount: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'partial', 'unpaid', 'refunded', 'waived'],
      default: 'unpaid'
    },
    paymentDeadline: Date,
    scholarshipApplied: {
      type: Boolean,
      default: false
    },
    scholarshipAmount: {
      type: Number,
      default: 0,
      min: [0, 'Scholarship amount cannot be negative']
    }
  },
  
  // Important Dates
  addDropDeadline: {
    type: Date,
    required: [true, 'Add/Drop deadline is required']
  },
  withdrawDeadline: {
    type: Date,
    required: [true, 'Withdraw deadline is required']
  },
  completionDate: Date,
  
  // Prerequisites Check
  prerequisitesChecked: {
    type: Boolean,
    default: false
  },
  prerequisitesMet: {
    type: Boolean,
    default: true
  },
  prerequisitesOverride: {
    approved: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    reasonAr: String,
    approvalDate: Date
  },
  
  // Waitlist Information
  waitlist: {
    isOnWaitlist: {
      type: Boolean,
      default: false
    },
    waitlistPosition: Number,
    waitlistDate: Date,
    notificationSent: {
      type: Boolean,
      default: false
    }
  },
  
  // Academic Actions
  academicActions: [{
    action: {
      type: String,
      enum: ['warning', 'probation', 'suspension', 'dismissal', 'honor', 'deans_list'],
      required: true
    },
    actionAr: String,
    reason: String,
    reasonAr: String,
    actionDate: {
      type: Date,
      default: Date.now
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    effectiveDate: Date,
    expiryDate: Date,
    notes: String,
    notesAr: String
  }],
  
  // Special Accommodations
  accommodations: [{
    type: {
      type: String,
      enum: ['extra_time', 'separate_room', 'large_print', 'interpreter', 'note_taker', 'other'],
      required: true
    },
    description: String,
    descriptionAr: String,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Communication Log
  communications: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'meeting', 'letter', 'sms'],
      required: true
    },
    subject: String,
    subjectAr: String,
    content: String,
    contentAr: String,
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    response: String,
    responseAr: String,
    responseAt: Date
  }],
  
  // Learning Outcomes Assessment
  learningOutcomes: [{
    outcome: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningOutcome'
    },
    assessment: {
      type: String,
      enum: ['not_met', 'partially_met', 'met', 'exceeded'],
      required: true
    },
    evidence: String,
    evidenceAr: String,
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assessmentDate: Date
  }],
  
  // Notes and Comments
  notes: [{
    content: String,
    contentAr: String,
    category: {
      type: String,
      enum: ['academic', 'behavioral', 'attendance', 'financial', 'other'],
      default: 'other'
    },
    isPrivate: {
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

// Compound indexes for better query performance
enrollmentSchema.index({ student: 1, semester: 1 });
enrollmentSchema.index({ course: 1, semester: 1 });
enrollmentSchema.index({ instructor: 1, semester: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ enrollmentDate: -1 });
enrollmentSchema.index({ 'grades.finalGrade': 1 });
enrollmentSchema.index({ 'payment.paymentStatus': 1 });

// Virtual fields
enrollmentSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed' && this.grades.finalGrade;
});

enrollmentSchema.virtual('isPassing').get(function() {
  if (this.grades.finalGrade) {
    return !['F', 'W', 'I'].includes(this.grades.finalGrade);
  }
  return false;
});

enrollmentSchema.virtual('remainingBalance').get(function() {
  return this.payment.tuitionAmount - this.payment.paidAmount - this.payment.scholarshipAmount;
});

// Pre-save middleware
enrollmentSchema.pre('save', function(next) {
  // Calculate attendance percentage
  if (this.attendance.totalSessions > 0) {
    this.attendance.attendancePercentage = Math.round(
      (this.attendance.attendedSessions / this.attendance.totalSessions) * 100
    );
  }
  
  // Calculate payment balance
  this.payment.balanceAmount = this.payment.tuitionAmount - this.payment.paidAmount - this.payment.scholarshipAmount;
  
  // Convert final grade to grade points
  if (this.grades.finalGrade) {
    this.grades.gradePoints = this.gradeToPoints(this.grades.finalGrade);
  }
  
  next();
});

// Static methods
enrollmentSchema.statics.findByStudent = function(studentId, semesterId = null) {
  const query = { student: studentId };
  if (semesterId) query.semester = semesterId;
  return this.find(query);
};

enrollmentSchema.statics.findByCourse = function(courseId, semesterId = null) {
  const query = { course: courseId };
  if (semesterId) query.semester = semesterId;
  return this.find(query);
};

enrollmentSchema.statics.findActiveEnrollments = function() {
  return this.find({ status: 'enrolled' });
};

enrollmentSchema.statics.findByInstructor = function(instructorId, semesterId = null) {
  const query = { instructor: instructorId };
  if (semesterId) query.semester = semesterId;
  return this.find(query);
};

enrollmentSchema.statics.getEnrollmentStats = function(semesterId) {
  return this.aggregate([
    { $match: { semester: mongoose.Types.ObjectId(semesterId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalCredits: { $sum: '$creditHours' }
      }
    }
  ]);
};

// Instance methods
enrollmentSchema.methods.gradeToPoints = function(grade) {
  const gradePoints = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0,
    'F': 0.0, 'I': 0.0, 'W': 0.0
  };
  
  return gradePoints[grade] || 0.0;
};

enrollmentSchema.methods.addGrade = function(assignmentData) {
  this.grades.assignments.push(assignmentData);
  this.calculateTotalPercentage();
  return this.save();
};

enrollmentSchema.methods.calculateTotalPercentage = function() {
  if (this.grades.assignments.length === 0) return 0;
  
  const totalMaxPoints = this.grades.assignments.reduce((sum, assignment) => sum + assignment.maxPoints, 0);
  const totalEarnedPoints = this.grades.assignments.reduce((sum, assignment) => sum + (assignment.earnedPoints || 0), 0);
  
  if (totalMaxPoints > 0) {
    this.grades.totalPercentage = Math.round((totalEarnedPoints / totalMaxPoints) * 100);
  }
  
  return this.grades.totalPercentage;
};

enrollmentSchema.methods.recordAttendance = function(date, status, sessionType = 'lecture', duration = 60, recordedBy) {
  this.attendance.attendanceRecords.push({
    date,
    status,
    sessionType,
    duration,
    recordedBy,
    recordedAt: new Date()
  });
  
  // Update attendance statistics
  this.attendance.totalSessions += 1;
  if (status === 'present' || status === 'late') {
    this.attendance.attendedSessions += 1;
  }
  
  this.attendance.attendancePercentage = Math.round(
    (this.attendance.attendedSessions / this.attendance.totalSessions) * 100
  );
  
  return this.save();
};

enrollmentSchema.methods.makePayment = function(amount, paymentMethod = 'cash') {
  this.payment.paidAmount += amount;
  this.payment.balanceAmount = this.payment.tuitionAmount - this.payment.paidAmount - this.payment.scholarshipAmount;
  
  if (this.payment.balanceAmount <= 0) {
    this.payment.paymentStatus = 'paid';
  } else if (this.payment.paidAmount > 0) {
    this.payment.paymentStatus = 'partial';
  }
  
  return this.save();
};

enrollmentSchema.methods.dropCourse = function(reason, droppedBy) {
  this.status = 'dropped';
  this.completionDate = new Date();
  
  this.notes.push({
    content: `Course dropped. Reason: ${reason}`,
    category: 'academic',
    addedBy: droppedBy,
    addedAt: new Date()
  });
  
  return this.save();
};

enrollmentSchema.methods.completeEnrollment = function(finalGrade, completedBy) {
  this.status = 'completed';
  this.grades.finalGrade = finalGrade;
  this.grades.gradePoints = this.gradeToPoints(finalGrade);
  this.completionDate = new Date();
  
  this.notes.push({
    content: `Course completed with grade: ${finalGrade}`,
    category: 'academic',
    addedBy: completedBy,
    addedAt: new Date()
  });
  
  return this.save();
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);