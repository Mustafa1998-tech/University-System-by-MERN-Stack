const Instructor = require('../models/Instructor');
const { createModelRouter } = require('./routeFactory');

module.exports = createModelRouter(Instructor, 'Instructor');
