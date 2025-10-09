# 🧭 FamilyBridge

> Connecting seniors with their families through ultra-simple, secure, and accessible technology.

## 🎯 Mission

To connect seniors with their families through an **ultra-simple, secure, and accessible** app that enables them to **communicate, share moments, and feel accompanied**, without technological barriers.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 13+
- Expo CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/Tucomullen/FamilyBridgeapp.git
cd FamilyBridgeapp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev
```

## 📱 Project Structure

```
FamilyBridgeapp/
├── senior-app/          # React Native app for seniors
├── family-panel/        # React web app for family members
├── apps/
│   └── backend/         # Node.js/Express backend API
├── services/
│   └── signaling/       # WebRTC signaling server
├── docs/               # Documentation
└── tasks.md            # Development tasks
```

## 🧩 Core Features (MVP)

1. **One-touch calling** - Tap a name or photo to instantly start an audio or video call
2. **SOS button** - Red button that sends instant alerts to main family contact
3. **Photo sharing** - Family members upload photos; seniors view them in large format

## 🔌 Backend API Integration (Task 2.4)

The FamilyBridge Senior App now includes full backend API integration for secure communication, authentication, and data synchronization.

### Backend Services
- **Node.js/Express API** - RESTful backend with JWT authentication
- **Health Monitoring** - Real-time server status and connectivity checks
- **Photo Management** - Secure photo upload, storage, and sharing
- **Telemetry** - Privacy-focused event tracking and analytics
- **Data Sync** - Offline-first synchronization with retry logic

### Mobile Integration
- **ApiService** - Centralized HTTP client with error handling and retries
- **AuthManager** - Secure token management with Expo SecureStore
- **SyncService** - Offline queue management for data synchronization
- **DevApiScreen** - Development tools for testing API connectivity

### Quick Backend Setup

```bash
# Start the backend API
cd apps/backend
npm install
npm run dev

# Backend will be available at http://localhost:4000
# Health check: http://localhost:4000/health
```

### Testing API Integration

1. Open the Senior App
2. Go to Settings → 🔧 API Development
3. Test server connectivity and authentication
4. Monitor sync status and telemetry events

### Security Features
- JWT-based authentication with secure token storage
- CORS protection for development URLs only
- Rate limiting (100 requests per 15 minutes)
- Privacy-first telemetry (no PII collected)
- HTTPS enforcement in production

For detailed security information, see [apps/backend/SECURITY.md](apps/backend/SECURITY.md).

## 🛠️ Tech Stack

- **Frontend (Senior)**: React Native + Expo
- **Frontend (Family)**: React + Vite
- **Backend**: FastAPI + PostgreSQL
- **Infrastructure**: GitHub Actions + Railway/Firebase

## 📋 Development

See [tasks.md](./tasks.md) for detailed development tasks and [scope.md](./scope.md) for complete project requirements.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Project Documentation](./docs/)
- [Development Tasks](./tasks.md)
- [Product Requirements](./scope.md)
- [GitHub Issues](https://github.com/Tucomullen/FamilyBridgeapp/issues)
- [GitHub Projects](https://github.com/Tucomullen/FamilyBridgeapp/projects)
