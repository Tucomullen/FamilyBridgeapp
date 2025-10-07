# 🧭 FamilyBridge — Phase 1 Development Tasks

## Overview
This document contains all development tasks for Phase 1 (MVP) of the FamilyBridge app. Tasks are organized into three categories and designed to be small, clear, and actionable for junior developers.

---

## 1. Setup & Environment

### Task 1.1: Initialize React Native Project
- **Description**: Set up Expo-based React Native project for senior mobile app with proper folder structure
- **Deliverable**: `senior-app/` directory with Expo configuration
- **Commit Message**: `feat: initialize React Native senior app with Expo`

### Task 1.2: Create Family Web Panel
- **Description**: Set up React + Vite project for family member web interface
- **Deliverable**: `family-panel/` directory with Vite configuration
- **Commit Message**: `feat: create React family panel with Vite`

### Task 1.3: Setup Backend API
- **Description**: Initialize FastAPI backend with PostgreSQL database connection
- **Deliverable**: `backend/` directory with FastAPI app and database models
- **Commit Message**: `feat: setup FastAPI backend with PostgreSQL`

### Task 1.4: Configure CI/CD Pipeline
- **Description**: Set up GitHub Actions for automated testing and deployment
- **Deliverable**: `.github/workflows/` with CI/CD configuration
- **Commit Message**: `ci: setup GitHub Actions for automated deployment`

### Task 1.5: Install Dependencies
- **Description**: Install and configure all required packages for both frontend and backend
- **Deliverable**: `package.json` files with all dependencies
- **Commit Message**: `chore: install and configure project dependencies`

---

## 2. UI/UX (Senior App)

### Task 2.1: Design Main Screen Layout
- **Description**: Create main screen with 3 large, clearly labeled buttons (Call, SOS, Photos)
- **Deliverable**: `MainScreen.tsx` component
- **Commit Message**: `feat: implement main screen with 3 core action buttons`

### Task 2.2: Implement High-Contrast Theme
- **Description**: Create accessibility-focused theme with large typography (18pt+) and high contrast colors
- **Deliverable**: `theme.ts` and `styles.ts` files
- **Commit Message**: `feat: add high-contrast theme with large typography`

### Task 2.3: Build Contact List Screen
- **Description**: Design contact list with large photos and clear names for easy selection
- **Deliverable**: `ContactListScreen.tsx` component
- **Commit Message**: `feat: create contact list with large photos and names`

### Task 2.4: Create Photo Viewing Interface
- **Description**: Build large-format photo display screen for seniors to view family photos
- **Deliverable**: `PhotoViewerScreen.tsx` component
- **Commit Message**: `feat: implement large-format photo viewing interface`

### Task 2.5: Design Family Web Dashboard
- **Description**: Create web interface for family members to manage contacts and upload photos
- **Deliverable**: `Dashboard.tsx` component
- **Commit Message**: `feat: create family dashboard for contact and photo management`

---

## 3. Onboarding & First-Use Experience

### Task 3.1: Welcome Screen
- **Description**: Create simple introduction screen with large, friendly text and prominent "Start" button
- **Deliverable**: `WelcomeScreen.tsx` component
- **Commit Message**: `feat: implement welcome screen with voice narration`

### Task 3.2: Permission Screen
- **Description**: Build clear permission request screen for camera/microphone access with simple Yes/No options
- **Deliverable**: `PermissionScreen.tsx` component
- **Commit Message**: `feat: add permission screen with clear explanations`

### Task 3.3: Family Link Screen
- **Description**: Create QR code display screen for easy connection with family members' web panel
- **Deliverable**: `FamilyLinkScreen.tsx` component
- **Commit Message**: `feat: implement family link screen with QR code`

### Task 3.4: Voice Support
- **Description**: Add text-to-speech narration support for all onboarding screens
- **Deliverable**: `VoiceService.ts` and voice components
- **Commit Message**: `feat: add text-to-speech support for onboarding`

---

## 4. Core Features (One-touch Call, SOS, Photo Sharing)

### Task 4.1: Implement One-Touch Calling
- **Description**: Build audio/video calling functionality with single tap to initiate calls
- **Deliverable**: `CallService.ts` and calling components
- **Commit Message**: `feat: implement one-touch audio/video calling system`

### Task 4.2: Create SOS Alert System
- **Description**: Build red SOS button that sends instant alerts to main family contact
- **Deliverable**: `SOSService.ts` and `SOSButton.tsx`
- **Commit Message**: `feat: add SOS button with instant family alert system`

### Task 4.3: Build Photo Upload System
- **Description**: Create system for family members to upload photos from web panel
- **Deliverable**: `PhotoUploadService.ts` and upload components
- **Commit Message**: `feat: implement photo upload system for family members`

### Task 4.4: Add Photo Sharing for Seniors
- **Description**: Enable seniors to view and react to family photos with simple emojis
- **Deliverable**: `PhotoSharingService.ts` and reaction components
- **Commit Message**: `feat: add photo sharing and emoji reactions for seniors`

### Task 4.5: Implement Real-time Notifications
- **Description**: Set up push notifications for SOS alerts and new photos
- **Deliverable**: `NotificationService.ts`
- **Commit Message**: `feat: add real-time notifications for alerts and photo updates`

---

## Task Summary Table

| Category | Task Count | Estimated Time | Priority |
|----------|------------|----------------|----------|
| Setup & Environment | 5 tasks | 3-5 days | High |
| UI/UX (Senior App) | 5 tasks | 7-10 days | High |
| Onboarding & First-Use | 4 tasks | 5-7 days | High |
| Core Features | 5 tasks | 10-15 days | High |
| **Total** | **19 tasks** | **25-37 days** | - |

---

## Development Guidelines

### Accessibility Requirements
- Follow WCAG 2.2 and EAA 2025 standards
- Use large, high-contrast typography (≥ 18pt)
- Ensure single, large buttons per action
- No hidden menus or complicated settings
- Plain language for all text

### Technical Standards
- React Native + Expo for senior app
- React + Vite for family web panel
- FastAPI + PostgreSQL for backend
- End-to-end encryption for all communications
- Minimal data collection (GDPR compliant)

### Success Metrics
- Senior can complete video call without help in under 30 seconds
- Family receives SOS alert in under 1 minute
- 90% of seniors report comfort using app after one day
- Less than 1% failed or dropped calls

---

## Next Steps

1. Assign tasks to development team members
2. Set up project management board (GitHub Projects, Jira, etc.)
3. Create feature branches for each task
4. Implement code review process
5. Set up testing framework for each component

---

*Last updated: $(date)*
*Version: 1.0*
