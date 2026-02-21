const { createStubRouter } = require('./routeFactory');

const seedData = {"year":2025,"id":"pub-1","title":"Adaptive Learning Study"};

module.exports = createStubRouter('Publications', seedData);
