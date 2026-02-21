const { createStubRouter } = require('./routeFactory');

const seedData = {"date":"2026-09-01","id":"event-1","title":"Orientation Day"};

module.exports = createStubRouter('Events', seedData);
