const Student = require('../../../src/models/Student');
const User = require('../../../src/models/User');
const Department = require('../../../src/models/Department');
const Faculty = require('../../../src/models/Faculty');

describe('Student Model', () => {
  let testUser;
  let testDepartment;
  let testFaculty;

  beforeEach(async () => {
    // Create test user
    testUser = await createTestUser({
      email: 'student@university.edu',
      role: 'student'
    });

    // Create test faculty and department
    testFaculty = await Faculty.create({
      name: 'كلية الهندسة',
      nameEn: 'College of Engineering',
      code: 'ENG',
      description: 'كلية الهندسة',
      descriptionEn: 'College of Engineering'
    });

    testDepartment = await Department.create({
      name: 'علوم الحاسوب',
      nameEn: 'Computer Science',
      code: 'CS',
      faculty: testFaculty._id,
      description: 'قسم علوم الحاسوب',
      descriptionEn: 'Computer Science Department'
    });
  });

  describe('Student Creation', () => {
    it('should create a valid student', async () => {
      const studentData = {
        studentId: 'STU123456',
        userId: testUser._id,
        department: testDepartment._id,
        faculty: testFaculty._id,
        program: testDepartment._id, // Using department as program for testing
        academicYear: '2024-2025',
        admissionDate: new Date('2024-09-01'),
        currentSemester: 1
      };

      const student = new Student(studentData);
      const savedStudent = await student.save();

      expect(savedStudent._id).toBeDefined();
      expect(savedStudent.studentId).toBe(studentData.studentId);
      expect(savedStudent.userId.toString()).toBe(testUser._id.toString());
      expect(savedStudent.department.toString()).toBe(testDepartment._id.toString());
      expect(savedStudent.status).toBe('active'); // Default value
      expect(savedStudent.classification).toBe('freshman'); // Default value
    });

    it('should fail with missing required fields', async () => {
      const incompleteStudent = new Student({
        studentId: 'STU123457'
        // Missing required fields
      });

      await expect(incompleteStudent.save()).rejects.toThrow();
    });

    it('should enforce unique student ID', async () => {
      const studentData = {
        studentId: 'STU123458',
        userId: testUser._id,
        department: testDepartment._id,
        faculty: testFaculty._id,
        program: testDepartment._id,
        academicYear: '2024-2025'
      };

      // Create first student
      await Student.create(studentData);

      // Create another user for second student
      const secondUser = await createTestUser({
        email: 'student2@university.edu',
        role: 'student'
      });

      // Try to create another student with same ID
      const duplicateStudent = new Student({
        ...studentData,
        userId: secondUser._id
      });

      await expect(duplicateStudent.save()).rejects.toThrow(/duplicate key error/);
    });
  });

  describe('Student ID Validation', () => {
    it('should accept valid student IDs', async () => {
      const validIds = ['STU123456', 'STU789012', 'STU000001', 'STU999999'];

      for (let i = 0; i < validIds.length; i++) {
        const id = validIds[i];
        const user = await createTestUser({
          email: `student${i}@university.edu`,
          role: 'student'
        });

        const studentData = {
          studentId: id,
          userId: user._id,
          department: testDepartment._id,
          faculty: testFaculty._id,
          program: testDepartment._id,
          academicYear: '2024-2025'
        };

        const student = new Student(studentData);
        await expect(student.save()).resolves.toBeTruthy();
      }
    });

    it('should reject invalid student IDs', async () => {
      const invalidIds = ['stu123456', 'STU12345', 'STU1234567', 'ABC123456', '123456'];

      for (let i = 0; i < invalidIds.length; i++) {
        const id = invalidIds[i];
        const user = await createTestUser({
          email: `invalid${i}@university.edu`,
          role: 'student'
        });

        const studentData = {
          studentId: id,
          userId: user._id,
          department: testDepartment._id,
          faculty: testFaculty._id,
          program: testDepartment._id,
          academicYear: '2024-2025'
        };

        const student = new Student(studentData);
        await expect(student.save()).rejects.toThrow();
      }
    });

    it('should convert student ID to uppercase', async () => {
      const studentData = {
        studentId: 'stu654321',
        userId: testUser._id,
        department: testDepartment._id,
        faculty: testFaculty._id,
        program: testDepartment._id,
        academicYear: '2024-2025'
      };

      const student = new Student(studentData);
      await student.save();

      expect(student.studentId).toBe('STU654321');
    });
  });

  describe('Academic Year Validation', () => {
    it('should accept valid academic year format', async () => {
      const validYears = ['2024-2025', '2023-2024', '2025-2026'];

      for (let i = 0; i < validYears.length; i++) {
        const year = validYears[i];
        const user = await createTestUser({
          email: `year${i}@university.edu`,
          role: 'student'
        });

        const studentData = {
          studentId: `STU${100000 + i}`,
          userId: user._id,
          department: testDepartment._id,
          faculty: testFaculty._id,
          program: testDepartment._id,
          academicYear: year
        };

        const student = new Student(studentData);
        const savedStudent = await student.save();
        expect(savedStudent.academicYear).toBe(year);
      }
    });

    it('should reject invalid academic year format', async () => {
      const invalidYears = ['2024', '24-25', '2024/2025', '2024-25'];

      for (let i = 0; i < invalidYears.length; i++) {
        const year = invalidYears[i];
        const user = await createTestUser({
          email: `invalidyear${i}@university.edu`,
          role: 'student'
        });

        const studentData = {
          studentId: `STU${200000 + i}`,
          userId: user._id,
          department: testDepartment._id,
          faculty: testFaculty._id,
          program: testDepartment._id,
          academicYear: year
        };

        const student = new Student(studentData);
        await expect(student.save()).rejects.toThrow();
      }
    });
  });

  describe('Current Semester Validation', () => {
    it('should accept valid semester numbers', async () => {
      const validSemesters = [1, 2, 3, 8, 12];

      for (let i = 0; i < validSemesters.length; i++) {
        const semester = validSemesters[i];
        const user = await createTestUser({
          email: `sem${i}@university.edu`,
          role: 'student'
        });

        const studentData = {
          studentId: `STU${300000 + i}`,
          userId: user._id,
          department: testDepartment._id,
          faculty: testFaculty._id,
          program: testDepartment._id,
          academicYear: '2024-2025',
          currentSemester: semester
        };

        const student = new Student(studentData);
        const savedStudent = await student.save();
        expect(savedStudent.currentSemester).toBe(semester);
      }
    });

    it('should reject invalid semester numbers', async () => {
      const invalidSemesters = [0, -1, 13, 20];

      for (let i = 0; i < invalidSemesters.length; i++) {
        const semester = invalidSemesters[i];
        const user = await createTestUser({
          email: `invalidsem${i}@university.edu`,
          role: 'student'
        });

        const studentData = {
          studentId: `STU${400000 + i}`,
          userId: user._id,
          department: testDepartment._id,
          faculty: testFaculty._id,
          program: testDepartment._id,
          academicYear: '2024-2025',
          currentSemester: semester
        };

        const student = new Student(studentData);
        await expect(student.save()).rejects.toThrow();
      }
    });
  });

  describe('GPA Validation', () => {
    it('should accept valid GPA values', async () => {
      const validGPAs = [0, 2.5, 3.75, 4.0];

      for (let i = 0; i < validGPAs.length; i++) {
        const gpa = validGPAs[i];
        const user = await createTestUser({
          email: `gpa${i}@university.edu`,
          role: 'student'
        });

        const studentData = {
          studentId: `STU${500000 + i}`,
          userId: user._id,
          department: testDepartment._id,
          faculty: testFaculty._id,
          program: testDepartment._id,
          academicYear: '2024-2025',
          gpa: {
            current: gpa,
            cumulative: gpa
          }
        };

        const student = new Student(studentData);
        const savedStudent = await student.save();
        expect(savedStudent.gpa.current).toBe(gpa);
        expect(savedStudent.gpa.cumulative).toBe(gpa);
      }
    });

    it('should reject invalid GPA values', async () => {
      const invalidGPAs = [-1, 4.1, 5.0];

      for (let i = 0; i < invalidGPAs.length; i++) {
        const gpa = invalidGPAs[i];
        const user = await createTestUser({
          email: `invalidgpa${i}@university.edu`,
          role: 'student'
        });

        const studentData = {
          studentId: `STU${600000 + i}`,
          userId: user._id,
          department: testDepartment._id,
          faculty: testFaculty._id,
          program: testDepartment._id,
          academicYear: '2024-2025',
          gpa: {
            current: gpa,
            cumulative: gpa
          }
        };

        const student = new Student(studentData);
        await expect(student.save()).rejects.toThrow();
      }
    });

    it('should set default GPA to 0', async () => {
      const studentData = {
        studentId: 'STU700000',
        userId: testUser._id,
        department: testDepartment._id,
        faculty: testFaculty._id,
        program: testDepartment._id,
        academicYear: '2024-2025'
      };

      const student = new Student(studentData);
      const savedStudent = await student.save();

      expect(savedStudent.gpa.current).toBe(0);
      expect(savedStudent.gpa.cumulative).toBe(0);
    });
  });

  describe('Student Status Validation', () => {
    it('should validate status values', async () => {
      const validStatuses = ['active', 'inactive', 'suspended', 'graduated', 'transferred', 'withdrawn'];

      for (let i = 0; i < validStatuses.length; i++) {
        const status = validStatuses[i];
        const user = await createTestUser({
          email: `status${i}@university.edu`,
          role: 'student'
        });

        const studentData = {
          studentId: `STU${800000 + i}`,
          userId: user._id,
          department: testDepartment._id,
          faculty: testFaculty._id,
          program: testDepartment._id,
          academicYear: '2024-2025',
          status: status
        };

        const student = new Student(studentData);
        const savedStudent = await student.save();
        expect(savedStudent.status).toBe(status);
      }
    });

    it('should reject invalid status values', async () => {
      const user = await createTestUser({
        email: 'invalidstatus@university.edu',
        role: 'student'
      });

      const studentData = {
        studentId: 'STU800010',
        userId: user._id,
        department: testDepartment._id,
        faculty: testFaculty._id,
        program: testDepartment._id,
        academicYear: '2024-2025',
        status: 'invalid-status'
      };

      const student = new Student(studentData);
      await expect(student.save()).rejects.toThrow();
    });
  });

  describe('Classification Validation', () => {
    it('should validate classification values', async () => {
      const validClassifications = ['freshman', 'sophomore', 'junior', 'senior', 'graduate'];

      for (let i = 0; i < validClassifications.length; i++) {
        const classification = validClassifications[i];
        const user = await createTestUser({
          email: `class${i}@university.edu`,
          role: 'student'
        });

        const studentData = {
          studentId: `STU${900000 + i}`,
          userId: user._id,
          department: testDepartment._id,
          faculty: testFaculty._id,
          program: testDepartment._id,
          academicYear: '2024-2025',
          classification: classification
        };

        const student = new Student(studentData);
        const savedStudent = await student.save();
        expect(savedStudent.classification).toBe(classification);
      }
    });

    it('should reject invalid classification values', async () => {
      const user = await createTestUser({
        email: 'invalidclass@university.edu',
        role: 'student'
      });

      const studentData = {
        studentId: 'STU900010',
        userId: user._id,
        department: testDepartment._id,
        faculty: testFaculty._id,
        program: testDepartment._id,
        academicYear: '2024-2025',
        classification: 'invalid-classification'
      };

      const student = new Student(studentData);
      await expect(student.save()).rejects.toThrow();
    });
  });

  describe('Credits Validation', () => {
    it('should accept valid credit values', async () => {
      const user = await createTestUser({
        email: 'credits@university.edu',
        role: 'student'
      });

      const studentData = {
        studentId: 'STU950000',
        userId: user._id,
        department: testDepartment._id,
        faculty: testFaculty._id,
        program: testDepartment._id,
        academicYear: '2024-2025',
        totalCreditsEarned: 60,
        totalCreditsRequired: 120
      };

      const student = new Student(studentData);
      const savedStudent = await student.save();

      expect(savedStudent.totalCreditsEarned).toBe(60);
      expect(savedStudent.totalCreditsRequired).toBe(120);
    });

    it('should reject negative credits', async () => {
      const user = await createTestUser({
        email: 'negativecredits@university.edu',
        role: 'student'
      });

      const studentData = {
        studentId: 'STU950001',
        userId: user._id,
        department: testDepartment._id,
        faculty: testFaculty._id,
        program: testDepartment._id,
        academicYear: '2024-2025',
        totalCreditsEarned: -10
      };

      const student = new Student(studentData);
      await expect(student.save()).rejects.toThrow();
    });

    it('should set default credit values', async () => {
      const user = await createTestUser({
        email: 'defaultcredits@university.edu',
        role: 'student'
      });

      const studentData = {
        studentId: 'STU950002',
        userId: user._id,
        department: testDepartment._id,
        faculty: testFaculty._id,
        program: testDepartment._id,
        academicYear: '2024-2025'
      };

      const student = new Student(studentData);
      const savedStudent = await student.save();

      expect(savedStudent.totalCreditsEarned).toBe(0);
      expect(savedStudent.totalCreditsRequired).toBe(120);
    });
  });

  describe('Financial Information', () => {
    it('should handle financial status', async () => {
      const user = await createTestUser({
        email: 'financial@university.edu',
        role: 'student'
      });

      const studentData = {
        studentId: 'STU960000',
        userId: user._id,
        department: testDepartment._id,
        faculty: testFaculty._id,
        program: testDepartment._id,
        academicYear: '2024-2025',
        financialStatus: {
          tuitionStatus: 'scholarship',
          balance: -500,
          scholarshipAmount: 10000
        }
      };

      const student = new Student(studentData);
      const savedStudent = await student.save();

      expect(savedStudent.financialStatus.tuitionStatus).toBe('scholarship');
      expect(savedStudent.financialStatus.balance).toBe(-500);
      expect(savedStudent.financialStatus.scholarshipAmount).toBe(10000);
    });

    it('should validate tuition status values', async () => {
      const validStatuses = ['paid', 'partial', 'unpaid', 'scholarship'];

      for (let i = 0; i < validStatuses.length; i++) {
        const status = validStatuses[i];
        const user = await createTestUser({
          email: `tuition${i}@university.edu`,
          role: 'student'
        });

        const studentData = {
          studentId: `STU${960000 + i}`,
          userId: user._id,
          department: testDepartment._id,
          faculty: testFaculty._id,
          program: testDepartment._id,
          academicYear: '2024-2025',
          financialStatus: {
            tuitionStatus: status
          }
        };

        const student = new Student(studentData);
        const savedStudent = await student.save();
        expect(savedStudent.financialStatus.tuitionStatus).toBe(status);
      }
    });
  });

  describe('Health Information', () => {
    it('should handle health information', async () => {
      const user = await createTestUser({
        email: 'health@university.edu',
        role: 'student'
      });

      const studentData = {
        studentId: 'STU970000',
        userId: user._id,
        department: testDepartment._id,
        faculty: testFaculty._id,
        program: testDepartment._id,
        academicYear: '2024-2025',
        healthInfo: {
          bloodType: 'A+',
          allergies: ['Peanuts', 'Shellfish'],
          medications: ['Insulin'],
          emergencyMedicalInfo: 'Diabetic',
          insuranceProvider: 'National Health Insurance',
          insuranceNumber: 'INS123456'
        }
      };

      const student = new Student(studentData);
      const savedStudent = await student.save();

      expect(savedStudent.healthInfo.bloodType).toBe('A+');
      expect(savedStudent.healthInfo.allergies).toEqual(['Peanuts', 'Shellfish']);
      expect(savedStudent.healthInfo.medications).toEqual(['Insulin']);
    });

    it('should validate blood type values', async () => {
      const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

      for (let i = 0; i < validBloodTypes.length; i++) {
        const bloodType = validBloodTypes[i];
        const user = await createTestUser({
          email: `blood${i}@university.edu`,
          role: 'student'
        });

        const studentData = {
          studentId: `STU${970000 + i}`,
          userId: user._id,
          department: testDepartment._id,
          faculty: testFaculty._id,
          program: testDepartment._id,
          academicYear: '2024-2025',
          healthInfo: {
            bloodType: bloodType
          }
        };

        const student = new Student(studentData);
        const savedStudent = await student.save();
        expect(savedStudent.healthInfo.bloodType).toBe(bloodType);
      }
    });
  });

  describe('Parent/Guardian Information', () => {
    it('should handle parent/guardian information', async () => {
      const user = await createTestUser({
        email: 'parent@university.edu',
        role: 'student'
      });

      const studentData = {
        studentId: 'STU980000',
        userId: user._id,
        department: testDepartment._id,
        faculty: testFaculty._id,
        program: testDepartment._id,
        academicYear: '2024-2025',
        parentGuardian: {
          father: {
            name: 'Mohammed Ahmed',
            nameAr: 'محمد أحمد',
            phone: '+966501234567',
            email: 'father@example.com',
            occupation: 'Engineer',
            occupationAr: 'مهندس'
          },
          mother: {
            name: 'Fatima Ali',
            nameAr: 'فاطمة علي',
            phone: '+966501234568',
            email: 'mother@example.com',
            occupation: 'Teacher',
            occupationAr: 'معلمة'
          }
        }
      };

      const student = new Student(studentData);
      const savedStudent = await student.save();

      expect(savedStudent.parentGuardian.father.name).toBe('Mohammed Ahmed');
      expect(savedStudent.parentGuardian.father.nameAr).toBe('محمد أحمد');
      expect(savedStudent.parentGuardian.mother.name).toBe('Fatima Ali');
      expect(savedStudent.parentGuardian.mother.nameAr).toBe('فاطمة علي');
    });
  });

  describe('Student Methods', () => {
    let testStudent;

    beforeEach(async () => {
      testStudent = await Student.create({
        studentId: 'STU990000',
        userId: testUser._id,
        department: testDepartment._id,
        faculty: testFaculty._id,
        program: testDepartment._id,
        academicYear: '2024-2025'
      });
    });

    it('should populate user, department, and faculty', async () => {
      const populatedStudent = await Student.findById(testStudent._id)
        .populate('userId')
        .populate('department')
        .populate('faculty');

      expect(populatedStudent.userId.email).toBe(testUser.email);
      expect(populatedStudent.department.name).toBe('علوم الحاسوب');
      expect(populatedStudent.faculty.name).toBe('كلية الهندسة');
    });

    it('should find active students', async () => {
      // Create inactive student
      const inactiveUser = await createTestUser({
        email: 'inactive@university.edu',
        role: 'student'
      });

      await Student.create({
        studentId: 'STU990001',
        userId: inactiveUser._id,
        department: testDepartment._id,
        faculty: testFaculty._id,
        program: testDepartment._id,
        academicYear: '2024-2025',
        status: 'inactive'
      });

      const activeStudents = await Student.find({ status: 'active' });
      expect(activeStudents.length).toBeGreaterThan(0);
      expect(activeStudents.every(student => student.status === 'active')).toBe(true);
    });

    it('should find students by classification', async () => {
      // Create graduate student
      const graduateUser = await createTestUser({
        email: 'graduate@university.edu',
        role: 'student'
      });

      await Student.create({
        studentId: 'STU990002',
        userId: graduateUser._id,
        department: testDepartment._id,
        faculty: testFaculty._id,
        program: testDepartment._id,
        academicYear: '2024-2025',
        classification: 'graduate'
      });

      const freshmanStudents = await Student.find({ classification: 'freshman' });
      const graduateStudents = await Student.find({ classification: 'graduate' });

      expect(freshmanStudents.length).toBeGreaterThan(0);
      expect(graduateStudents.length).toBeGreaterThan(0);
      expect(freshmanStudents.every(student => student.classification === 'freshman')).toBe(true);
      expect(graduateStudents.every(student => student.classification === 'graduate')).toBe(true);
    });
  });

  describe('Admission Date Validation', () => {
    it('should set default admission date to current date', async () => {
      const user = await createTestUser({
        email: 'admission@university.edu',
        role: 'student'
      });

      const studentData = {
        studentId: 'STU995000',
        userId: user._id,
        department: testDepartment._id,
        faculty: testFaculty._id,
        program: testDepartment._id,
        academicYear: '2024-2025'
      };

      const student = new Student(studentData);
      const savedStudent = await student.save();

      expect(savedStudent.admissionDate).toBeInstanceOf(Date);
      expect(savedStudent.admissionDate.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });
});