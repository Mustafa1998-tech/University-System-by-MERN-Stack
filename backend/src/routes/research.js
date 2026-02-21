const { createStubRouter } = require('./routeFactory');

const seedData = {"id":"research-1","status":"active","title":"AI for Education"};

module.exports = createStubRouter('Research', seedData);
