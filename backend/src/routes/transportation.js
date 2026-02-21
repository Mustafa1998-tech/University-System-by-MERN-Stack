const { createStubRouter } = require('./routeFactory');

const seedData = {"id":"route-1","active":true,"routeName":"Campus Loop"};

module.exports = createStubRouter('Transportation', seedData);
