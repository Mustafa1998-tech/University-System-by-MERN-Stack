const Tuition = require('../models/Tuition');
const { createModelRouter } = require('./routeFactory');

module.exports = createModelRouter(Tuition, 'Tuition');
