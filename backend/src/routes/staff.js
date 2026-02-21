const Staff = require('../models/Staff');
const { createModelRouter } = require('./routeFactory');

module.exports = createModelRouter(Staff, 'Staff');
