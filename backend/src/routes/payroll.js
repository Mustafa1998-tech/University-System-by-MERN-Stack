const Payroll = require('../models/Payroll');
const { createModelRouter } = require('./routeFactory');

module.exports = createModelRouter(Payroll, 'Payroll');
