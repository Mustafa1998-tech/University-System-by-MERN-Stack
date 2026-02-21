const { createStubRouter } = require('./routeFactory');

const seedData = {"actor":"admin@university.edu","id":"audit-1","action":"LOGIN"};

module.exports = createStubRouter('Audit', seedData);
