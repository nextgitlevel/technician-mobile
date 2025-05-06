# NextLevel Technician Mobile App

A mobile application for field technicians to manage their work assignments, built with React Native and Expo.

## Project Structure

The application uses Expo Router for navigation and follows a modern folder structure:

```
technician-mobile/
├── app/                    # Main application code using Expo Router
│   ├── (tabs)/             # Tab navigation screens
│   ├── Assignment/         # Assignment screens 
│   ├── config/             # Configuration files
│   ├── utils/              # Utility functions
│   ├── _layout.tsx         # Root layout for navigation
│   ├── index.js            # Login screen
│   ├── login.tsx           # Login redirect
│   ├── navigation.js       # Centralized navigation
│   └── queue.js            # Assignment queue screen
├── assets/                 # App assets (images, fonts)
├── components/             # Reusable components
│   ├── ui/                 # UI components
│   └── ...
├── constants/              # App constants
├── hooks/                  # Custom React hooks
└── src_old/                # Archived legacy code
```

## Features

- Authentication system for technicians
- Assignment queue management
- Detailed assignment views
- Offline support for field work
- Location-based assignment finding
- Camera integration for documentation

## Development

### Prerequisites

- Node.js (v18 or newer)
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Setup

1. Install dependencies:
   ```
   npm install --legacy-peer-deps
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Run on specific platform:
   ```
   npm run android  # For Android
   npm run ios      # For iOS
   npm run web      # For web
   ```

### Building Native Apps

The project is set up to use EAS Build:

```
npx eas build --platform android
npx eas build --platform ios
```

## Troubleshooting

If you encounter dependency conflicts, use the `--legacy-peer-deps` flag with npm install.

For issues with native modules on prebuild, try:
```
npx expo prebuild --clean
```