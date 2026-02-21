const Course = require('../models/Course');
const { createModelRouter } = require('./routeFactory');

module.exports = createModelRouter(Course, 'Course');
