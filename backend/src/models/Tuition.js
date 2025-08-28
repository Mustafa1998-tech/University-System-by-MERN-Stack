const mongoose = require('mongoose');

const tuitionSchema = new mongoose.Schema({
  // Student Information
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student reference is required']
  },
  
  // Academic Period
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY']
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'Semester reference is required']
  },
  
  // Tuition Structure
  tuitionType: {
    type: String,
    enum: {
      values: ['undergraduate', 'graduate', 'doctoral', 'continuing_education', 'summer', 'international'],
      message: 'Tuition type must be one of: undergraduate, graduate, doctoral, continuing_education, summer, international'
    },
    required: [true, 'Tuition type is required']
  },
  
  // Fee Breakdown
  fees: {
    // Basic tuition fees
    tuitionFee: {
      type: Number,
      required: [true, 'Tuition fee is required'],
      min: [0, 'Tuition fee cannot be negative']
    },
    
    // Administrative fees
    registrationFee: {
      type: Number,
      default: 0,
      min: [0, 'Registration fee cannot be negative']
    },
    laboratoryFee: {
      type: Number,
      default: 0,
      min: [0, 'Laboratory fee cannot be negative']
    },
    libraryFee: {
      type: Number,
      default: 0,
      min: [0, 'Library fee cannot be negative']
    },
    technologyFee: {
      type: Number,
      default: 0,
      min: [0, 'Technology fee cannot be negative']
    },
    studentActivityFee: {
      type: Number,
      default: 0,
      min: [0, 'Student activity fee cannot be negative']
    },
    healthServiceFee: {
      type: Number,
      default: 0,
      min: [0, 'Health service fee cannot be negative']
    },
    graduationFee: {
      type: Number,
      default: 0,
      min: [0, 'Graduation fee cannot be negative']
    },
    
    // Variable fees
    creditHourFee: {
      rate: {
        type: Number,
        default: 0,
        min: [0, 'Credit hour rate cannot be negative']
      },
      creditHours: {
        type: Number,
        default: 0,
        min: [0, 'Credit hours cannot be negative']
      },
      total: {
        type: Number,
        default: 0,
        min: [0, 'Credit hour total cannot be negative']
      }
    },
    
    // Additional fees
    lateFee: {
      type: Number,
      default: 0,
      min: [0, 'Late fee cannot be negative']
    },
    materialFee: {
      type: Number,
      default: 0,
      min: [0, 'Material fee cannot be negative']
    },
    examFee: {
      type: Number,
      default: 0,
      min: [0, 'Exam fee cannot be negative']
    },
    transcriptFee: {
      type: Number,
      default: 0,
      min: [0, 'Transcript fee cannot be negative']
    },
    
    // Custom fees
    customFees: [{
      description: String,
      descriptionAr: String,
      amount: {
        type: Number,
        required: true,
        min: [0, 'Custom fee amount cannot be negative']
      },
      category: {
        type: String,
        enum: ['academic', 'administrative', 'service', 'penalty', 'other'],
        default: 'other'
      }
    }]
  },
  
  // Financial Summary
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  
  // Discounts and Scholarships
  discounts: [{
    type: {
      type: String,
      enum: ['scholarship', 'grant', 'employee_discount', 'sibling_discount', 'merit_discount', 'need_based', 'other'],
      required: true
    },
    name: String,
    nameAr: String,
    amount: {
      type: Number,
      required: true,
      min: [0, 'Discount amount cannot be negative']
    },
    percentage: {
      type: Number,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100']
    },
    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date,
    conditions: String,
    conditionsAr: String
  }],
  
  // Payment Information
  payments: [{
    paymentId: {
      type: String,
      required: true,
      unique: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Payment amount cannot be negative']
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'online', 'mobile_payment'],
      required: true
    },
    paymentDate: {
      type: Date,
      required: true
    },
    transactionReference: String,
    paymentGateway: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'completed'
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    receipt: {
      receiptNumber: String,
      issueDate: Date,
      filePath: String
    },
    notes: String,
    notesAr: String
  }],
  
  // Payment Plan
  paymentPlan: {
    isOnPaymentPlan: {
      type: Boolean,
      default: false
    },
    planType: {
      type: String,
      enum: ['monthly', 'quarterly', 'custom'],
      default: 'monthly'
    },
    installments: [{
      installmentNumber: Number,
      dueDate: Date,
      amount: Number,
      status: {
        type: String,
        enum: ['pending', 'paid', 'overdue', 'waived'],
        default: 'pending'
      },
      paidDate: Date,
      paidAmount: Number,
      lateFee: {
        type: Number,
        default: 0
      }
    }],
    setupFee: {
      type: Number,
      default: 0
    },
    agreementDate: Date,
    agreementBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Financial Status
  financialStatus: {
    totalPaid: {
      type: Number,
      default: 0,
      min: [0, 'Total paid cannot be negative']
    },
    totalDiscount: {
      type: Number,
      default: 0,
      min: [0, 'Total discount cannot be negative']
    },
    balance: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'overpaid', 'refunded'],
      default: 'unpaid'
    },
    lastPaymentDate: Date
  },
  
  // Important Dates
  invoiceDate: {
    type: Date,
    required: [true, 'Invoice date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  finalDueDate: Date,
  
  // Hold Information
  holds: [{
    type: {
      type: String,
      enum: ['financial', 'academic', 'administrative', 'disciplinary'],
      required: true
    },
    reason: String,
    reasonAr: String,
    placedDate: {
      type: Date,
      default: Date.now
    },
    placedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    removedDate: Date,
    removedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Refunds
  refunds: [{
    refundId: {
      type: String,
      required: true,
      unique: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Refund amount cannot be negative']
    },
    reason: String,
    reasonAr: String,
    refundMethod: {
      type: String,
      enum: ['cash', 'check', 'bank_transfer', 'credit_card_reversal', 'other'],
      required: true
    },
    requestDate: {
      type: Date,
      default: Date.now
    },
    approvedDate: Date,
    processedDate: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['requested', 'approved', 'processed', 'rejected'],
      default: 'requested'
    },
    notes: String,
    notesAr: String
  }],
  
  // Communication History
  communications: [{
    type: {
      type: String,
      enum: ['reminder', 'notice', 'warning', 'payment_confirmation', 'other'],
      required: true
    },
    method: {
      type: String,
      enum: ['email', 'sms', 'letter', 'phone', 'in_person'],
      required: true
    },
    subject: String,
    subjectAr: String,
    content: String,
    contentAr: String,
    sentDate: {
      type: Date,
      default: Date.now
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    delivered: {
      type: Boolean,
      default: false
    },
    deliveryDate: Date
  }],
  
  // Currency and Exchange
  currency: {
    type: String,
    default: 'USD',
    required: true
  },
  exchangeRate: {
    type: Number,
    default: 1,
    min: [0, 'Exchange rate cannot be negative']
  },
  
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
tuitionSchema.virtual('totalFees').get(function() {
  const fees = this.fees;
  return fees.tuitionFee + fees.registrationFee + fees.laboratoryFee + 
         fees.libraryFee + fees.technologyFee + fees.studentActivityFee + 
         fees.healthServiceFee + fees.graduationFee + fees.lateFee + 
         fees.materialFee + fees.examFee + fees.transcriptFee + 
         (fees.creditHourFee.total || 0) + 
         (fees.customFees.reduce((sum, fee) => sum + fee.amount, 0));
});

tuitionSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.financialStatus.status !== 'paid';
});

tuitionSchema.virtual('daysOverdue').get(function() {
  if (this.isOverdue) {
    return Math.floor((Date.now() - this.dueDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Indexes
tuitionSchema.index({ student: 1, academicYear: 1, semester: 1 });
tuitionSchema.index({ 'financialStatus.status': 1 });
tuitionSchema.index({ dueDate: 1 });
tuitionSchema.index({ invoiceDate: -1 });
tuitionSchema.index({ 'payments.paymentId': 1 });

// Pre-save middleware
tuitionSchema.pre('save', function(next) {
  // Calculate credit hour total
  this.fees.creditHourFee.total = this.fees.creditHourFee.rate * this.fees.creditHourFee.creditHours;
  
  // Calculate total discount
  this.financialStatus.totalDiscount = this.discounts.reduce((sum, discount) => sum + discount.amount, 0);
  
  // Calculate total amount
  this.totalAmount = this.totalFees - this.financialStatus.totalDiscount;
  
  // Calculate balance
  this.financialStatus.balance = this.totalAmount - this.financialStatus.totalPaid;
  
  // Update financial status
  if (this.financialStatus.balance <= 0) {
    this.financialStatus.status = this.financialStatus.balance < 0 ? 'overpaid' : 'paid';
  } else if (this.financialStatus.totalPaid > 0) {
    this.financialStatus.status = 'partial';
  } else {
    this.financialStatus.status = 'unpaid';
  }
  
  next();
});

// Static methods
tuitionSchema.statics.findByStudent = function(studentId, academicYear = null) {
  const query = { student: studentId };
  if (academicYear) query.academicYear = academicYear;
  return this.find(query);
};

tuitionSchema.statics.findOverdue = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    'financialStatus.status': { $in: ['unpaid', 'partial'] }
  });
};

tuitionSchema.statics.findByStatus = function(status) {
  return this.find({ 'financialStatus.status': status });
};

tuitionSchema.statics.getFinancialSummary = function(academicYear) {
  return this.aggregate([
    { $match: { academicYear } },
    {
      $group: {
        _id: '$financialStatus.status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        totalPaid: { $sum: '$financialStatus.totalPaid' },
        totalBalance: { $sum: '$financialStatus.balance' }
      }
    }
  ]);
};

// Instance methods
tuitionSchema.methods.addPayment = function(paymentData) {
  const payment = {
    paymentId: paymentData.paymentId || `PAY${Date.now()}`,
    amount: paymentData.amount,
    paymentMethod: paymentData.paymentMethod,
    paymentDate: paymentData.paymentDate || new Date(),
    transactionReference: paymentData.transactionReference,
    status: paymentData.status || 'completed',
    processedBy: paymentData.processedBy,
    notes: paymentData.notes
  };
  
  this.payments.push(payment);
  this.financialStatus.totalPaid += payment.amount;
  this.financialStatus.lastPaymentDate = payment.paymentDate;
  
  return this.save();
};

tuitionSchema.methods.addDiscount = function(discountData) {
  this.discounts.push(discountData);
  return this.save();
};

tuitionSchema.methods.generatePaymentPlan = function(planType, numberOfInstallments) {
  const totalAmount = this.totalAmount - this.financialStatus.totalDiscount - this.financialStatus.totalPaid;
  const installmentAmount = totalAmount / numberOfInstallments;
  
  this.paymentPlan.isOnPaymentPlan = true;
  this.paymentPlan.planType = planType;
  this.paymentPlan.installments = [];
  
  for (let i = 1; i <= numberOfInstallments; i++) {
    const dueDate = new Date();
    if (planType === 'monthly') {
      dueDate.setMonth(dueDate.getMonth() + i);
    } else if (planType === 'quarterly') {
      dueDate.setMonth(dueDate.getMonth() + (i * 3));
    }
    
    this.paymentPlan.installments.push({
      installmentNumber: i,
      dueDate,
      amount: installmentAmount,
      status: 'pending'
    });
  }
  
  return this.save();
};

tuitionSchema.methods.addHold = function(type, reason, reasonAr, placedBy) {
  this.holds.push({
    type,
    reason,
    reasonAr,
    placedBy,
    placedDate: new Date(),
    isActive: true
  });
  
  return this.save();
};

tuitionSchema.methods.removeHold = function(holdId, removedBy) {
  const hold = this.holds.id(holdId);
  if (hold) {
    hold.isActive = false;
    hold.removedDate = new Date();
    hold.removedBy = removedBy;
  }
  
  return this.save();
};

tuitionSchema.methods.requestRefund = function(amount, reason, reasonAr, refundMethod) {
  const refund = {
    refundId: `REF${Date.now()}`,
    amount,
    reason,
    reasonAr,
    refundMethod,
    requestDate: new Date(),
    status: 'requested'
  };
  
  this.refunds.push(refund);
  return this.save();
};

tuitionSchema.methods.sendReminder = function(type, method, subject, content, sentBy) {
  this.communications.push({
    type,
    method,
    subject,
    content,
    sentDate: new Date(),
    sentBy
  });
  
  return this.save();
};

module.exports = mongoose.model('Tuition', tuitionSchema);