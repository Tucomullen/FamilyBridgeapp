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

## 🔊 Advanced TTS Features (Task 2.5)

The FamilyBridge Senior App now includes comprehensive text-to-speech (TTS) capabilities designed specifically for senior users with accessibility needs.

### Voice Features
- **Multiple Voice Selection** - Choose from available system voices
- **Speed Control** - Adjust speech rate from 0.5x to 1.5x
- **Pitch Control** - Modify voice pitch for comfort
- **Volume Control** - Fine-tune speech volume
- **Language Detection** - Automatically selects appropriate voice based on device language

### Spoken Feedback Integration
- **Home Screen** - Announces button names when pressed ("Llamar", "Fotos", "SOS")
- **SOS Screen** - Confirms emergency actions ("SOS activado", "Alerta enviada")
- **Photos Screen** - Provides feedback for photo actions ("Foto tomada", "Foto compartida")
- **Call Screen** - Announces call controls ("Micrófono activado", "Llamada finalizada")
- **Settings Screen** - Voice testing and configuration

### Accessibility Features
- **WCAG 2.2 AA Compliance** - Meets accessibility standards
- **VoiceOver/TalkBack Support** - Compatible with screen readers
- **High Contrast UI** - Large touch targets (≥48px) and clear labels
- **Voice Feedback Toggle** - Users can enable/disable spoken confirmations
- **Error Handling** - Graceful fallbacks when TTS is unavailable

### Testing TTS Features

1. **Voice Settings**:
   - Open Settings → Voice Settings
   - Select preferred voice from dropdown
   - Adjust speed, pitch, and volume
   - Test voice with "Test Voice" button

2. **Spoken Feedback**:
   - Enable "Voice Feedback" in Settings → Accessibility
   - Navigate through the app and press buttons
   - Listen for spoken confirmations of actions

3. **Simulator Testing**:
   - iOS Simulator: TTS works with system voices
   - Android Emulator: May require device for full TTS functionality
   - Expo Go: Limited TTS support, use development build for full features

### Voice Examples
- **Spanish**: "Hola, soy tu asistente FamilyBridge. ¿Cómo estás hoy?"
- **English**: "Hello, I am your FamilyBridge assistant. How are you today?"
- **Action Confirmations**: "Foto tomada", "SOS activado", "Llamada iniciada"

## 🧭 Enhanced Navigation (Task 2.8)

The app features enhanced navigation designed specifically for seniors, providing clear visual cues and predictable navigation patterns.

### Features

- **Clear Breadcrumbs**: Maximum 2 levels showing current location (e.g., "Inicio › Fotos")
- **Consistent Back Button**: Always in top-left corner with high contrast (↑ Volver)
- **Quick Home Button**: Fixed "🏠 Inicio" button always visible (except on Home screen)
- **Navigation History**: Reliable back navigation with in-memory history stack
- **TTS Feedback**: Audio confirmation for all navigation actions
- **Accessibility**: Large touch targets (≥48px) and screen reader support

### How It Works

1. **Breadcrumbs**: Show current location with maximum 2 levels, first level clickable
2. **Back Button**: Predictable back navigation - goes to previous screen or Home
3. **Quick Home**: One-tap return to main screen from anywhere
4. **Navigation History**: Maintains last 10 navigation entries for reliable back behavior
5. **TTS Feedback**: Brief audio confirmation ("Volviendo atrás", "Volviendo a inicio")

### Accessibility Benefits

- **Large Touch Targets**: All navigation controls ≥48px for easy tapping
- **High Contrast**: Clear visual distinction for navigation elements
- **Screen Reader Support**: Proper accessibility labels and roles
- **Predictable Behavior**: Consistent navigation patterns reduce confusion
- **Voice Feedback**: Audio confirmation for all navigation actions

### Technical Details

- **NavigationService**: Centralized navigation management with history tracking
- **Event System**: Custom event emitter for UI updates
- **React Navigation Integration**: Seamless integration with existing navigation
- **i18n Support**: Full Spanish and English localization
- **Memory Management**: Limited history stack (max 10 entries) for performance

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
