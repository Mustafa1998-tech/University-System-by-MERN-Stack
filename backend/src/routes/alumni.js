const { createStubRouter } = require('./routeFactory');

const seedData = {"id":"alumni-1","name":"Jane Doe","graduationYear":2022};

module.exports = createStubRouter('Alumni', seedData);
