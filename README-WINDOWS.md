
# Building for Windows

This guide explains how to package PetitionThingy as a Windows desktop application.

## Prerequisites

- Node.js 20 or higher
- Windows OS (or Windows build tools on other platforms)

## Build Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the Windows installer:**
   ```bash
   npm run electron:build:win
   ```

3. **Find your installer:**
   The Windows installer will be created in the `release` folder as a `.exe` file.

## Development

To test the Electron app during development:

```bash
npm run electron
```

This will build the app and launch it in Electron.

## Distribution

Share the `.exe` installer from the `release` folder with users. They can:
1. Download the installer
2. Run it
3. Follow the installation wizard
4. Launch PetitionThingy from their Start Menu or Desktop

The app runs completely offline after installation and includes both the frontend and backend server.
