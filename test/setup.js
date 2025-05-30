const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

// Configure chai
chai.use(chaiHttp);

// Make chai globally available in all test files
global.chai = chai;
global.expect = expect;

// Import the app (so we can make requests to it)
const app = require('../app');
global.app = app;

// Before running tests
before(function() {
  console.log('🧪 Starting Notes API test suite...');
});

// After running tests
after(function() {
  console.log('✅ All Notes API tests completed.');
});
