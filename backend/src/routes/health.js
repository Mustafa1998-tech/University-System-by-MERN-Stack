const { createStubRouter } = require('./routeFactory');

const seedData = {"type":"system","id":"health-1","status":"operational"};

module.exports = createStubRouter('Health', seedData);
