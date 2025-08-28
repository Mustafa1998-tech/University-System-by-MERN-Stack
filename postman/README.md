# Student Information System - Postman API Collection

## Overview
This comprehensive Postman collection provides complete API testing capabilities for the University Student Information System (SIS). The collection includes authentication, student management, course management, certificate generation, and administrative endpoints.

## Collection Structure

### Main Collections
1. **SIS_API_Collection.json** - Main collection with authentication endpoints
2. **Student_Management.json** - Student-specific CRUD operations
3. **Certificate_Management.json** - Certificate generation and verification

### Environments
- **Development.postman_environment.json** - Local development environment
- **Production.postman_environment.json** - Production deployment environment

## Setup Instructions

### 1. Import Collections
1. Open Postman
2. Click "Import" button
3. Select all `.json` files from the `postman/` directory
4. Import the environment files from `postman/environments/`

### 2. Environment Configuration
1. Select the appropriate environment (Development/Production)
2. Update environment variables:
   - `base_url`: API server URL
   - `admin_email`: Administrator email
   - `admin_password`: Administrator password
   - `student_email`: Test student email
   - `student_password`: Test student password

### 3. Authentication Setup
1. Run the "Login" request from Authentication collection
2. The collection will automatically:
   - Store access and refresh tokens
   - Set up automatic token refresh
   - Configure bearer token authentication

## Test Scenarios

### Authentication Flow
```
1. Register new user
2. Login with credentials
3. Get user profile
4. Update profile information
5. Change password
6. Refresh token
7. Logout
```

### Student Management Flow
```
1. Login as admin
2. Get all students (with pagination)
3. Create new student
4. Get student by ID
5. Update student information
6. Get student enrollments
7. Get student grades
8. Get student financial status
```

### Certificate Management Flow
```
1. Login as admin/student
2. Generate graduation certificate
3. Generate transcript
4. Generate enrollment certificate
5. Verify certificate with code
6. Get all student certificates
7. Test invalid certificate verification
```

## Environment Variables

### Global Variables
- `base_url`: API base URL
- `api_version`: API version (v1)
- `default_language`: Default language (en/ar)

### Authentication Variables (Auto-managed)
- `accessToken`: JWT access token
- `refreshToken`: JWT refresh token
- `userId`: Current user ID
- `studentId`: Current student ID

### Test Data Variables
- `admin_email`: Admin test account
- `student_email`: Student test account
- `instructor_email`: Instructor test account
- `verificationCode`: Certificate verification code

## Pre-request Scripts

### Automatic Token Refresh
The collection includes automatic token refresh functionality:
```javascript
// Check if access token is expired
const accessToken = pm.collectionVariables.get('accessToken');
if (accessToken) {
  const payload = JSON.parse(atob(accessToken.split('.')[1]));
  const exp = payload.exp * 1000;
  if (Date.now() >= exp) {
    // Auto-refresh using refresh token
    const refreshToken = pm.collectionVariables.get('refreshToken');
    // ... refresh logic
  }
}
```

## Test Scripts

### Standard Response Tests
Each request includes standard tests:
- Response time validation (< 5000ms)
- Status code verification
- JSON structure validation
- Required fields presence

### Specific Test Examples

#### Authentication Tests
```javascript
pm.test('Login successful', function () {
  pm.response.to.have.status(200);
  const responseJson = pm.response.json();
  pm.expect(responseJson.status).to.eql('success');
  pm.expect(responseJson.data).to.have.property('accessToken');
  
  // Store tokens for future requests
  pm.collectionVariables.set('accessToken', responseJson.data.accessToken);
});
```

#### Student Management Tests
```javascript
pm.test('Student created successfully', function () {
  pm.response.to.have.status(201);
  const responseJson = pm.response.json();
  pm.expect(responseJson.data.student).to.have.property('_id');
  pm.expect(responseJson.data.student).to.have.property('studentId');
});
```

#### Certificate Tests
```javascript
pm.test('Certificate verified successfully', function () {
  const responseJson = pm.response.json();
  pm.expect(responseJson.data.certificate).to.have.property('type');
  pm.expect(responseJson.data.certificate).to.have.property('studentInfo');
});
```

## API Endpoints Coverage

### Authentication (8 endpoints)
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/profile` - Get user profile
- PATCH `/api/auth/profile` - Update profile
- PATCH `/api/auth/change-password` - Change password
- POST `/api/auth/forgot-password` - Password reset
- POST `/api/auth/refresh` - Refresh token
- POST `/api/auth/logout` - User logout

### Student Management (7 endpoints)
- GET `/api/students` - List students (paginated)
- GET `/api/students/:id` - Get student details
- POST `/api/students` - Create student
- PATCH `/api/students/:id` - Update student
- GET `/api/students/:id/enrollments` - Student enrollments
- GET `/api/students/:id/grades` - Student grades
- GET `/api/students/:id/financial` - Financial status

### Certificate Management (6 endpoints)
- POST `/api/certificates/graduation/:studentId` - Graduation certificate
- POST `/api/certificates/transcript/:studentId` - Academic transcript
- POST `/api/certificates/enrollment/:studentId` - Enrollment certificate
- GET `/api/certificates/verify/:code` - Verify certificate
- GET `/api/certificates/student/:studentId` - List certificates
- GET `/api/certificates/:id/download` - Download certificate

## Error Testing

### Common Error Scenarios
1. **Authentication Errors**
   - Invalid credentials (401)
   - Expired token (401)
   - Missing authorization (401)
   - Insufficient permissions (403)

2. **Validation Errors**
   - Missing required fields (400)
   - Invalid data format (400)
   - Duplicate unique fields (409)

3. **Resource Errors**
   - Resource not found (404)
   - Invalid resource ID (400)

## Performance Testing

### Response Time Expectations
- Authentication: < 1000ms
- CRUD operations: < 2000ms
- Complex queries: < 3000ms
- File operations: < 5000ms

### Load Testing Recommendations
1. Use Postman's Collection Runner for bulk testing
2. Test with multiple concurrent users
3. Monitor response times under load
4. Validate error handling under stress

## Security Testing

### Tests Included
1. **Authentication Security**
   - Token expiration handling
   - Refresh token rotation
   - Logout token invalidation

2. **Authorization Testing**
   - Role-based access control
   - Resource ownership validation
   - Cross-user data access prevention

3. **Input Validation**
   - SQL injection prevention
   - XSS attack prevention
   - Input sanitization

## Monitoring and Reporting

### Test Reports
Run collection with Newman for CI/CD integration:
```bash
newman run SIS_API_Collection.json \
  -e Development.postman_environment.json \
  --reporters cli,json,html \
  --reporter-html-export report.html
```

### Metrics Tracking
- API response times
- Success/failure rates
- Error categorization
- Coverage statistics

## Troubleshooting

### Common Issues
1. **Token Expiration**
   - Solution: Re-run login request
   - Prevention: Use auto-refresh script

2. **Environment Variables**
   - Ensure correct environment is selected
   - Verify all required variables are set

3. **Network Issues**
   - Check base_url configuration
   - Verify server is running
   - Test network connectivity

### Debug Mode
Enable Postman console to see:
- Pre-request script logs
- Test script outputs
- Variable values
- Request/response details

## Contributing

### Adding New Tests
1. Follow naming convention: `Entity_Action`
2. Include comprehensive test scripts
3. Add proper documentation
4. Update environment variables if needed

### Test Standards
- Each request must have status code test
- Response structure validation required
- Store relevant data for subsequent requests
- Include negative test cases
- Add performance expectations

## Version History
- v1.0.0: Initial comprehensive collection
- Includes all core SIS functionality
- Full authentication flow
- Complete CRUD operations
- Certificate management
- Error handling scenarios