const { createStubRouter } = require('./routeFactory');

const seedData = {"type":"enrollment-summary","id":"report-1","generatedAt":"2026-01-10T10:00:00.000Z"};

module.exports = createStubRouter('Reports', seedData);
