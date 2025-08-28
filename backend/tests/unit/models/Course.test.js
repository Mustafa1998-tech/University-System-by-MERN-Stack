const Course = require('../../../src/models/Course');
const Department = require('../../../src/models/Department');
const Faculty = require('../../../src/models/Faculty');

describe('Course Model', () => {
  let testDepartment;
  let testFaculty;

  beforeEach(async () => {
    // Create test department and faculty
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

  describe('Course Creation', () => {
    it('should create a valid course', async () => {
      const courseData = {
        courseCode: 'CS101',
        title: 'Introduction to Computer Science',
        titleAr: 'مقدمة في علوم الحاسوب',
        description: 'Basic concepts of computer science',
        descriptionAr: 'المفاهيم الأساسية لعلوم الحاسوب',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3,
        contactHours: {
          lecture: 3,
          lab: 0,
          tutorial: 0
        },
        level: 'undergraduate',
        courseType: 'core'
      };

      const course = new Course(courseData);
      const savedCourse = await course.save();

      expect(savedCourse._id).toBeDefined();
      expect(savedCourse.courseCode).toBe(courseData.courseCode);
      expect(savedCourse.title).toBe(courseData.title);
      expect(savedCourse.titleAr).toBe(courseData.titleAr);
      expect(savedCourse.creditHours).toBe(courseData.creditHours);
      expect(savedCourse.level).toBe(courseData.level);
      expect(savedCourse.status).toBe('active'); // Default value
    });

    it('should fail with missing required fields', async () => {
      const incompleteCourse = new Course({
        title: 'Test Course'
        // Missing required fields
      });

      await expect(incompleteCourse.save()).rejects.toThrow();
    });

    it('should fail with invalid course code format', async () => {
      const courseData = {
        courseCode: 'invalid-code',
        title: 'Test Course',
        description: 'Test description',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3
      };

      const course = new Course(courseData);
      await expect(course.save()).rejects.toThrow(/Course code must be in format/);
    });

    it('should enforce unique course code', async () => {
      const courseData = {
        courseCode: 'CS201',
        title: 'Data Structures',
        description: 'Introduction to data structures',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3
      };

      // Create first course
      await Course.create(courseData);

      // Try to create another course with same code
      const duplicateCourse = new Course({
        ...courseData,
        title: 'Different Title'
      });

      await expect(duplicateCourse.save()).rejects.toThrow(/duplicate key error/);
    });
  });

  describe('Course Code Validation', () => {
    it('should accept valid course codes', async () => {
      const validCodes = ['CS101', 'MATH201', 'ENGR1001', 'PHYS2301'];

      for (const code of validCodes) {
        const courseData = {
          courseCode: code,
          title: `Test Course ${code}`,
          description: 'Test description',
          department: testDepartment._id,
          faculty: testFaculty._id,
          creditHours: 3
        };

        const course = new Course(courseData);
        await expect(course.save()).resolves.toBeTruthy();
      }
    });

    it('should reject invalid course codes', async () => {
      const invalidCodes = ['cs101', '123ABC', 'C1', 'TOOLONGCODE123'];

      for (const code of invalidCodes) {
        const courseData = {
          courseCode: code,
          title: `Test Course ${code}`,
          description: 'Test description',
          department: testDepartment._id,
          faculty: testFaculty._id,
          creditHours: 3
        };

        const course = new Course(courseData);
        await expect(course.save()).rejects.toThrow();
      }
    });

    it('should convert course code to uppercase', async () => {
      const courseData = {
        courseCode: 'cs301',
        title: 'Test Course',
        description: 'Test description',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3
      };

      const course = new Course(courseData);
      await course.save();

      expect(course.courseCode).toBe('CS301');
    });
  });

  describe('Credit Hours Validation', () => {
    it('should accept valid credit hours', async () => {
      const validHours = [1, 2, 3, 4, 5, 6];

      for (const hours of validHours) {
        const courseData = {
          courseCode: `CS${100 + hours}`,
          title: `Test Course ${hours}`,
          description: 'Test description',
          department: testDepartment._id,
          faculty: testFaculty._id,
          creditHours: hours
        };

        const course = new Course(courseData);
        await expect(course.save()).resolves.toBeTruthy();
      }
    });

    it('should reject invalid credit hours', async () => {
      const invalidHours = [0, -1, 7, 10];

      for (const hours of invalidHours) {
        const courseData = {
          courseCode: `CS${200 + Math.abs(hours)}`,
          title: `Test Course ${hours}`,
          description: 'Test description',
          department: testDepartment._id,
          faculty: testFaculty._id,
          creditHours: hours
        };

        const course = new Course(courseData);
        await expect(course.save()).rejects.toThrow();
      }
    });
  });

  describe('Contact Hours Validation', () => {
    it('should accept valid contact hours', async () => {
      const courseData = {
        courseCode: 'CS401',
        title: 'Advanced Programming',
        description: 'Advanced programming concepts',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 4,
        contactHours: {
          lecture: 3,
          lab: 2,
          tutorial: 1
        }
      };

      const course = new Course(courseData);
      const savedCourse = await course.save();

      expect(savedCourse.contactHours.lecture).toBe(3);
      expect(savedCourse.contactHours.lab).toBe(2);
      expect(savedCourse.contactHours.tutorial).toBe(1);
    });

    it('should reject negative contact hours', async () => {
      const courseData = {
        courseCode: 'CS402',
        title: 'Test Course',
        description: 'Test description',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3,
        contactHours: {
          lecture: -1,
          lab: 0,
          tutorial: 0
        }
      };

      const course = new Course(courseData);
      await expect(course.save()).rejects.toThrow();
    });

    it('should set default contact hours to 0', async () => {
      const courseData = {
        courseCode: 'CS403',
        title: 'Test Course',
        description: 'Test description',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3
      };

      const course = new Course(courseData);
      const savedCourse = await course.save();

      expect(savedCourse.contactHours.lecture).toBe(0);
      expect(savedCourse.contactHours.lab).toBe(0);
      expect(savedCourse.contactHours.tutorial).toBe(0);
    });
  });

  describe('Course Level and Type', () => {
    it('should validate course level', async () => {
      const validLevels = ['undergraduate', 'graduate', 'doctoral'];

      for (const level of validLevels) {
        const courseData = {
          courseCode: `CS${500 + validLevels.indexOf(level)}`,
          title: `Test Course ${level}`,
          description: 'Test description',
          department: testDepartment._id,
          faculty: testFaculty._id,
          creditHours: 3,
          level: level
        };

        const course = new Course(courseData);
        const savedCourse = await course.save();
        expect(savedCourse.level).toBe(level);
      }
    });

    it('should reject invalid course level', async () => {
      const courseData = {
        courseCode: 'CS504',
        title: 'Test Course',
        description: 'Test description',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3,
        level: 'invalid-level'
      };

      const course = new Course(courseData);
      await expect(course.save()).rejects.toThrow();
    });

    it('should validate course type', async () => {
      const validTypes = ['core', 'elective', 'major', 'minor', 'general'];

      for (const type of validTypes) {
        const courseData = {
          courseCode: `CS${600 + validTypes.indexOf(type)}`,
          title: `Test Course ${type}`,
          description: 'Test description',
          department: testDepartment._id,
          faculty: testFaculty._id,
          creditHours: 3,
          courseType: type
        };

        const course = new Course(courseData);
        const savedCourse = await course.save();
        expect(savedCourse.courseType).toBe(type);
      }
    });
  });

  describe('Prerequisites and Corequisites', () => {
    let prerequisiteCourse;

    beforeEach(async () => {
      prerequisiteCourse = await Course.create({
        courseCode: 'CS100',
        title: 'Programming Fundamentals',
        description: 'Basic programming concepts',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3
      });
    });

    it('should allow adding prerequisites', async () => {
      const courseData = {
        courseCode: 'CS201',
        title: 'Object-Oriented Programming',
        description: 'OOP concepts',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3,
        prerequisites: [{
          course: prerequisiteCourse._id,
          minimumGrade: 'C+'
        }]
      };

      const course = new Course(courseData);
      const savedCourse = await course.save();

      expect(savedCourse.prerequisites).toHaveLength(1);
      expect(savedCourse.prerequisites[0].course.toString()).toBe(prerequisiteCourse._id.toString());
      expect(savedCourse.prerequisites[0].minimumGrade).toBe('C+');
    });

    it('should allow adding corequisites', async () => {
      const corequisiteCourse = await Course.create({
        courseCode: 'MATH201',
        title: 'Discrete Mathematics',
        description: 'Mathematical foundations',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3
      });

      const courseData = {
        courseCode: 'CS202',
        title: 'Algorithms',
        description: 'Algorithm design and analysis',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3,
        corequisites: [corequisiteCourse._id]
      };

      const course = new Course(courseData);
      const savedCourse = await course.save();

      expect(savedCourse.corequisites).toHaveLength(1);
      expect(savedCourse.corequisites[0].toString()).toBe(corequisiteCourse._id.toString());
    });

    it('should validate minimum grade values', async () => {
      const validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

      for (const grade of validGrades) {
        const courseData = {
          courseCode: `CS${700 + validGrades.indexOf(grade)}`,
          title: `Test Course ${grade}`,
          description: 'Test description',
          department: testDepartment._id,
          faculty: testFaculty._id,
          creditHours: 3,
          prerequisites: [{
            course: prerequisiteCourse._id,
            minimumGrade: grade
          }]
        };

        const course = new Course(courseData);
        const savedCourse = await course.save();
        expect(savedCourse.prerequisites[0].minimumGrade).toBe(grade);
      }
    });
  });

  describe('Learning Outcomes', () => {
    it('should allow adding learning outcomes', async () => {
      const courseData = {
        courseCode: 'CS301',
        title: 'Software Engineering',
        description: 'Software development methodologies',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3,
        learningOutcomes: [
          {
            outcome: 'Students will understand software development lifecycle',
            outcomeAr: 'سيفهم الطلاب دورة حياة تطوير البرمجيات',
            bloomLevel: 'understand'
          },
          {
            outcome: 'Students will apply design patterns',
            outcomeAr: 'سيطبق الطلاب أنماط التصميم',
            bloomLevel: 'apply'
          }
        ]
      };

      const course = new Course(courseData);
      const savedCourse = await course.save();

      expect(savedCourse.learningOutcomes).toHaveLength(2);
      expect(savedCourse.learningOutcomes[0].outcome).toBe('Students will understand software development lifecycle');
      expect(savedCourse.learningOutcomes[0].bloomLevel).toBe('understand');
      expect(savedCourse.learningOutcomes[1].bloomLevel).toBe('apply');
    });

    it('should validate Bloom taxonomy levels', async () => {
      const validLevels = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];

      for (const level of validLevels) {
        const courseData = {
          courseCode: `CS${800 + validLevels.indexOf(level)}`,
          title: `Test Course ${level}`,
          description: 'Test description',
          department: testDepartment._id,
          faculty: testFaculty._id,
          creditHours: 3,
          learningOutcomes: [{
            outcome: `Test outcome for ${level}`,
            bloomLevel: level
          }]
        };

        const course = new Course(courseData);
        const savedCourse = await course.save();
        expect(savedCourse.learningOutcomes[0].bloomLevel).toBe(level);
      }
    });
  });

  describe('Assessment Methods', () => {
    it('should allow adding assessment methods', async () => {
      const courseData = {
        courseCode: 'CS302',
        title: 'Database Systems',
        description: 'Database design and implementation',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3,
        assessmentMethods: [
          {
            type: 'exam',
            weight: 40,
            description: 'Midterm and final exams',
            descriptionAr: 'امتحان منتصف الفصل والامتحان النهائي'
          },
          {
            type: 'project',
            weight: 30,
            description: 'Database design project',
            descriptionAr: 'مشروع تصميم قاعدة البيانات'
          },
          {
            type: 'quiz',
            weight: 20,
            description: 'Weekly quizzes',
            descriptionAr: 'اختبارات أسبوعية'
          },
          {
            type: 'participation',
            weight: 10,
            description: 'Class participation',
            descriptionAr: 'المشاركة في الصف'
          }
        ]
      };

      const course = new Course(courseData);
      const savedCourse = await course.save();

      expect(savedCourse.assessmentMethods).toHaveLength(4);
      expect(savedCourse.assessmentMethods[0].type).toBe('exam');
      expect(savedCourse.assessmentMethods[0].weight).toBe(40);
    });

    it('should validate assessment weight range', async () => {
      const courseData = {
        courseCode: 'CS303',
        title: 'Test Course',
        description: 'Test description',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3,
        assessmentMethods: [{
          type: 'exam',
          weight: 150, // Invalid weight > 100
          description: 'Test assessment'
        }]
      };

      const course = new Course(courseData);
      await expect(course.save()).rejects.toThrow();
    });
  });

  describe('Course Status', () => {
    it('should set default status to active', async () => {
      const courseData = {
        courseCode: 'CS304',
        title: 'Test Course',
        description: 'Test description',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3
      };

      const course = new Course(courseData);
      const savedCourse = await course.save();

      expect(savedCourse.status).toBe('active');
    });

    it('should validate status values', async () => {
      const validStatuses = ['active', 'inactive', 'archived'];

      for (const status of validStatuses) {
        const courseData = {
          courseCode: `CS${900 + validStatuses.indexOf(status)}`,
          title: `Test Course ${status}`,
          description: 'Test description',
          department: testDepartment._id,
          faculty: testFaculty._id,
          creditHours: 3,
          status: status
        };

        const course = new Course(courseData);
        const savedCourse = await course.save();
        expect(savedCourse.status).toBe(status);
      }
    });
  });

  describe('Delivery Mode', () => {
    it('should set default delivery mode to in-person', async () => {
      const courseData = {
        courseCode: 'CS305',
        title: 'Test Course',
        description: 'Test description',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3
      };

      const course = new Course(courseData);
      const savedCourse = await course.save();

      expect(savedCourse.deliveryMode).toBe('in-person');
    });

    it('should validate delivery mode values', async () => {
      const validModes = ['in-person', 'online', 'hybrid'];

      for (const mode of validModes) {
        const courseData = {
          courseCode: `CS${950 + validModes.indexOf(mode)}`,
          title: `Test Course ${mode}`,
          description: 'Test description',
          department: testDepartment._id,
          faculty: testFaculty._id,
          creditHours: 3,
          deliveryMode: mode
        };

        const course = new Course(courseData);
        const savedCourse = await course.save();
        expect(savedCourse.deliveryMode).toBe(mode);
      }
    });
  });

  describe('Course Methods', () => {
    let testCourse;

    beforeEach(async () => {
      testCourse = await Course.create({
        courseCode: 'CS999',
        title: 'Test Course for Methods',
        description: 'Course for testing methods',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3
      });
    });

    it('should populate department and faculty', async () => {
      const populatedCourse = await Course.findById(testCourse._id)
        .populate('department')
        .populate('faculty');

      expect(populatedCourse.department.name).toBe('علوم الحاسوب');
      expect(populatedCourse.faculty.name).toBe('كلية الهندسة');
    });

    it('should find active courses', async () => {
      // Create inactive course
      await Course.create({
        courseCode: 'CS998',
        title: 'Inactive Course',
        description: 'This course is inactive',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3,
        status: 'inactive'
      });

      const activeCourses = await Course.find({ status: 'active' });
      expect(activeCourses.length).toBeGreaterThan(0);
      expect(activeCourses.every(course => course.status === 'active')).toBe(true);
    });
  });

  describe('Course Text Validation', () => {
    it('should enforce maximum length for title', async () => {
      const longTitle = 'A'.repeat(201); // Exceeds 200 character limit
      
      const courseData = {
        courseCode: 'CS306',
        title: longTitle,
        description: 'Test description',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3
      };

      const course = new Course(courseData);
      await expect(course.save()).rejects.toThrow(/cannot exceed 200 characters/);
    });

    it('should enforce maximum length for description', async () => {
      const longDescription = 'A'.repeat(2001); // Exceeds 2000 character limit
      
      const courseData = {
        courseCode: 'CS307',
        title: 'Test Course',
        description: longDescription,
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3
      };

      const course = new Course(courseData);
      await expect(course.save()).rejects.toThrow(/cannot exceed 2000 characters/);
    });

    it('should trim whitespace from text fields', async () => {
      const courseData = {
        courseCode: '  CS308  ',
        title: '  Test Course  ',
        description: '  Test description  ',
        department: testDepartment._id,
        faculty: testFaculty._id,
        creditHours: 3
      };

      const course = new Course(courseData);
      const savedCourse = await course.save();

      expect(savedCourse.courseCode).toBe('CS308');
      expect(savedCourse.title).toBe('Test Course');
      expect(savedCourse.description).toBe('Test description');
    });
  });
});