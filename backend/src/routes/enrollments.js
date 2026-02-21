const Enrollment = require('../models/Enrollment');
const { createModelRouter } = require('./routeFactory');

module.exports = createModelRouter(Enrollment, 'Enrollment');
