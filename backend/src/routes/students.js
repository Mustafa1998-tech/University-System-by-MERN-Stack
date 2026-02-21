const Student = require('../models/Student');
const { createModelRouter } = require('./routeFactory');

module.exports = createModelRouter(Student, 'Student');
