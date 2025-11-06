# Monitor

A lightweight macOS menu bar application that periodically captures screenshots
and uploads them to the server.

## Features

- 📸 **Automatic Screenshot Capture**: Captures screenshots from all displays at configurable intervals
- ⏱️ **Countdown Timer**: Shows time until next capture in the menu bar
- 🔒 **Secure**: Uses API key authentication for uploads
- 🚀 **Lightweight**: Runs in the background with minimal resource usage
- ⚙️ **Configurable**: Adjust capture interval and toggle monitoring on/off

## Development

### Prerequisites

- Node.js 18+ or later
- pnpm (recommended) or npm

### Setup

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build

# Package the app
pnpm pack
```

### Project Structure

```
desktop/
├── main/           # Main process (Electron backend)
│   ├── lib/        # Core functionality
│   │   ├── screenshot.ts    # Screenshot capture
│   │   ├── api-client.ts    # API communication
│   │   ├── monitor.ts       # Monitoring service
│   │   └── logger.ts        # Logging utilities
│   ├── store/      # Persistent storage
│   ├── main.ts     # Application entry point
│   ├── tray.ts     # Menu bar integration
│   └── ipc.ts      # IPC handlers
├── assets/         # App icons and resources
└── package.json
```

## Configuration

The app stores its configuration in `~/Library/Application Support/monitor-2/data.json`:

- `apiKey`: Your API key for authentication
- `captureIntervalMinutes`: Time between captures (default: 5 minutes)
- `isMonitoring`: Whether monitoring is active
- `lastCaptureTime`: Timestamp of last capture

## API Endpoint

Screenshots are uploaded to `https://monitor.felipap.com/api/screenshots` with the following structure:

```typescript
{
  screenshots: [
    {
      dataUrl: string,        // Base64-encoded image (PNG data URL)
      timestamp: number,      // Unix timestamp in milliseconds
      displayId: string,      // Display identifier
      activeWindow?: string,  // Title of active window
      activeApp?: string,     // Name of active application
      systemInfo?: string     // JSON string with system metadata
    }
  ]
}
```

### Authentication

The API requires authentication via the `x-tracker-secret` header:

```
x-tracker-secret: your-api-secret-here
```

This secret should match the `MOBILE_REQUEST_SECRET` environment variable on the server.

## Building for Production

```bash
# Build and package for macOS (creates .dmg and .zip)
pnpm pack

# Install locally to /Applications
pnpm pack-local
```

## License

MIT © Felipe Aragão
