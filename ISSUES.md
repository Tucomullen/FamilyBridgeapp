# 🎫 FamilyBridge — GitHub Issues for Phase 1 MVP

## Overview
This document contains all GitHub issues derived from the development tasks in `tasks.md`. Issues are organized by category and priority for easy project management.

---

## 🚨 Priority P0 (Critical for MVP)

### Setup & Environment
- **Issue #1**: Initialize React Native Project
- **Issue #2**: Create Family Web Panel  
- **Issue #3**: Setup Backend API
- **Issue #4**: Configure CI/CD Pipeline
- **Issue #5**: Install Dependencies

### Core Features
- **Issue #11**: Implement One-Touch Calling
- **Issue #12**: Create SOS Alert System
- **Issue #13**: Build Photo Upload System
- **Issue #14**: Add Photo Sharing for Seniors
- **Issue #15**: Implement Real-time Notifications

### Onboarding & First-Use
- **Issue #16**: Welcome Screen
- **Issue #17**: Permission Screen
- **Issue #18**: Family Link Screen
- **Issue #19**: Voice Support

---

## 🔥 Priority P1 (High - UI/UX)

### UI/UX (Senior App)
- **Issue #6**: Design Main Screen Layout
- **Issue #7**: Implement High-Contrast Theme
- **Issue #8**: Build Contact List Screen
- **Issue #9**: Create Photo Viewing Interface
- **Issue #10**: Design Family Web Dashboard

---

## 📋 Issue Details by Category

### 1. Setup & Environment Issues

#### Issue #1: Initialize React Native Project
- **Labels**: `setup`, `P0`
- **Milestone**: `Phase 1 - MVP`
- **Description**: Set up Expo-based React Native project for senior mobile app with proper folder structure
- **Deliverable**: `senior-app/` directory with Expo configuration
- **Acceptance Criteria**:
  - Expo project initialized with TypeScript
  - Proper folder structure created
  - Basic navigation setup
  - Accessibility configuration included
- **Commit Message**: `feat: initialize React Native senior app with Expo`

#### Issue #2: Create Family Web Panel
- **Labels**: `setup`, `P0`
- **Milestone**: `Phase 1 - MVP`
- **Description**: Set up React + Vite project for family member web interface
- **Deliverable**: `family-panel/` directory with Vite configuration
- **Acceptance Criteria**:
  - Vite project initialized with TypeScript
  - React Router setup
  - Responsive design configuration
  - Basic component structure
- **Commit Message**: `feat: create React family panel with Vite`

#### Issue #3: Setup Backend API
- **Labels**: `setup`, `P0`
- **Milestone**: `Phase 1 - MVP`
- **Description**: Initialize FastAPI backend with PostgreSQL database connection
- **Deliverable**: `backend/` directory with FastAPI app and database models
- **Acceptance Criteria**:
  - FastAPI application structure
  - PostgreSQL connection configured
  - Basic API endpoints
  - Database models defined
  - Environment configuration
- **Commit Message**: `feat: setup FastAPI backend with PostgreSQL`

#### Issue #4: Configure CI/CD Pipeline
- **Labels**: `setup`, `P0`
- **Milestone**: `Phase 1 - MVP`
- **Description**: Set up GitHub Actions for automated testing and deployment
- **Deliverable**: `.github/workflows/` with CI/CD configuration
- **Acceptance Criteria**:
  - Automated testing on PR
  - Linting and security checks
  - Build verification
  - Deployment pipeline
- **Commit Message**: `ci: setup GitHub Actions for automated deployment`

#### Issue #5: Install Dependencies
- **Labels**: `setup`, `P0`
- **Milestone**: `Phase 1 - MVP`
- **Description**: Install and configure all required packages for both frontend and backend
- **Deliverable**: `package.json` files with all dependencies
- **Acceptance Criteria**:
  - All dependencies installed
  - Package versions locked
  - Workspace configuration
  - Development scripts ready
- **Commit Message**: `chore: install and configure project dependencies`

### 2. UI/UX (Senior App) Issues

#### Issue #6: Design Main Screen Layout
- **Labels**: `ui`, `accessibility`, `P1`
- **Milestone**: `Phase 1 - MVP`
- **Description**: Create main screen with 3 large, clearly labeled buttons (Call, SOS, Photos)
- **Deliverable**: `MainScreen.tsx` component
- **Acceptance Criteria**:
  - Three large, clearly labeled buttons
  - High contrast design (WCAG 2.2 compliant)
  - Touch-friendly sizing (minimum 44pt)
  - Plain language labels
  - Single action per button
- **Commit Message**: `feat: implement main screen with 3 core action buttons`
- **Related**: See [scope.md#simplicity-and-design-rules](./scope.md#simplicity-and-design-rules)

#### Issue #7: Implement High-Contrast Theme
- **Labels**: `ui`, `accessibility`, `P1`
- **Milestone**: `Phase 1 - MVP`
- **Description**: Create accessibility-focused theme with large typography (18pt+) and high contrast colors
- **Deliverable**: `theme.ts` and `styles.ts` files
- **Acceptance Criteria**:
  - Typography ≥ 18pt minimum
  - High contrast color scheme
  - WCAG 2.2 AA compliance
  - Dark/light mode support
  - Consistent spacing system
- **Commit Message**: `feat: add high-contrast theme with large typography`
- **Related**: See [scope.md#simplicity-and-design-rules](./scope.md#simplicity-and-design-rules)

#### Issue #8: Build Contact List Screen
- **Labels**: `ui`, `accessibility`, `P1`
- **Milestone**: `Phase 1 - MVP`
- **Description**: Design contact list with large photos and clear names for easy selection
- **Deliverable**: `ContactListScreen.tsx` component
- **Acceptance Criteria**:
  - Large, clear contact photos
  - Readable names (≥ 18pt)
  - Easy touch targets
  - Simple navigation
  - Loading states
- **Commit Message**: `feat: create contact list with large photos and names`

#### Issue #9: Create Photo Viewing Interface
- **Labels**: `ui`, `accessibility`, `P1`
- **Milestone**: `Phase 1 - MVP`
- **Description**: Build large-format photo display screen for seniors to view family photos
- **Deliverable**: `PhotoViewerScreen.tsx` component
- **Acceptance Criteria**:
  - Full-screen photo display
  - Simple navigation (swipe/buttons)
  - Large, clear interface
  - Loading indicators
  - Error handling
- **Commit Message**: `feat: implement large-format photo viewing interface`

#### Issue #10: Design Family Web Dashboard
- **Labels**: `ui`, `accessibility`, `P1`
- **Milestone**: `Phase 1 - MVP`
- **Description**: Create web interface for family members to manage contacts and upload photos
- **Deliverable**: `Dashboard.tsx` component
- **Acceptance Criteria**:
  - Contact management interface
  - Photo upload functionality
  - Responsive design
  - Clear navigation
  - Status indicators
- **Commit Message**: `feat: create family dashboard for contact and photo management`

### 3. Core Features Issues

#### Issue #11: Implement One-Touch Calling
- **Labels**: `feature`, `mvp`, `P0`
- **Milestone**: `Phase 1 - MVP`
- **Description**: Build audio/video calling functionality with single tap to initiate calls
- **Deliverable**: `CallService.ts` and calling components
- **Acceptance Criteria**:
  - Single tap to start call
  - Audio and video support
  - Call quality indicators
  - Error handling
  - Call duration < 30 seconds to connect
- **Commit Message**: `feat: implement one-touch audio/video calling system`
- **Related**: See [scope.md#mvp-success-metrics](./scope.md#mvp-success-metrics)

#### Issue #12: Create SOS Alert System
- **Labels**: `feature`, `mvp`, `P0`
- **Milestone**: `Phase 1 - MVP`
- **Description**: Build red SOS button that sends instant alerts to main family contact
- **Deliverable**: `SOSService.ts` and `SOSButton.tsx`
- **Acceptance Criteria**:
  - Prominent red SOS button
  - Instant alert to family contact
  - Push notification support
  - Alert confirmation
  - Alert delivery < 1 minute
- **Commit Message**: `feat: add SOS button with instant family alert system`
- **Related**: See [scope.md#mvp-success-metrics](./scope.md#mvp-success-metrics)

#### Issue #13: Build Photo Upload System
- **Labels**: `feature`, `mvp`, `P0`
- **Milestone**: `Phase 1 - MVP`
- **Description**: Create system for family members to upload photos from web panel
- **Deliverable**: `PhotoUploadService.ts` and upload components
- **Acceptance Criteria**:
  - Drag & drop upload
  - Multiple file selection
  - Progress indicators
  - Image compression
  - Error handling
- **Commit Message**: `feat: implement photo upload system for family members`

#### Issue #14: Add Photo Sharing for Seniors
- **Labels**: `feature`, `mvp`, `P0`
- **Milestone**: `Phase 1 - MVP`
- **Description**: Enable seniors to view and react to family photos with simple emojis
- **Deliverable**: `PhotoSharingService.ts` and reaction components
- **Acceptance Criteria**:
  - Large emoji reactions
  - Simple tap to react
  - Visual feedback
  - Reaction history
  - Offline support
- **Commit Message**: `feat: add photo sharing and emoji reactions for seniors`

#### Issue #15: Implement Real-time Notifications
- **Labels**: `feature`, `mvp`, `P0`
- **Milestone**: `Phase 1 - MVP`
- **Description**: Set up push notifications for SOS alerts and new photos
- **Deliverable**: `NotificationService.ts`
- **Acceptance Criteria**:
  - Push notification setup
  - SOS alert notifications
  - New photo notifications
  - Notification permissions
  - Background processing
- **Commit Message**: `feat: add real-time notifications for alerts and photo updates`

### 4. Onboarding & First-Use Issues

#### Issue #16: Welcome Screen
- **Labels**: `onboarding`, `ui`, `accessibility`, `P0`
- **Milestone**: `Phase 1 - MVP`
- **Description**: Create simple introduction screen with large, friendly text and prominent "Start" button
- **Deliverable**: `WelcomeScreen.tsx` component
- **Acceptance Criteria**:
  - Large, high-contrast text (≥ 24pt)
  - Prominent "Start" button
  - Voice narration support
  - Simple, reassuring language
  - One action per screen
- **Commit Message**: `feat: implement welcome screen with voice narration`
- **Related**: See [scope.md#onboarding-first-use-experience](./scope.md#onboarding-first-use-experience)

#### Issue #17: Permission Screen
- **Labels**: `onboarding`, `ui`, `accessibility`, `P0`
- **Milestone**: `Phase 1 - MVP`
- **Description**: Build clear permission request screen for camera/microphone access with simple Yes/No options
- **Deliverable**: `PermissionScreen.tsx` component
- **Acceptance Criteria**:
  - Clear explanation of each permission
  - Simple Yes/No buttons
  - Voice narration support
  - Error prevention with confirmations
  - Plain language explanations
- **Commit Message**: `feat: add permission screen with clear explanations`
- **Related**: See [scope.md#onboarding-first-use-experience](./scope.md#onboarding-first-use-experience)

#### Issue #18: Family Link Screen
- **Labels**: `onboarding`, `ui`, `accessibility`, `P0`
- **Milestone**: `Phase 1 - MVP`
- **Description**: Create QR code display screen for easy connection with family members' web panel
- **Deliverable**: `FamilyLinkScreen.tsx` component
- **Acceptance Criteria**:
  - Large, clear QR code display
  - Simple instructions
  - Voice narration support
  - Fallback connection method
  - Clear visual hierarchy
- **Commit Message**: `feat: implement family link screen with QR code`
- **Related**: See [scope.md#onboarding-first-use-experience](./scope.md#onboarding-first-use-experience)

#### Issue #19: Voice Support
- **Labels**: `onboarding`, `ui`, `accessibility`, `P1`
- **Milestone**: `Phase 1 - MVP`
- **Description**: Add text-to-speech narration support for all onboarding screens
- **Deliverable**: `VoiceService.ts` and voice components
- **Acceptance Criteria**:
  - Text-to-speech on all onboarding screens
  - Voice control for navigation
  - Clear, slow speech
  - Volume control
  - Accessibility compliance
- **Commit Message**: `feat: add text-to-speech support for onboarding`
- **Related**: See [scope.md#onboarding-first-use-experience](./scope.md#onboarding-first-use-experience)

---

## 📊 Issue Summary

| Priority | Count | Categories |
|----------|-------|------------|
| P0 (Critical) | 13 | Setup & Environment (5), Core Features (5), Onboarding (3) |
| P1 (High) | 6 | UI/UX Senior App (5), Onboarding (1) |
| **Total** | **19** | **4 Categories** |

---

## 🎯 Success Metrics Reference

- Senior can complete video call without help in under 30 seconds
- Family receives SOS alert in under 1 minute  
- 90% of seniors report comfort using app after one day
- Less than 1% failed or dropped calls

*See [scope.md](./scope.md) for complete project requirements and [tasks.md](./tasks.md) for original task definitions.*
