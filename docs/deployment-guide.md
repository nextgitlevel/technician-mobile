# NextLevel Technician App Deployment Guide

This guide provides step-by-step instructions for deploying the NextLevel Technician app to the App Store and Google Play.

## Prerequisites

### Apple App Store
1. **Apple Developer Account**: Active membership ($99/year)
2. **App Store Connect Access**: Administrative access to your organization's App Store Connect
3. **Xcode**: Latest version installed on a Mac
4. **Certificates and Profiles**: Distribution certificates and provisioning profiles

### Google Play Store
1. **Google Play Developer Account**: Active account ($25 one-time fee)
2. **Google Play Console Access**: Administrative access to your organization's Play Console
3. **Keystore File**: Android signing keystore and credentials

### General
1. **EAS Account**: Expo Application Services account (connected to your Expo project)
2. **Node.js**: Version 16 or higher
3. **Expo CLI**: Latest version installed

## Building for Production

### 1. Update Configuration Files

Ensure the following files contain correct production information:
- `app.json`: Verify app name, version, bundle ID, etc.
- `eas.json`: Verify production build configuration
- `app/config/environment.js`: Verify production API endpoints

### 2. Configure Code Signing

#### iOS
```bash
# Generate certificates if needed
eas credentials

# Or configure EAS to use existing certificates
eas credentials --platform ios
```

#### Android
```bash
# Generate or upload keystore
eas credentials --platform android
```

### 3. Create Production Builds

```bash
# Create production builds for both platforms
eas build --platform all --profile production

# Or build individually
eas build --platform ios --profile production
eas build --platform android --profile production
```

### 4. Test Production Builds

- Download the completed builds from EAS
- Install them on test devices
- Perform complete test cycle using the test checklist

## Submitting to App Stores

### App Store (iOS)

1. **Prepare App Store Connect**
   - Log in to App Store Connect (https://appstoreconnect.apple.com)
   - Create a new app if not already created
   - Configure app information, pricing, and availability

2. **Submit Build**
   ```bash
   # Submit to App Store using EAS
   eas submit --platform ios
   ```

3. **Complete App Store Information**
   - Screenshots (all required device sizes)
   - App description, keywords, etc.
   - Privacy policy URL
   - App Review Information (test account credentials)

4. **Submit for Review**
   - Verify all information is complete
   - Submit for App Review
   - Monitor review status (typically 24-48 hours)

### Google Play (Android)

1. **Prepare Google Play Console**
   - Log in to Google Play Console (https://play.google.com/console)
   - Create a new app if not already created
   - Configure app information and store listing

2. **Submit Build**
   ```bash
   # Submit to Google Play using EAS
   eas submit --platform android
   ```

3. **Complete Play Store Information**
   - Screenshots (various device sizes)
   - App description, etc.
   - Privacy policy URL
   - Content rating questionnaire

4. **Release to Track**
   - Choose a release track (internal testing, closed testing, open testing, or production)
   - Review and start rollout
   - Monitor review status (typically 1-3 days)

## Post-Submission

1. **Monitor Review Status**
   - Check App Store Connect / Google Play Console daily
   - Be prepared to address any review feedback

2. **Prepare Marketing Materials**
   - Announcement emails
   - Social media posts
   - Website updates

3. **Plan for Updates**
   - Gather user feedback
   - Prioritize fixes and features
   - Plan regular update schedule

## Common Review Issues

### App Store
- Incomplete information
- Crash on startup
- Privacy policy concerns
- Misleading functionality
- Poor performance

### Google Play
- Policy violations
- Crashes or ANRs (App Not Responding)
- Inadequate content rating
- Improper permissions usage

## Troubleshooting

### Build Errors
- Check EAS build logs
- Verify all native modules are compatible
- Check that all configuration files are valid

### Submission Errors
- Verify app bundle meets all requirements
- Check that all required metadata is provided
- Verify app credentials are correct