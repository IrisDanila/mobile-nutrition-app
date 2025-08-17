# FoodScanAI

Expo SDK 52 React Native app that lets users capture a food photo, runs a placeholder AI analysis (simulated) returning name, quantity, calories and macros, and stores results per-user in Firebase Realtime Database. Users can register/login via email+password (Google placeholder pending) and view their history and profile.

## Features
- Firebase Auth (email & password)
- Placeholder AI food analysis service (can be swapped with a real backend / ML model)
- Realtime Database storage of each scan under user path
- Tab navigation: Scan, History, Profile
- Dark modern UI theme

## Folder Structure
- `src/services` Firebase + AI service
- `src/screens` Auth, Scan, History, Profile
- `src/components` Reusable UI elements
- `src/navigation` Navigation container
- `src/theme` Theming helpers

## Environment
Values placed in `.env` file and imported through `process.env` (EAS or dotenv plugin required at build time). For local Expo Go development you can alternatively hardcode or use `app.config.js` with `extra`.

## Future Enhancements
- Integrate real AI inference (e.g., call a serverless endpoint or on-device model)
- Add Google OAuth sign-in (needs proper reverse client id + config for Expo)
- Nutrition goals & daily summary charts
- Offline caching & optimistic UI

## Running
1. Install dependencies
2. Start Expo
3. Scan QR with Expo Go

## Disclaimer
The AI analysis is randomized and NOT accurate; replace with a real model before production.
