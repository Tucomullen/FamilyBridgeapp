# FamilyBridge Backend API

Backend API for FamilyBridge Senior App integration. Provides authentication, photo management, and telemetry services.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (optional)

### Local Development

1. **Install dependencies**
   ```bash
   cd apps/backend
   npm install
   ```

2. **Set up environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build and start production**
   ```bash
   npm run build
   npm start
   ```

### Docker Development

1. **Build and run with Docker Compose**
   ```bash
   cd apps/backend
   docker-compose up --build
   ```

2. **Run in background**
   ```bash
   docker-compose up -d
   ```

## 📡 API Endpoints

### Health Check
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system information

### Authentication
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile (protected)
- `POST /auth/logout` - User logout
- `GET /auth/verify` - Verify token (protected)

### Photos
- `GET /photos` - Get family photos (protected)
- `GET /photos/:id` - Get specific photo (protected)
- `POST /photos` - Upload photo (protected)
- `DELETE /photos/:id` - Delete photo (protected)

### Telemetry
- `POST /telemetry` - Submit telemetry event (protected)
- `GET /telemetry` - Get family telemetry (family role only)
- `GET /telemetry/stats` - Get telemetry statistics (family role only)

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Mock Users
For development, the following users are available:

**Senior User:**
- Email: `senior@familybridge.com`
- Password: `password123`
- Role: `senior`

**Family User:**
- Email: `family@familybridge.com`
- Password: `password123`
- Role: `family`

## 🌐 CORS Configuration

The API is configured to allow requests from:
- `http://localhost:8081` (Expo development server)
- `exp://192.168.1.100:8081` (Expo tunnel)

## 🔒 Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **CORS** - Restricted to development URLs
- **JWT** - Secure token-based authentication
- **Input Validation** - Request validation and sanitization

## 📊 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | JWT signing secret | `devsecret` |
| `CORS_ORIGIN` | Allowed origins | `localhost:8081` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test -- --coverage

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📝 Development Notes

- **Mock Data**: All data is stored in memory (mock databases)
- **JWT Secret**: Change `JWT_SECRET` in production
- **CORS**: Update `CORS_ORIGIN` for production domains
- **Rate Limiting**: Adjust limits based on expected traffic
- **Logging**: All requests and errors are logged to console

## 🚨 Production Considerations

- Replace mock databases with real database (PostgreSQL, MongoDB, etc.)
- Use environment-specific configuration
- Implement proper user management and password hashing
- Add request validation and sanitization
- Set up monitoring and alerting
- Use HTTPS in production
- Implement proper backup and recovery procedures

## 📞 Support

For issues or questions, please contact the FamilyBridge development team.
