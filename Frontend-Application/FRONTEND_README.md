# Admin Dashboard Frontend

A modern, responsive Angular 21 Admin Dashboard for managing Travel Management System entities including Users, Travels, and Payment Methods.

## Features

✅ **Complete CRUD Operations**
- User Management: Create, read, update, delete users with role assignment
- Travel Management: Manage travel itineraries with destination, dates, activities, accommodation, and transportation
- Payment Methods: Configure payment providers (Stripe, PayPal) with custom settings

✅ **Authentication & Security**
- JWT-based authentication with token management
- Protected routes requiring ADMIN role
- HTTP interceptor for automatic token injection
- Automatic logout on 401 Unauthorized responses
- Secure token storage in localStorage

✅ **Responsive UI**
- Modern gradient design with Tailwind CSS
- Mobile-friendly interface
- Form validation with real-time feedback
- Loading states and error handling
- Confirmation dialogs for destructive actions

✅ **Developer Experience**
- Angular 21 with standalone components
- Signal-based state management
- Reactive Forms for data binding
- Type-safe TypeScript with strict mode
- 21 passing unit tests
- Vitest configuration for fast test execution

## Project Structure

```
src/app/
├── core/
│   ├── guards/          # Auth guard for protected routes
│   ├── interceptors/    # HTTP interceptor for JWT tokens
│   └── services/        # Core services (Auth)
├── features/
│   ├── auth/            # Login page
│   ├── dashboard/       # Main dashboard layout
│   ├── users/           # User management module
│   ├── travels/         # Travel management module
│   └── payment/         # Payment methods module
├── shared/
│   └── models/          # Shared entity models
├── app.routes.ts        # Route configuration
├── app.config.ts        # Application configuration
└── app.ts               # Root component
```

## Architecture

### Authentication Flow
1. User enters credentials on login page
2. `AuthService.login()` sends POST to `/auth/admin/login`
3. Backend returns JWT token
4. Token stored in localStorage
5. `AuthInterceptor` automatically injects token in Authorization header
6. `authGuard` prevents access to protected routes without valid token

### Service Layer
- **AuthService**: Manages login/logout and JWT token lifecycle
- **UserService**: CRUD operations for users via `/users/admin/users`
- **TravelService**: CRUD operations for travels via `/travel/admin/travels`
- **PaymentMethodService**: CRUD operations for payment methods via `/payment/admin/methods`

### Component Hierarchy
```
App (root)
└── Router
    ├── LoginComponent
    └── DashboardComponent (protected)
        ├── UsersComponent
        ├── TravelsComponent
        └── PaymentMethodsComponent
```

## Getting Started

### Prerequisites
- Node.js 20+ and npm 10.9.2+
- Docker and Docker Compose for backend services

### Installation

```bash
cd Frontend-Application
npm install
```

### Development Server

```bash
# Start development server
npm start

# Application runs at http://localhost:4200
```

### Building

```bash
# Build for production
npm run build

# Output: dist/Frontend-Application/browser/
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- user.service.spec.ts
```

## Usage Guide

### Login
1. Navigate to http://localhost:4200
2. Enter credentials:
   - Username: `admin` (configurable via environment)
   - Password: `admin123` (configurable via environment)
3. Click "Sign In"

### Managing Users
1. Click "Users" in sidebar
2. **Add User**: Click "+ Add User" button
   - Enter email
   - Toggle enabled status
   - Enter roles (comma-separated, e.g., "ADMIN, USER")
3. **Edit User**: Click "Edit" on any user row
4. **Delete User**: Click "Delete" (requires confirmation)

### Managing Travels
1. Click "Travels" in sidebar
2. **Add Travel**: Click "+ Add Travel" button
   - Enter destination*
   - Select start and end dates*
   - Enter duration in days*
   - Add activities, accommodation, transportation details
3. **Edit Travel**: Click "Edit" to modify
4. **Delete Travel**: Click "Delete"

### Managing Payment Methods
1. Click "Payment Methods" in sidebar
2. **Add Method**: Click "+ Add Payment Method" button
   - Select provider (Stripe, PayPal, Other)*
   - Enter display name*
   - Toggle enabled status
   - Add configuration (JSON recommended)
3. **Edit Method**: Click "Edit" to update
4. **Delete Method**: Click "Delete"

## Configuration

### Environment Variables
Create a `.env` file in Frontend-Application directory:

```
# Development configuration
NG_APP_API_URL=http://localhost:8080
NG_APP_JWT_EXPIRATION=86400000
```

### Docker Build

```bash
# Build Docker image
docker build -f Frontend-Application/Dockerfile -t travel-frontend:latest .

# Run container
docker run -p 4200:443 -p 4201:80 travel-frontend:latest
```

## API Integration Points

### Authentication Endpoint
```
POST /auth/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "token": "eyJhbGc...",
  "tokenType": "Bearer"
}
```

### User Endpoints
```
GET    /users/admin/users              # List all users
POST   /users/admin/users              # Create user
PUT    /users/admin/users/{id}         # Update user
DELETE /users/admin/users/{id}         # Delete user
```

### Travel Endpoints
```
GET    /travel/admin/travels           # List all travels
POST   /travel/admin/travels           # Create travel
PUT    /travel/admin/travels/{id}      # Update travel
DELETE /travel/admin/travels/{id}      # Delete travel
```

### Payment Methods Endpoints
```
GET    /payment/admin/methods          # List all methods
POST   /payment/admin/methods          # Create method
PUT    /payment/admin/methods/{id}     # Update method
DELETE /payment/admin/methods/{id}     # Delete method
```

## Testing

### Unit Tests Coverage
- **AuthService**: Login, logout, token management (4 tests)
- **UserService**: CRUD operations for users (5 tests)
- **TravelService**: CRUD operations for travels (5 tests)
- **PaymentMethodService**: CRUD operations for payment methods (5 tests)
- **App Component**: Router outlet rendering (2 tests)

**Total: 21 passing tests**

### Running Tests with Coverage
```bash
npm test -- --coverage
```

### Test Configuration
- Framework: Vitest 4.0.8
- Testing Utilities: Angular TestBed
- HTTP Mocking: HttpClientTestingModule

## Security Features

✅ **Authentication**
- JWT token-based authentication
- Secure token storage
- Automatic token injection via interceptor

✅ **Authorization**
- Role-based access control (ADMIN role required)
- Route guards prevent unauthorized navigation
- 401 response handling with automatic logout

✅ **Data Protection**
- HTTPS/TLS for all communications
- Secure cookie settings
- CSRF protection via framework defaults

✅ **Input Validation**
- Client-side form validation
- Email format validation for users
- Required field enforcement
- Type-safe TypeScript

## Styling & UI

- **CSS Framework**: Tailwind CSS 4.1.12
- **Design**: Modern gradient design with purple-blue theme
- **Responsive**: Mobile-first responsive design
- **Accessibility**: Semantic HTML, ARIA labels

## Browser Support

- ✅ Google Chrome (latest)
- ✅ Mozilla Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Performance

- **Bundle Size**: ~333 KB initial (81.5 KB gzipped)
- **Build Time**: ~1.4 seconds
- **Test Execution**: ~900ms for 21 tests

## Troubleshooting

### Login fails with 401
- Verify backend auth service is running
- Check admin credentials in environment
- Ensure JWT_SECRET matches backend configuration

### API calls return 404
- Confirm microservices are running (user, travel, payment)
- Check gateway is properly routing requests
- Verify correct API endpoint paths

### Styling not loading
- Clear browser cache
- Rebuild with `npm run build`
- Check Tailwind CSS configuration in tailwind.config.js

### Tests failing
- Clear node_modules: `rm -rf node_modules && npm install`
- Rebuild with `npm run build`
- Check Angular/TypeScript versions compatibility

## Development Workflow

1. **Create a branch** for your feature
2. **Make changes** to components/services
3. **Write tests** for new functionality
4. **Run tests** locally: `npm test`
5. **Build** for verification: `npm run build`
6. **Create Pull Request** with description
7. **Pass code review** before merging

## Dependencies

### Core Framework
- @angular/core ^21.0.0
- @angular/router ^21.0.0
- @angular/forms ^21.0.0
- @angular/common ^21.0.0
- TypeScript ~5.9.2
- RxJS ~7.8.0

### Styling
- Tailwind CSS ^4.1.12
- PostCSS ^8.5.3

### Development
- @angular/cli ^21.0.4
- @angular/compiler-cli ^21.0.0
- Vitest ^4.0.8

## Contributing

Please follow these guidelines:
1. Use Angular 21 standalone components
2. Follow TypeScript strict mode
3. Write tests for all features
4. Use semantic HTML
5. Ensure responsive design
6. Follow existing code style

## License

Internal project - all rights reserved

## Support

For issues or questions, please contact the development team or create an issue in the repository.
