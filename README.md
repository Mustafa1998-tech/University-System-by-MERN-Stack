# SIS - Student Information System 🎓
## نظام معلومات الطلاب الجامعي

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

A comprehensive, production-ready full-stack university Student Information System built with MERN stack, featuring complete multilingual support for Arabic and English, advanced academic management, financial operations, and modern UI/UX.

## 🌟 Complete Feature Set

### 📚 Academic Management
- **Student Lifecycle**: Complete enrollment, registration, graduation workflow
- **Course Management**: Course creation, prerequisites, sections, scheduling
- **Grade Management**: Assignment grading, GPA calculation, academic standing
- **Transcript Generation**: Official transcripts with QR verification
- **Certificate Issuance**: Automated degree certificates with security features
- **Curriculum Planning**: Program requirements, course mapping, degree audit
- **Academic Calendar**: Semester management, important dates, deadlines
- **Attendance Tracking**: Real-time attendance with automated notifications
- **Academic Advising**: Student-advisor assignments and meeting tracking

### 💰 Financial Management
- **Tuition Management**: Semester billing, payment plans, late fees
- **Scholarship System**: Merit-based and need-based aid processing
- **Payroll Processing**: Staff and faculty salary management
- **Fee Collection**: Online payments, receipts, refund processing
- **Financial Reporting**: Revenue analytics, outstanding balances
- **Budget Management**: Department and faculty budget tracking
- **Financial Aid**: Application processing and disbursement

### 🏫 Student Services
- **Library System**: Book catalog, borrowing, returns, reservations
- **Event Management**: Campus events, registrations, announcements
- **Alumni Network**: Graduate tracking, networking events
- **Housing Management**: Dormitory assignments, room bookings
- **Health Services**: Medical records, appointments, insurance
- **Transportation**: Bus schedules, route management
- **Clubs & Societies**: Student organizations, memberships

### 🔬 Advanced Features
- **Research Management**: Projects, grants, publications tracking
- **Internship Coordination**: Company partnerships, placements
- **Survey System**: Feedback collection, course evaluations
- **Document Management**: Secure file storage and sharing
- **Notification System**: Email, SMS, push notifications
- **Audit & Compliance**: Complete activity logging and compliance reporting
- **Analytics Dashboard**: KPIs, trends, predictive analytics
- **API Integration**: External system connectivity

### 🌍 Multilingual Excellence
- **Complete i18n Support**: Arabic and English throughout the system
- **RTL/LTR Interface**: Automatic layout adjustment
- **Cultural Localization**: Date formats, number formats, currency
- **Translated Content**: All UI elements, messages, and documentation
- **PDF Generation**: Multilingual certificates and reports
- **Communication**: Emails and SMS in user's preferred language

## 🏗️ Architecture & Technology Stack

### Backend (Node.js + Express)
- **Authentication**: JWT with refresh tokens, role-based access
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis for sessions and performance
- **File Storage**: Secure upload/download with virus scanning
- **Email/SMS**: Nodemailer + Twilio integration
- **PDF Generation**: Dynamic certificates and transcripts
- **API Design**: RESTful with OpenAPI documentation
- **Security**: Rate limiting, input validation, encryption

### Frontend (React + TailwindCSS)
- **Modern UI**: Material-UI components with custom Tailwind styling
- **State Management**: Redux Toolkit with persistence
- **Routing**: React Router with protected routes
- **Forms**: React Hook Form with Yup validation
- **Charts**: Recharts and ApexCharts for analytics
- **Responsive Design**: Mobile-first approach
- **Performance**: Code splitting, lazy loading, optimization

### DevOps & Deployment
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for local development
- **CI/CD**: GitHub Actions with automated testing
- **Cloud Deployment**: Render.com ready configuration
- **Monitoring**: Health checks, logging, error tracking
- **Testing**: Unit, integration, and E2E test suites

## 🚀 Quick Start Guide

### Prerequisites
```bash
# Required software
Node.js 18+
Docker & Docker Compose
Git
```

### Option 1: Docker Compose (Recommended)
```bash
# Clone the repository
git clone https://github.com/Mustafa1998-tech/University-System-by-MERN-Stack.git
cd University-System-by-MERN-Stack

# Copy environment files (Linux/macOS)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Copy environment files (PowerShell)
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env

# Start all services
docker-compose up -d

# Import sample data
docker-compose exec backend npm run seed:dev

# View logs
docker-compose logs -f backend frontend
```

### Option 2: Manual Setup
```bash
# Install dependencies
npm run install:all

# Start MongoDB and Redis
docker-compose up mongodb redis -d

# Start backend
cd backend
npm run dev

# Start frontend (in new terminal)
cd frontend
npm start
```

### 🌐 Access Points
| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | admin@university.edu / admin123 |
| Backend API | http://localhost:5000/api/v1 | - |
| API Documentation | http://localhost:5000/api-docs | - |
| MongoDB Admin | http://localhost:8081 | admin / admin123 |
| Redis Admin | http://localhost:8082 | - |
| Email Testing | http://localhost:8025 | - |

## 📊 Sample Data & Demo Accounts

The system comes with comprehensive sample data:

### Demo Accounts
| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@university.edu | admin123 | Full system access |
| Staff | staff@university.edu | staff123 | Administrative functions |
| Instructor | instructor@university.edu | instructor123 | Course management |
| Student | student@university.edu | student123 | Student portal |
| Librarian | librarian@university.edu | librarian123 | Library system |
| Alumni | alumni@university.edu | alumni123 | Alumni network |

### Sample Data Includes
- **200 Students** with complete academic records
- **30 Instructors** with courses and publications
- **15 Staff Members** with full HR records
- **100 Courses** across multiple departments
- **5 Departments** and 3 Faculties
- **50 Library Books** with borrowing history
- **20 Events** and activities
- **Financial Records** including tuition and payroll
- **Complete Audit Trail** for all operations

## 🧪 Testing & Quality Assurance

### Running Tests
```bash
# Backend tests
cd backend
npm test                    # Unit tests
npm run test:integration    # Integration tests
npm run test:coverage       # Coverage report

# Frontend tests
cd frontend
npm test                    # React component tests
npm run test:e2e           # Cypress E2E tests

# API testing with Postman
docker-compose --profile test up postman
```

### Test Coverage
- **Backend**: 85%+ code coverage
- **Frontend**: 80%+ component coverage
- **API**: 100% endpoint coverage
- **E2E**: Complete user journey testing

## 🚢 Production Deployment

### Render.com Deployment
```bash
# 1. Fork this repository
# 2. Connect to Render.com
# 3. Create services:

# Web Service (Backend)
- Build Command: cd backend && npm install && npm run build
- Start Command: cd backend && npm start
- Environment: Node.js

# Static Site (Frontend)
- Build Command: cd frontend && npm install && npm run build
- Publish Directory: frontend/build

# Database
- MongoDB Atlas or Render PostgreSQL
```

### Environment Variables
```bash
# Backend (.env)
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
EMAIL_SERVICE_API_KEY=your-email-service-key
SMS_SERVICE_API_KEY=your-sms-service-key

# Frontend (.env)
REACT_APP_API_URL=https://your-backend-url.com/api/v1
REACT_APP_SOCKET_URL=https://your-backend-url.com
```

## 📁 Project Structure
```
sis/
├── backend/                    # Node.js Express API Server
│   ├── src/
│   │   ├── controllers/        # API route controllers
│   │   ├── models/            # MongoDB Mongoose models
│   │   ├── routes/            # Express route definitions
│   │   ├── middleware/        # Custom middleware
│   │   ├── utils/             # Utility functions
│   │   ├── seeders/           # Database seeders
│   │   └── locales/           # i18n translation files
│   ├── tests/                 # Backend test suites
│   ├── uploads/               # File uploads storage
│   ├── logs/                  # Application logs
│   └── certificates/          # Generated certificates
├── frontend/                   # React Application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   ├── store/             # Redux store
│   │   ├── services/          # API service functions
│   │   ├── utils/             # Helper utilities
│   │   └── i18n/              # Internationalization
│   ├── public/                # Static assets
│   └── build/                 # Production build
├── docker/                     # Docker configurations
│   ├── nginx/                 # Nginx configs
│   └── scripts/               # Docker scripts
├── postman/                    # API testing collections
├── docs/                       # Documentation
├── tests/                      # Integration & E2E tests
└── scripts/                    # Utility scripts
```

## 🔧 Development Commands

```bash
# Root level commands
npm run dev                     # Start full development environment
npm run build                   # Build all applications
npm run test                    # Run all tests
npm run lint                    # Lint all code
npm run install:all             # Install all dependencies
npm run clean                   # Clean all node_modules
npm run reset                   # Clean and reinstall

# Docker commands
docker-compose up -d            # Start all services
docker-compose --profile tools up  # Start with admin tools
docker-compose --profile test up   # Run tests
docker-compose logs -f backend     # View backend logs
docker-compose exec backend bash   # Access backend container

# Database commands
npm run seed                    # Seed database with sample data
npm run migrate                 # Run database migrations
npm run backup                  # Backup database
npm run restore                 # Restore database
```

## 🔒 Security Features

- **Authentication**: JWT with refresh tokens and secure storage
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive server-side validation
- **Rate Limiting**: API endpoint protection
- **CORS**: Configured for production security
- **Encryption**: Sensitive data encryption at rest
- **File Upload**: Virus scanning and type validation
- **Audit Logging**: Complete activity tracking
- **Security Headers**: Helmet.js protection
- **Password Policy**: Strong password requirements

## 📊 Performance Optimizations

- **Database**: Indexed queries, aggregation pipelines
- **Caching**: Redis for frequently accessed data
- **Frontend**: Code splitting, lazy loading, memoization
- **API**: Response compression, pagination
- **Images**: Optimized formats and sizes
- **CDN**: Static asset delivery
- **Monitoring**: Performance metrics and alerts

## 🌐 Internationalization (i18n)

### Supported Languages
- **English (en)**: Default language, LTR layout
- **Arabic (ar)**: Complete RTL support, cultural adaptation

### Features
- Automatic language detection
- Dynamic layout switching (LTR/RTL)
- Localized date and number formats
- Currency and timezone handling
- Translated error messages
- Multilingual PDF generation
- Cultural content adaptation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write unit tests for new features
- Update documentation
- Ensure i18n support for new content
- Test in both languages

## 📞 Support & Documentation

- **API Documentation**: http://localhost:5000/api-docs
- **User Manual**: [docs/USER_MANUAL.md](docs/USER_MANUAL.md)
- **Admin Guide**: [docs/ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md)
- **Deployment Guide**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Development Guide**: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- **Troubleshooting**: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with love using the MERN stack
- Inspired by modern university management needs
- Designed for the global education community
- Special thanks to the open-source community

---

**Ready to revolutionize university management? 🚀**

Start with `docker-compose up -d` and visit http://localhost:3000

*Built with ❤️ for the future of education*
