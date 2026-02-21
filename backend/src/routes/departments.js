const Department = require('../models/Department');
const { createModelRouter } = require('./routeFactory');

module.exports = createModelRouter(Department, 'Department');
