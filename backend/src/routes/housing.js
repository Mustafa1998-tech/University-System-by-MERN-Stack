const { createStubRouter } = require('./routeFactory');

const seedData = {"building":"Dorm A","id":"housing-1","occupied":true,"room":"A-104"};

module.exports = createStubRouter('Housing', seedData);
