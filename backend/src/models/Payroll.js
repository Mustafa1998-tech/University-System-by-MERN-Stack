const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  // Employee Information
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Employee reference is required'],
    refPath: 'employeeType'
  },
  employeeType: {
    type: String,
    enum: ['Staff', 'Instructor'],
    required: [true, 'Employee type is required']
  },
  
  // Pay Period
  payPeriod: {
    startDate: {
      type: Date,
      required: [true, 'Pay period start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'Pay period end date is required']
    },
    payFrequency: {
      type: String,
      enum: ['weekly', 'bi_weekly', 'monthly', 'quarterly', 'annual'],
      required: [true, 'Pay frequency is required']
    },
    fiscalYear: {
      type: String,
      required: [true, 'Fiscal year is required'],
      match: [/^\d{4}$/, 'Fiscal year must be in YYYY format']
    }
  },
  
  // Basic Salary Information
  baseSalary: {
    amount: {
      type: Number,
      required: [true, 'Base salary amount is required'],
      min: [0, 'Base salary cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    annualSalary: {
      type: Number,
      min: [0, 'Annual salary cannot be negative']
    }
  },
  
  // Work Hours
  workHours: {
    regularHours: {
      type: Number,
      default: 0,
      min: [0, 'Regular hours cannot be negative']
    },
    overtimeHours: {
      type: Number,
      default: 0,
      min: [0, 'Overtime hours cannot be negative']
    },
    doubleTimeHours: {
      type: Number,
      default: 0,
      min: [0, 'Double time hours cannot be negative']
    },
    sickHours: {
      type: Number,
      default: 0,
      min: [0, 'Sick hours cannot be negative']
    },
    vacationHours: {
      type: Number,
      default: 0,
      min: [0, 'Vacation hours cannot be negative']
    },
    holidayHours: {
      type: Number,
      default: 0,
      min: [0, 'Holiday hours cannot be negative']
    }
  },
  
  // Earnings
  earnings: {
    // Regular earnings
    regularPay: {
      type: Number,
      default: 0,
      min: [0, 'Regular pay cannot be negative']
    },
    overtimePay: {
      type: Number,
      default: 0,
      min: [0, 'Overtime pay cannot be negative']
    },
    doubleTimePay: {
      type: Number,
      default: 0,
      min: [0, 'Double time pay cannot be negative']
    },
    
    // Additional earnings
    bonus: {
      amount: {
        type: Number,
        default: 0,
        min: [0, 'Bonus cannot be negative']
      },
      type: {
        type: String,
        enum: ['performance', 'holiday', 'annual', 'project', 'retention', 'other'],
        default: 'other'
      },
      description: String,
      descriptionAr: String
    },
    commission: {
      type: Number,
      default: 0,
      min: [0, 'Commission cannot be negative']
    },
    allowances: [{
      type: {
        type: String,
        enum: ['housing', 'transportation', 'meal', 'education', 'communication', 'other'],
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: [0, 'Allowance amount cannot be negative']
      },
      description: String,
      descriptionAr: String,
      isTaxable: {
        type: Boolean,
        default: true
      }
    }],
    
    // Academic-specific earnings (for instructors)
    teachingLoad: {
      courses: [{
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course'
        },
        creditHours: Number,
        payRate: Number,
        totalPay: Number
      }],
      totalTeachingPay: {
        type: Number,
        default: 0
      }
    },
    researchStipend: {
      type: Number,
      default: 0,
      min: [0, 'Research stipend cannot be negative']
    },
    supervisionFee: {
      type: Number,
      default: 0,
      min: [0, 'Supervision fee cannot be negative']
    },
    
    // Other earnings
    retroactivePay: {
      type: Number,
      default: 0
    },
    holidayPay: {
      type: Number,
      default: 0,
      min: [0, 'Holiday pay cannot be negative']
    },
    sickPay: {
      type: Number,
      default: 0,
      min: [0, 'Sick pay cannot be negative']
    },
    vacationPay: {
      type: Number,
      default: 0,
      min: [0, 'Vacation pay cannot be negative']
    }
  },
  
  // Deductions
  deductions: {
    // Tax deductions
    federalTax: {
      type: Number,
      default: 0,
      min: [0, 'Federal tax cannot be negative']
    },
    stateTax: {
      type: Number,
      default: 0,
      min: [0, 'State tax cannot be negative']
    },
    socialSecurity: {
      type: Number,
      default: 0,
      min: [0, 'Social security cannot be negative']
    },
    medicare: {
      type: Number,
      default: 0,
      min: [0, 'Medicare cannot be negative']
    },
    
    // Benefit deductions
    healthInsurance: {
      type: Number,
      default: 0,
      min: [0, 'Health insurance deduction cannot be negative']
    },
    dentalInsurance: {
      type: Number,
      default: 0,
      min: [0, 'Dental insurance deduction cannot be negative']
    },
    lifeInsurance: {
      type: Number,
      default: 0,
      min: [0, 'Life insurance deduction cannot be negative']
    },
    retirementContribution: {
      employeeContribution: {
        type: Number,
        default: 0,
        min: [0, 'Employee retirement contribution cannot be negative']
      },
      employerMatch: {
        type: Number,
        default: 0,
        min: [0, 'Employer retirement match cannot be negative']
      }
    },
    
    // Other deductions
    unionDues: {
      type: Number,
      default: 0,
      min: [0, 'Union dues cannot be negative']
    },
    garnishments: [{
      type: {
        type: String,
        enum: ['court_order', 'tax_levy', 'child_support', 'student_loan', 'other'],
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: [0, 'Garnishment amount cannot be negative']
      },
      description: String,
      caseNumber: String,
      remainingBalance: {
        type: Number,
        min: [0, 'Remaining balance cannot be negative']
      }
    }],
    
    // Voluntary deductions
    voluntaryDeductions: [{
      type: {
        type: String,
        enum: ['parking', 'gym', 'cafeteria', 'uniform', 'loan_repayment', 'charity', 'other'],
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: [0, 'Voluntary deduction amount cannot be negative']
      },
      description: String,
      descriptionAr: String
    }]
  },
  
  // Pay Summary
  paySummary: {
    grossPay: {
      type: Number,
      required: [true, 'Gross pay is required'],
      min: [0, 'Gross pay cannot be negative']
    },
    totalDeductions: {
      type: Number,
      required: [true, 'Total deductions is required'],
      min: [0, 'Total deductions cannot be negative']
    },
    netPay: {
      type: Number,
      required: [true, 'Net pay is required']
    },
    taxableIncome: {
      type: Number,
      min: [0, 'Taxable income cannot be negative']
    },
    nonTaxableIncome: {
      type: Number,
      default: 0,
      min: [0, 'Non-taxable income cannot be negative']
    }
  },
  
  // Payment Information
  payment: {
    paymentMethod: {
      type: String,
      enum: ['direct_deposit', 'check', 'cash', 'wire_transfer'],
      required: [true, 'Payment method is required']
    },
    bankAccount: {
      accountNumber: String,
      routingNumber: String,
      bankName: String,
      accountType: {
        type: String,
        enum: ['checking', 'savings']
      }
    },
    checkNumber: String,
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required']
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processed', 'paid', 'cancelled', 'failed'],
      default: 'pending'
    },
    confirmationNumber: String
  },
  
  // Tax Information
  taxInfo: {
    taxableWages: {
      type: Number,
      min: [0, 'Taxable wages cannot be negative']
    },
    federalWithholding: {
      type: Number,
      min: [0, 'Federal withholding cannot be negative']
    },
    stateWithholding: {
      type: Number,
      min: [0, 'State withholding cannot be negative']
    },
    socialSecurityWages: {
      type: Number,
      min: [0, 'Social Security wages cannot be negative']
    },
    medicareWages: {
      type: Number,
      min: [0, 'Medicare wages cannot be negative']
    },
    
    // Year-to-date totals
    ytdGrossPay: {
      type: Number,
      default: 0,
      min: [0, 'YTD gross pay cannot be negative']
    },
    ytdNetPay: {
      type: Number,
      default: 0
    },
    ytdFederalTax: {
      type: Number,
      default: 0,
      min: [0, 'YTD federal tax cannot be negative']
    },
    ytdStateTax: {
      type: Number,
      default: 0,
      min: [0, 'YTD state tax cannot be negative']
    },
    ytdSocialSecurity: {
      type: Number,
      default: 0,
      min: [0, 'YTD social security cannot be negative']
    },
    ytdMedicare: {
      type: Number,
      default: 0,
      min: [0, 'YTD medicare cannot be negative']
    }
  },
  
  // Time Off Accruals
  timeOffAccruals: {
    vacation: {
      accrued: {
        type: Number,
        default: 0,
        min: [0, 'Vacation accrued cannot be negative']
      },
      used: {
        type: Number,
        default: 0,
        min: [0, 'Vacation used cannot be negative']
      },
      balance: {
        type: Number,
        default: 0
      }
    },
    sick: {
      accrued: {
        type: Number,
        default: 0,
        min: [0, 'Sick accrued cannot be negative']
      },
      used: {
        type: Number,
        default: 0,
        min: [0, 'Sick used cannot be negative']
      },
      balance: {
        type: Number,
        default: 0
      }
    },
    personal: {
      accrued: {
        type: Number,
        default: 0,
        min: [0, 'Personal accrued cannot be negative']
      },
      used: {
        type: Number,
        default: 0,
        min: [0, 'Personal used cannot be negative']
      },
      balance: {
        type: Number,
        default: 0
      }
    }
  },
  
  // Pay Stub
  payStub: {
    payStubNumber: {
      type: String,
      required: [true, 'Pay stub number is required'],
      unique: true
    },
    generated: {
      type: Boolean,
      default: false
    },
    generatedDate: Date,
    filePath: String,
    delivered: {
      type: Boolean,
      default: false
    },
    deliveryMethod: {
      type: String,
      enum: ['email', 'print', 'portal'],
      default: 'email'
    },
    deliveryDate: Date
  },
  
  // Approval Workflow
  approval: {
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'approved', 'rejected', 'processed'],
      default: 'draft'
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submittedDate: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalDate: Date,
    rejectionReason: String,
    rejectionReasonAr: String,
    approvalNotes: String,
    approvalNotesAr: String
  },
  
  // Notes and Comments
  notes: [{
    content: String,
    contentAr: String,
    category: {
      type: String,
      enum: ['calculation', 'adjustment', 'approval', 'payment', 'other'],
      default: 'other'
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: true
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

// Indexes
payrollSchema.index({ employee: 1, 'payPeriod.startDate': -1 });
payrollSchema.index({ employeeType: 1 });
payrollSchema.index({ 'payPeriod.fiscalYear': 1 });
payrollSchema.index({ 'payment.paymentDate': -1 });
payrollSchema.index({ 'payStub.payStubNumber': 1 });
payrollSchema.index({ 'approval.status': 1 });

// Virtual fields
payrollSchema.virtual('totalEarnings').get(function() {
  const earnings = this.earnings;
  return earnings.regularPay + earnings.overtimePay + earnings.doubleTimePay + 
         earnings.bonus.amount + earnings.commission + earnings.researchStipend + 
         earnings.supervisionFee + earnings.holidayPay + earnings.sickPay + 
         earnings.vacationPay + earnings.retroactivePay +
         earnings.allowances.reduce((sum, allowance) => sum + allowance.amount, 0) +
         (earnings.teachingLoad.totalTeachingPay || 0);
});

payrollSchema.virtual('totalTaxDeductions').get(function() {
  return this.deductions.federalTax + this.deductions.stateTax + 
         this.deductions.socialSecurity + this.deductions.medicare;
});

payrollSchema.virtual('totalBenefitDeductions').get(function() {
  return this.deductions.healthInsurance + this.deductions.dentalInsurance + 
         this.deductions.lifeInsurance + this.deductions.retirementContribution.employeeContribution;
});

// Pre-save middleware
payrollSchema.pre('save', function(next) {
  // Calculate gross pay
  this.paySummary.grossPay = this.totalEarnings;
  
  // Calculate total deductions
  this.paySummary.totalDeductions = 
    this.totalTaxDeductions + 
    this.totalBenefitDeductions + 
    this.deductions.unionDues +
    this.deductions.garnishments.reduce((sum, garnishment) => sum + garnishment.amount, 0) +
    this.deductions.voluntaryDeductions.reduce((sum, deduction) => sum + deduction.amount, 0);
  
  // Calculate net pay
  this.paySummary.netPay = this.paySummary.grossPay - this.paySummary.totalDeductions;
  
  // Calculate taxable income
  const nonTaxableAllowances = this.earnings.allowances
    .filter(allowance => !allowance.isTaxable)
    .reduce((sum, allowance) => sum + allowance.amount, 0);
  
  this.paySummary.taxableIncome = this.paySummary.grossPay - nonTaxableAllowances;
  this.paySummary.nonTaxableIncome = nonTaxableAllowances;
  
  // Generate pay stub number if not exists
  if (!this.payStub.payStubNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = String(date.getTime()).slice(-6);
    this.payStub.payStubNumber = `PS${year}${month}${day}${time}`;
  }
  
  // Update time off balances
  this.timeOffAccruals.vacation.balance = 
    this.timeOffAccruals.vacation.accrued - this.timeOffAccruals.vacation.used;
  this.timeOffAccruals.sick.balance = 
    this.timeOffAccruals.sick.accrued - this.timeOffAccruals.sick.used;
  this.timeOffAccruals.personal.balance = 
    this.timeOffAccruals.personal.accrued - this.timeOffAccruals.personal.used;
  
  next();
});

// Static methods
payrollSchema.statics.findByEmployee = function(employeeId, fiscalYear = null) {
  const query = { employee: employeeId };
  if (fiscalYear) query['payPeriod.fiscalYear'] = fiscalYear;
  return this.find(query).sort({ 'payPeriod.startDate': -1 });
};

payrollSchema.statics.findByPayPeriod = function(startDate, endDate) {
  return this.find({
    'payPeriod.startDate': { $gte: startDate },
    'payPeriod.endDate': { $lte: endDate }
  });
};

payrollSchema.statics.getPayrollSummary = function(fiscalYear) {
  return this.aggregate([
    { $match: { 'payPeriod.fiscalYear': fiscalYear } },
    {
      $group: {
        _id: null,
        totalEmployees: { $sum: 1 },
        totalGrossPay: { $sum: '$paySummary.grossPay' },
        totalNetPay: { $sum: '$paySummary.netPay' },
        totalDeductions: { $sum: '$paySummary.totalDeductions' },
        averageGrossPay: { $avg: '$paySummary.grossPay' },
        averageNetPay: { $avg: '$paySummary.netPay' }
      }
    }
  ]);
};

// Instance methods
payrollSchema.methods.calculateOvertimePay = function(overtimeRate = 1.5) {
  const hourlyRate = this.baseSalary.amount / (this.workHours.regularHours || 1);
  this.earnings.overtimePay = this.workHours.overtimeHours * hourlyRate * overtimeRate;
  return this.save();
};

payrollSchema.methods.addBonus = function(amount, type, description, descriptionAr) {
  this.earnings.bonus = {
    amount,
    type,
    description,
    descriptionAr
  };
  return this.save();
};

payrollSchema.methods.addAllowance = function(type, amount, description, descriptionAr, isTaxable = true) {
  this.earnings.allowances.push({
    type,
    amount,
    description,
    descriptionAr,
    isTaxable
  });
  return this.save();
};

payrollSchema.methods.addGarnishment = function(type, amount, description, caseNumber, remainingBalance) {
  this.deductions.garnishments.push({
    type,
    amount,
    description,
    caseNumber,
    remainingBalance
  });
  return this.save();
};

payrollSchema.methods.submitForApproval = function(submittedBy) {
  this.approval.status = 'pending_approval';
  this.approval.submittedBy = submittedBy;
  this.approval.submittedDate = new Date();
  return this.save();
};

payrollSchema.methods.approve = function(approvedBy, notes, notesAr) {
  this.approval.status = 'approved';
  this.approval.approvedBy = approvedBy;
  this.approval.approvalDate = new Date();
  this.approval.approvalNotes = notes;
  this.approval.approvalNotesAr = notesAr;
  return this.save();
};

payrollSchema.methods.reject = function(rejectedBy, reason, reasonAr) {
  this.approval.status = 'rejected';
  this.approval.approvedBy = rejectedBy;
  this.approval.approvalDate = new Date();
  this.approval.rejectionReason = reason;
  this.approval.rejectionReasonAr = reasonAr;
  return this.save();
};

payrollSchema.methods.processPayment = function(paymentMethod, bankAccount) {
  this.payment.paymentMethod = paymentMethod;
  if (bankAccount) {
    this.payment.bankAccount = bankAccount;
  }
  this.payment.paymentStatus = 'processed';
  this.approval.status = 'processed';
  return this.save();
};

payrollSchema.methods.generatePayStub = function() {
  this.payStub.generated = true;
  this.payStub.generatedDate = new Date();
  // TODO: Generate actual PDF file
  this.payStub.filePath = `/paystubs/${this.payStub.payStubNumber}.pdf`;
  return this.save();
};

module.exports = mongoose.model('Payroll', payrollSchema);