const { createStubRouter } = require('./routeFactory');

const seedData = {"id":"attendance-1","courseCode":"CS101","studentId":"STU-001","present":true};

module.exports = createStubRouter('Attendance', seedData);
