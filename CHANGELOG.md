# Changelog

All notable changes to the FamilyBridge project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Advanced TTS Features (Task 2.5)**
  - Comprehensive text-to-speech service with voice selection and controls
  - Multiple voice support with automatic language detection
  - Speed, pitch, and volume controls for personalized experience
  - Spoken feedback integration across all core screens
  - Voice settings UI in Settings screen with accessibility features
  - WCAG 2.2 AA compliance for accessibility standards
  - VoiceOver/TalkBack support for screen readers
  - Error handling and graceful fallbacks when TTS is unavailable
  - Unit tests for TTS service and settings functionality

### Changed
- Enhanced Settings screen with Voice Settings section
- Updated all core screens (Home, SOS, Photos, Call) with spoken feedback
- Improved accessibility with larger touch targets and high contrast UI
- Added voice feedback toggle in Accessibility settings

### Technical Details
- New `TTSService` class with comprehensive voice management
- Integration with Expo Speech API for cross-platform TTS
- Persistent voice preferences using AsyncStorage
- Spanish and English language support with automatic detection
- Comprehensive error handling and retry logic
- Unit test coverage for all TTS functionality

## [2.0.0-alpha.4] - 2024-01-09

### Added
- **Backend API Integration (Task 2.4)**
  - Node.js/Express backend API with JWT authentication
  - Mobile app integration with ApiService, AuthManager, and SyncService
  - Real-time server status monitoring and development tools
  - Offline-first data synchronization with retry logic
  - Privacy-focused telemetry collection and backend transmission
  - Comprehensive security features and documentation
  - TypeScript compilation successful
  - All acceptance criteria met for Task 2.4

### Technical Details
- Backend API with RESTful endpoints (health, auth, photos, telemetry)
- JWT-based authentication with role-based access control
- CORS protection and rate limiting
- Health check and monitoring endpoints
- Mock data for development and testing
- Secure token storage with Expo SecureStore
- Offline queue management for data sync
- Real-time server status monitoring
- Privacy-first telemetry collection
- Development tools for API testing

## [2.0.0-alpha.3] - 2024-01-09

### Added
- **Real Photo Management (Task 2.3)**
  - Complete camera integration with expo-camera
  - Photo gallery with swipe navigation
  - Photo sharing functionality
  - Photo deletion with confirmation
  - Mock photo generation for testing
  - Comprehensive error handling and permissions

### Technical Details
- PhotoService for photo management and storage
- CameraManager for camera operations and permissions
- Enhanced PhotosScreen with full functionality
- AsyncStorage integration for photo metadata
- Share API integration for photo sharing
- Comprehensive unit tests and error handling

## [2.0.0-alpha.2] - 2024-01-09

### Added
- **SOS Emergency System (Task 2.2)**
  - Emergency alert system with location tracking
  - Push notification integration
  - Location services with privacy controls
  - Emergency confirmation modal
  - Development notification logging
  - Comprehensive error handling

### Technical Details
- NotificationService for push notifications
- LocationService for GPS tracking
- SOS screen with emergency controls
- Privacy-first location handling
- Development tools for testing alerts

## [2.0.0-alpha.1] - 2024-01-09

### Added
- **WebRTC Real Calls (Task 2.1)**
  - Real video calling functionality
  - WebRTC integration with react-native-webrtc
  - Call state management and UI
  - Camera switching and mute controls
  - Call quality indicators
  - Comprehensive error handling

### Technical Details
- WebRTC peer connection management
- Video stream handling and display
- Call state management with hooks
- Camera and microphone controls
- Quality monitoring and statistics

## [1.0.0] - 2024-01-09

### Added
- Initial release of FamilyBridge Senior App
- Basic navigation and screen structure
- Onboarding flow with permissions
- Settings screen with feature flags
- Internationalization (Spanish/English)
- Basic accessibility features
- Development tools and testing infrastructure

### Technical Details
- React Native with Expo framework
- TypeScript for type safety
- Navigation with React Navigation
- State management with React hooks
- Internationalization with custom i18n system
- Feature flags for development
- Comprehensive testing setup