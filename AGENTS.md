# Repository Guidelines

This guide captures the working agreements for Priospace—a Next.js productivity app bundled with a Tauri desktop shell and a Node-based WebRTC signaling server. Use it to orient new contributions quickly and keep changes consistent across surfaces.

## Project Structure & Module Organization

- `app/` contains the App Router entry points (`layout.js`, `page.js`) and feature routes such as `app/home/`.
- `components/` hosts client components, with shadcn-inspired primitives under `components/ui/`.
- `lib/` and `utils/` expose shared helpers (`utils/time.js`, data formatters, hooks).
- `public/` serves static assets, sounds (`/music/complete.mp3`), and icons.
- `webrtc-server/` runs the signaling service; `src-tauri/` holds Rust sources for the desktop build.

## Build, Test, and Development Commands

- `npm run dev` bootstraps the Next.js dev server with Turbopack.
- `npm run build` and `npm run start` compile and serve the production bundle.
- `npm run lint` executes Next.js ESLint rules; run it before every commit.
- `npm run tauri dev` launches the desktop shell (Rust toolchain and Tauri CLI required).
- `cd webrtc-server && npm install && npm run start` spins up the WebRTC signaling node on `PORT` (defaults to `3001`).

## Coding Style & Naming Conventions

- Favor modern React patterns: functional components, hooks, and the `"use client"` directive where required.
- Components and files use PascalCase (`TaskList`), utilities camelCase, Tailwind classes for styling, and 2-space indentation across JS, Rust, and Node code.
- Keep props and state objects minimal; share cross-cutting logic through `lib/` or `utils/`.

## Testing Guidelines

- No automated suite ships today: new UI work should include Jest + React Testing Library specs under `__tests__/` mirroring the feature path (e.g., `app/__tests__/task-list.test.jsx`).
- Mock WebRTC dependencies and cover primary user flows (task CRUD, timer states, habit streaks).
- For the signaling server, add integration tests with `ws` clients under `webrtc-server/tests/` and aim for high-path coverage of room lifecycle events.

## Commit & Pull Request Guidelines

- Follow the existing history: concise, Title Case subjects under ~72 characters (e.g., `Peerlist Update`).
- Each PR should document scope, testing evidence (`npm run lint`, manual scenarios), and include screenshots or GIFs when UI changes are visible.
- Link relevant issues, flag breaking changes, and request review once lint passes and the WebRTC server is verified locally.
