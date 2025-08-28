const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  // Course Identification
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{2,4}\d{3,4}$/, 'Course code must be in format like CS101 or MATH1001']
  },
  
  // Course Information
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Course title cannot exceed 200 characters']
  },
  titleAr: {
    type: String,
    trim: true,
    maxlength: [200, 'Arabic course title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [2000, 'Course description cannot exceed 2000 characters']
  },
  descriptionAr: {
    type: String,
    maxlength: [2000, 'Arabic course description cannot exceed 2000 characters']
  },
  
  // Academic Details
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
  
  // Credit Information
  creditHours: {
    type: Number,
    required: [true, 'Credit hours is required'],
    min: [1, 'Credit hours must be at least 1'],
    max: [6, 'Credit hours cannot exceed 6']
  },
  contactHours: {
    lecture: {
      type: Number,
      default: 0,
      min: [0, 'Lecture hours cannot be negative']
    },
    lab: {
      type: Number,
      default: 0,
      min: [0, 'Lab hours cannot be negative']
    },
    tutorial: {
      type: Number,
      default: 0,
      min: [0, 'Tutorial hours cannot be negative']
    }
  },
  
  // Course Level and Type
  level: {
    type: String,
    enum: {
      values: ['undergraduate', 'graduate', 'doctoral'],
      message: 'Level must be one of: undergraduate, graduate, doctoral'
    },
    default: 'undergraduate'
  },
  courseType: {
    type: String,
    enum: {
      values: ['core', 'elective', 'major', 'minor', 'general'],
      message: 'Course type must be one of: core, elective, major, minor, general'
    },
    default: 'core'
  },
  
  // Prerequisites
  prerequisites: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    minimumGrade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'],
      default: 'C'
    }
  }],
  corequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  
  // Course Status
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'archived'],
      message: 'Status must be one of: active, inactive, archived'
    },
    default: 'active'
  },
  
  // Learning Outcomes
  learningOutcomes: [{
    outcome: {
      type: String,
      required: true
    },
    outcomeAr: String,
    bloomLevel: {
      type: String,
      enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']
    }
  }],
  
  // Course Content
  syllabus: {
    overview: String,
    overviewAr: String,
    topics: [{
      week: Number,
      topic: String,
      topicAr: String,
      learningObjectives: [String],
      learningObjectivesAr: [String]
    }],
    textbooks: [{
      title: String,
      author: String,
      isbn: String,
      edition: String,
      isRequired: {
        type: Boolean,
        default: true
      }
    }],
    references: [{
      title: String,
      author: String,
      type: {
        type: String,
        enum: ['book', 'journal', 'website', 'other'],
        default: 'book'
      }
    }]
  },
  
  // Assessment Methods
  assessmentMethods: [{
    type: {
      type: String,
      enum: ['exam', 'quiz', 'assignment', 'project', 'presentation', 'participation'],
      required: true
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative'],
      max: [100, 'Weight cannot exceed 100']
    },
    description: String,
    descriptionAr: String
  }],
  
  // Delivery Mode
  deliveryMode: {
    type: String,
    enum: {
      values: ['in-person', 'online', 'hybrid'],
      message: 'Delivery mode must be one of: in-person, online, hybrid'
    },
    default: 'in-person'
  },
  
  // Schedule Template
  scheduleTemplate: {
    days: [{
      type: String,
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    }],
    timeSlot: {
      start: String, // Format: "HH:MM"
      end: String    // Format: "HH:MM"
    },
    room: String,
    building: String
  },
  
  // Capacity
  maxCapacity: {
    type: Number,
    min: [1, 'Maximum capacity must be at least 1'],
    default: 30
  },
  minEnrollment: {
    type: Number,
    min: [1, 'Minimum enrollment must be at least 1'],
    default: 5
  },
  
  // Academic Regulations
  attendanceRequired: {
    type: Boolean,
    default: true
  },
  minimumAttendance: {
    type: Number,
    min: [0, 'Minimum attendance cannot be negative'],
    max: [100, 'Minimum attendance cannot exceed 100'],
    default: 75
  },
  
  // Grading Scale
  gradingScale: [{
    grade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F']
    },
    minPercentage: {
      type: Number,
      min: [0, 'Minimum percentage cannot be negative'],
      max: [100, 'Minimum percentage cannot exceed 100']
    },
    gradePoints: {
      type: Number,
      min: [0, 'Grade points cannot be negative'],
      max: [4, 'Grade points cannot exceed 4']
    }
  }],
  
  // Course Materials
  materials: [{
    title: String,
    titleAr: String,
    type: {
      type: String,
      enum: ['lecture_note', 'slide', 'video', 'document', 'link', 'assignment'],
      required: true
    },
    filename: String,
    path: String,
    url: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isPublic: {
      type: Boolean,
      default: false
    }
  }],
  
  // Statistics
  statistics: {
    totalEnrollments: {
      type: Number,
      default: 0
    },
    averageGPA: {
      type: Number,
      default: 0
    },
    passRate: {
      type: Number,
      default: 0
    },
    dropRate: {
      type: Number,
      default: 0
    }
  },
  
  // Audit Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
courseSchema.virtual('fullCode').get(function() {
  return `${this.courseCode}: ${this.title}`;
});

courseSchema.virtual('totalContactHours').get(function() {
  return this.contactHours.lecture + this.contactHours.lab + this.contactHours.tutorial;
});

courseSchema.virtual('currentEnrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'course',
  count: true,
  match: { status: 'enrolled' }
});

// Indexes
courseSchema.index({ courseCode: 1 });
courseSchema.index({ department: 1 });
courseSchema.index({ faculty: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ courseType: 1 });
courseSchema.index({ title: 'text', titleAr: 'text', description: 'text' });

// Pre-save middleware
courseSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Static methods
courseSchema.statics.findByCourseCode = function(courseCode) {
  return this.findOne({ courseCode: courseCode.toUpperCase() });
};

courseSchema.statics.findActiveCourses = function() {
  return this.find({ status: 'active' });
};

courseSchema.statics.findByDepartment = function(departmentId) {
  return this.find({ department: departmentId, status: 'active' });
};

courseSchema.statics.findByLevel = function(level) {
  return this.find({ level, status: 'active' });
};

courseSchema.statics.findElectives = function() {
  return this.find({ courseType: 'elective', status: 'active' });
};

courseSchema.statics.searchCourses = function(searchTerm) {
  return this.find({
    $and: [
      { status: 'active' },
      {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { titleAr: { $regex: searchTerm, $options: 'i' } },
          { courseCode: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ]
  });
};

// Instance methods
courseSchema.methods.checkPrerequisites = function(studentCourses) {
  const unmetPrerequisites = [];
  
  for (const prereq of this.prerequisites) {
    const completedCourse = studentCourses.find(
      course => course.course.toString() === prereq.course.toString() && 
                 course.grade && 
                 this.isGradeAcceptable(course.grade, prereq.minimumGrade)
    );
    
    if (!completedCourse) {
      unmetPrerequisites.push(prereq);
    }
  }
  
  return unmetPrerequisites;
};

courseSchema.methods.isGradeAcceptable = function(achievedGrade, minimumGrade) {
  const gradeValues = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  
  return gradeValues[achievedGrade] >= gradeValues[minimumGrade];
};

courseSchema.methods.updateStatistics = async function() {
  const Enrollment = mongoose.model('Enrollment');
  
  const enrollments = await Enrollment.find({ course: this._id });
  
  this.statistics.totalEnrollments = enrollments.length;
  
  const completedEnrollments = enrollments.filter(e => e.status === 'completed' && e.finalGrade);
  
  if (completedEnrollments.length > 0) {
    const gradePoints = completedEnrollments.map(e => this.gradeToPoints(e.finalGrade));
    this.statistics.averageGPA = gradePoints.reduce((sum, gp) => sum + gp, 0) / gradePoints.length;
    
    const passedCount = gradePoints.filter(gp => gp >= 1.0).length;
    this.statistics.passRate = (passedCount / completedEnrollments.length) * 100;
  }
  
  const droppedCount = enrollments.filter(e => e.status === 'dropped').length;
  if (enrollments.length > 0) {
    this.statistics.dropRate = (droppedCount / enrollments.length) * 100;
  }
  
  return this.save();
};

courseSchema.methods.gradeToPoints = function(grade) {
  const gradePoints = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };
  
  return gradePoints[grade] || 0.0;
};

module.exports = mongoose.model('Course', courseSchema);