const Faculty = require('../models/Faculty');
const { createModelRouter } = require('./routeFactory');

module.exports = createModelRouter(Faculty, 'Faculty');
