const { createStubRouter } = require('./routeFactory');

const seedData = {"id":"internship-1","status":"open","company":"TechCorp"};

module.exports = createStubRouter('Internships', seedData);
