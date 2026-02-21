const { createStubRouter } = require('./routeFactory');

const seedData = {"term":"Fall 2025","id":"grade-1","courseCode":"CS101","studentId":"STU-001","grade":"A"};

module.exports = createStubRouter('Grades', seedData);
