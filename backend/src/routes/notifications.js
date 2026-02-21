const { createStubRouter } = require('./routeFactory');

const seedData = {"channel":"email","id":"notify-1","message":"Welcome to SIS"};

module.exports = createStubRouter('Notifications', seedData);
