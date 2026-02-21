const { createStubRouter } = require('./routeFactory');

const seedData = {"amount":2500,"id":"sch-1","name":"Merit Scholarship","currency":"USD"};

module.exports = createStubRouter('Scholarships', seedData);
