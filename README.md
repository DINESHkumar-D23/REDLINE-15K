# RedLine Motorsport Simulator

Node.js + React (Vite) frontend for Formula 1, MotoGP, and drone-racing simulation. It combines animated track selection, a parameter-rich simulation view, and real-time leaderboards that can run off either built-in mocks or an external telemetry feed.

## Repository Layout
- `RedLine/RedLine/RedLine/` — app root (created from the original archive; leave nesting intact).
- Key folders inside the app: `src/components`, `src/pages`, `src/data`, `src/utils`, `src/three`, `public/`.

## Features
- Multi-discipline coverage: Formula 1, MotoGP, and a drone-racing experience.
- Infinite carousels to browse circuits with stats, regulations, and quick “Begin simulation” CTAs.
- Simulation page with live parameters (session type, time of day, weather, tyres, fuel, grip, temps, strategy, AI difficulty, safety car probability, run length) plus timers and lap estimation.
- SVG track renderer with a moving marker; uses procedural track centerlines when available.
- Live leaderboard with row expansion, change highlighting, optional WebSocket hookup, and local mock data.
- Mock telemetry options: React hook (`useWebsocketMock`) and a Node-based WebSocket server (`ws-mock.js`).
- Three.js-ready placeholders: `CanvasPlaceholder` exposes a mount point; `three/Car3D` and `three/TrackExtruder` scaffold future 3D work; drone page uses the animated `Hyperspeed` background.
- Accessibility-minded (keyboardable controls, ARIA labels, live regions) and responsive styling built with CSS plus utility-friendly Tailwind config.

## Tech Stack
- Runtime: Node.js (tested with 18+)
- Frontend: React 19, React Router 7, Framer Motion, Three.js, Vite
- Tooling: ESLint, Jest + React Testing Library, Tailwind/PostCSS

## Quick Start
```bash
cd RedLine/RedLine/RedLine   # project root
npm install                  # install dependencies
npm run dev                  # start Vite dev server (defaults to 5173)
```
Open the printed localhost URL in your browser.

## Common Scripts
- `npm run dev` — run the Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally
- `npm run lint` — ESLint over the project
- `npm test` / `npm run test:watch` / `npm run test:coverage` — Jest + RTL suites

## App Walkthrough
- **Routing** (`src/App.jsx`): landing page → `home`, `formula1`, `motogp`, `drones`, `tracks`, `simulate/:trackId`, `create`.
- **Track selection** (`pages/Formula1.jsx`, `pages/MotoGP.jsx`): looping carousels, regulation toggles persisted to `localStorage`, and begin buttons that push into the simulation route with the chosen track payload.
- **Track browser** (`pages/Tracks.jsx`): searchable, series-filtered grid of all F1/MotoGP circuits, using reusable `TrackCard` components.
- **Simulation** (`pages/Simulation.jsx`):
  - Renders SVG centerlines via `CanvasPlaceholder`.
  - Parameter sidebar (mirrors `ParamsSidebar` API) manages session, weather, grip, temps, tyres, fuel, traffic, AI difficulty, safety car odds, and run duration.
  - Animation loop advances car progress with lap detection; timer handles finite runs; state persists selected regulation.
  - Leaderboard card supports live shuffling and driver detail expansion.
- **Drone Racing** (`pages/Drones.jsx`): lazy-loads `Hyperspeed` Three.js effect with an overlayed hero.

## Telemetry & Leaderboard Options
- **Built-in mock hook**: `useWebsocketMock` sends periodic leaderboard reshuffles for local development.
- **Node WebSocket server**: run `npm install ws` (dev or prod), then `node ws-mock.js` to broadcast sample F1 leaderboards on `ws://localhost:8080`.
- **Connecting real data**: pass `websocketUrl` (and `autoConnect`) to `Leaderboard` or wire your own WebSocket in `Simulation.jsx`; messages should deliver an array or `{ leaderboard: [...] }` snapshot.

## Data & Geometry
- Circuit metadata lives in `src/data/tracks.js`, `src/data/motogpTracks.js`, and `src/data/droneTracks.js`.
- Procedural centerlines for Monza, Silverstone, and Spa come from `src/data/trackPointMaps.js`; normalize and sampling utilities are in `src/utils/trackUtils.js`.
- Static assets (SVG layouts, video backgrounds, images) live in `src/assets` and `public/`.

## Testing Notes
- Component tests cover key UI pieces (`CanvasPlaceholder`, `ParamsSidebar`, `Leaderboard`, `TrackCard`, `Loading`) under `src/components/__tests__/`.
- Tests run in a JSDOM environment via Jest; CSS modules are mocked with `identity-obj-proxy`, and asset imports use `__mocks__/fileMock.js`.

## Extending
- Mount a real Three.js renderer inside `CanvasPlaceholder` via its ref, or replace the SVG preview entirely.
- Swap the mock telemetry for a real feed by plugging into `useEffect` in `Simulation.jsx` or by enriching `useWebsocketMock`.
- Add more tracks by extending the data files and (optionally) adding centerline generators to `trackPointMaps`.

## Accessibility & UX
- Controls include labels, ARIA attributes, and keyboard-friendly interactions; live regions announce time/leaderboard changes.
- Layout and typography favor dark UI with orange/red highlights; responsive CSS lives in `src/css/` and `App.css`.

## Deployment
- Build: `npm run build` → `dist/`.
- Host the static output on any CDN/SPA host (Vercel, Netlify, S3, etc.). Configure preview locally with `npm run preview`.

## Repository Tips
- Keep the nested folder structure if you move the project; relative imports assume the current layout.
- If you need environment-specific settings, create `.env` with `VITE_*` variables as required (e.g., `VITE_WEBSOCKET_URL`).


