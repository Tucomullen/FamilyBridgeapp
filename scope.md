# 🧭 FamilyBridge — Product Requirements Document (PRD) v0.1

## 1. 🎯 Mission  
To connect seniors with their families through an **ultra-simple, secure, and accessible** app that enables them to **communicate, share moments, and feel accompanied**, without technological barriers.

---

## 2. 👥 Target Audience  
- **Seniors (65+)** who struggle with modern smartphones.  
- **Family members or caregivers** who want to stay in daily contact easily and reliably.  
- **Care institutions or homes** (future phase) managing communication for multiple seniors.

---

## 3. 💡 Problem We Solve  
Video calls, photos, and family chats are currently spread across many apps (WhatsApp, Zoom, Facebook, etc.), with confusing interfaces, tiny text, and too many steps.  
**FamilyBridge simplifies everything into three large, clear buttons**, so seniors can communicate without needing assistance or feeling isolated.

---

## 4. 🧩 MVP — Core Features for the First Version  
1. **One-touch calling:** The senior taps a name or photo to instantly start an audio or video call.  
2. **SOS button:** A red button that sends an instant alert to the main family contact (notification + optional auto-call).  
3. **Photo sharing and viewing:** Family members upload photos from their phones; the senior sees them in large format and can react with simple emojis or gestures.  

> The MVP will focus on **accessibility, stability, and privacy** over additional features.

---

## 4.5. 🚀 Onboarding & First-Use Experience

The first-time user experience is critical for senior adoption. The onboarding flow consists of 3–4 simple screens designed to build confidence and establish essential connections.

### Onboarding Flow
1. **Welcome Screen** - Simple introduction with large, friendly text and a prominent "Start" button
2. **Permission Screen** - Clear explanation of camera/microphone access with simple Yes/No options
3. **Family Link Screen** - QR code display for easy connection with family members' web panel
4. **Voice Support** - Text-to-speech narration available on all onboarding screens

### Design Principles
- **Large, high-contrast text** (≥ 24pt) for maximum readability
- **Simple, reassuring language** that builds confidence
- **Voice narration** for users who prefer audio guidance
- **One action per screen** to avoid cognitive overload
- **Clear visual hierarchy** with prominent call-to-action buttons
- **Error prevention** with confirmation steps for critical actions

### Goals
- **Simplicity**: Complete setup in under 2 minutes
- **Reassurance**: Clear explanations of what each permission does
- **Autonomy**: Enable seniors to set up the app independently
- **Confidence**: Build trust through clear, friendly interface design

---

## 5. 🧱 Simplicity and Design Rules  
- **Large, high-contrast typography (≥ 18 pt).**  
- **Clearly differentiated colors** (high-contrast mode, black/white + primary color).  
- **Single, large buttons per action.**  
- **No hidden menus or complicated settings.**  
- **Plain language:** “Call Ana” instead of “Start video call.”  
- **Voice control and text-to-speech support** (planned for Phase 2).

> All design will follow **WCAG 2.2** and **EAA 2025** accessibility standards.

---

## 6. 📊 MVP Success Metrics  
- ✅ Senior can complete a video call **without help** in under 30 seconds.  
- ✅ Family receives SOS alert in **under 1 minute**.  
- ✅ 90% of seniors report feeling comfortable using the app after one day.  
- ✅ Less than 1% failed or dropped calls.

---

## 7. 🧠 Planned Tech Stack  
- **Mobile Frontend:** React Native + Expo (Senior app).  
- **Web Frontend:** React + Vite (Family panel).  
- **Backend:** FastAPI (Python) + PostgreSQL.  
- **Infrastructure:** GitHub + CI/CD (Actions) + Railway / Firebase (initial deployment).  
- **AI Assistant:** Cursor AI Agents + ChatGPT-5 Pro for guided code generation and testing.

---

## 8. 🌐 Target Platforms  
- **iOS & Android:** Native apps (large icon, readable text).  
- **Web (PWA):** For browsers or desktop access by family members.  
- **Kiosk/Tablet Mode:** For nursing homes or fixed installations.

---

## 9. ⚙️ Risks and Current Limitations  
- Weak or unstable internet connections.  
- Camera/microphone permissions may need initial setup assistance.  
- Must work **without keyboard** (touch-only).  
- Some seniors may resist trying new technology.  
- Phase 1 excludes authentication and payments to focus on privacy.

---

## 10. 🔒 Privacy and Compliance  
- Full compliance with **GDPR / EAA 2025**.  
- **Minimal data collection:** no tracking or geolocation.  
- **End-to-end encryption** for all calls and messages.  
- **Private family control:** only invited relatives can connect.  
- **Temporary and secure storage** for photos and call data.

---

## 11. 🧭 Project Phases  
| Phase | Objective | Expected Outcome |
|-------|------------|------------------|
| **Phase 1** | Functional MVP (3 main buttons) | Usable, stable app |
| **Phase 2** | Enhanced accessibility (voice, reading, contrast) | Total inclusion |
| **Phase 3** | Family connection (groups, albums, calendar) | Emotional engagement |
| **Phase 4** | Scalability & public release | App Store / Play Store launch |

---

## 12. 🚀 Next Step  
Save this document as `scope.md` in your Cursor workspace (or under `docs/scope.md` if you already have a `/docs` folder).  

It will be the **foundation for Cursor Agents** to automatically generate:  
- User stories,  
- Development task lists,  
- Testing and CI/CD plans.

---
