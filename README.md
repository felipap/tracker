<img width="150" height="150" alt="splash-icon" src="https://github.com/user-attachments/assets/348bc769-3325-4de7-9552-8a9fb0330c72" />

# creepy

An iOS app that tracks your location and an MCP server that exposes it to your AI.

## Demo

(Demo video coming soon.)

<img width="300" height="1705" alt="image" src="https://github.com/user-attachments/assets/945854e0-1c1a-4678-aeac-fb013c30e43b" />

<br />
<br />
<img width="2437" height="1484" alt="image" src="https://github.com/user-attachments/assets/e3ad77f0-aec2-40e4-b926-345b0c33f8d3" />

## Structure

This project has two components:

- **mobile**: a mobile app built with React Native and Expo that broadcasts the
  users' location to the server.
- **web**: a Next.js app that stores user location and hosts an optional
  MCP server for the user to connect to.

## Self-hosting

Location data is very sensitive so this project is designed to be self-hosted.

To self-host the web app, I recommend setting up a Vercel project. Deploy it
with the Root Directory set to `web/` and complete the environment variables as
defined in the `web/.env.example` file.

"Self-hosting" the mobile app means you build your own version of it using Xcode
or Android Studio, with your own environment variables, and deploy a "Release"
build to your phone. This deserves a separate guide but the short version for
iOS is:

- `pnpm install` inside `mobile`
- `pod install` inside `mobile/ios`
- Open `mobile/ios/mobile.xcworkspace` in Xcode and build the app in **Release**
  mode with your phone as the target.

If you build the app in **Debug** mode, it will only work while you have an Expo
server running on your computer.

## Development

See the `README.md` files of the individual components.

## Status

[![Build Status](https://img.shields.io/github/actions/workflow/status/felipap/tracker/lint-mobile.yml?label=Mobile+Build)](https://github.com/felipap/tracker/actions)
[![Build Status](https://img.shields.io/github/actions/workflow/status/felipap/tracker/lint-web.yml?label=Web+Build&color=blue)](https://github.com/felipap/tracker/actions)

## License

MIT
