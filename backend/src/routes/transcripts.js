const { createStubRouter } = require('./routeFactory');

const seedData = {"id":"transcript-1","studentId":"STU-001","status":"generated"};

module.exports = createStubRouter('Transcripts', seedData);
