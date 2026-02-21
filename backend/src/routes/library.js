const { createStubRouter } = require('./routeFactory');

const seedData = {"available":true,"id":"book-1","title":"Introduction to Algorithms"};

module.exports = createStubRouter('Library', seedData);
