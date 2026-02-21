export const moduleCatalog = [
  {
    id: 'academic',
    icon: '🎓',
    color: 'var(--accent-indigo)',
    name: {
      en: 'Academic Management',
      ar: 'الإدارة الأكاديمية'
    },
    summary: {
      en: 'Admissions, courses, grades, transcripts, attendance and advising.',
      ar: 'القبول والمقررات والدرجات والسجلات والحضور والإرشاد الأكاديمي.'
    },
    modules: [
      { id: 'students', label: { en: 'Students', ar: 'الطلاب' } },
      { id: 'courses', label: { en: 'Courses', ar: 'المقررات' } },
      { id: 'enrollments', label: { en: 'Enrollments', ar: 'التسجيل' } },
      { id: 'grades', label: { en: 'Grades', ar: 'الدرجات' } },
      { id: 'transcripts', label: { en: 'Transcripts', ar: 'السجلات' } },
      { id: 'attendance', label: { en: 'Attendance', ar: 'الحضور' } },
      { id: 'departments', label: { en: 'Departments', ar: 'الأقسام' } },
      { id: 'faculties', label: { en: 'Faculties', ar: 'الكليات' } },
      { id: 'instructors', label: { en: 'Instructors', ar: 'المدرسون' } }
    ]
  },
  {
    id: 'finance',
    icon: '💰',
    color: 'var(--accent-green)',
    name: {
      en: 'Financial Operations',
      ar: 'العمليات المالية'
    },
    summary: {
      en: 'Tuition, payroll, scholarships and financial reporting.',
      ar: 'الرسوم الدراسية والرواتب والمنح والتقارير المالية.'
    },
    modules: [
      { id: 'tuition', label: { en: 'Tuition', ar: 'الرسوم الدراسية' } },
      { id: 'payroll', label: { en: 'Payroll', ar: 'الرواتب' } },
      { id: 'scholarships', label: { en: 'Scholarships', ar: 'المنح' } },
      { id: 'reports', label: { en: 'Reports', ar: 'التقارير' } }
    ]
  },
  {
    id: 'services',
    icon: '🏫',
    color: 'var(--accent-orange)',
    name: {
      en: 'Student Services',
      ar: 'خدمات الطلاب'
    },
    summary: {
      en: 'Library, events, alumni, housing, transportation and health.',
      ar: 'المكتبة والفعاليات والخريجون والسكن والنقل والصحة.'
    },
    modules: [
      { id: 'library', label: { en: 'Library', ar: 'المكتبة' } },
      { id: 'events', label: { en: 'Events', ar: 'الفعاليات' } },
      { id: 'alumni', label: { en: 'Alumni', ar: 'الخريجون' } },
      { id: 'housing', label: { en: 'Housing', ar: 'السكن' } },
      { id: 'transportation', label: { en: 'Transportation', ar: 'النقل' } },
      { id: 'health', label: { en: 'Health', ar: 'الصحة' } }
    ]
  },
  {
    id: 'advanced',
    icon: '🚀',
    color: 'var(--accent-cyan)',
    name: {
      en: 'Advanced Features',
      ar: 'الميزات المتقدمة'
    },
    summary: {
      en: 'Research, publications, internships, notifications and audits.',
      ar: 'الأبحاث والمنشورات والتدريب والإشعارات والتدقيق.'
    },
    modules: [
      { id: 'research', label: { en: 'Research', ar: 'الأبحاث' } },
      { id: 'publications', label: { en: 'Publications', ar: 'المنشورات' } },
      { id: 'internships', label: { en: 'Internships', ar: 'التدريب' } },
      { id: 'notifications', label: { en: 'Notifications', ar: 'الإشعارات' } },
      { id: 'audit', label: { en: 'Audit', ar: 'التدقيق' } }
    ]
  }
];

export const getAllModules = () => {
  return moduleCatalog.flatMap((category) =>
    category.modules.map((moduleItem) => ({
      ...moduleItem,
      categoryId: category.id,
      categoryName: category.name
    }))
  );
};

export const findModule = (moduleId) => {
  return getAllModules().find((moduleItem) => moduleItem.id === moduleId);
};
