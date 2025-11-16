# RedLine — Motorsport Simulation Frontend

A professional, production-ready frontend for motorsport simulation and leaderboard management. Built for Formula 1, MotoGP, and Drone Racing disciplines.

![RedLine](https://img.shields.io/badge/RedLine-Motorsport%20Simulation-orange)
![React](https://img.shields.io/badge/React-18+-61dafb)
![Vite](https://img.shields.io/badge/Vite-7+-646cff)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

- **Multi-discipline Support**: Formula 1, MotoGP, and Drone Racing
- **Interactive Simulation Page**: WebGL-ready canvas placeholder with adaptive gradients
- **Live Leaderboard**: Real-time updates with smooth animations
- **Comprehensive Parameters**: Full simulation control (weather, time of day, regulations, etc.)
- **Responsive Design**: Mobile-first, accessible, and optimized
- **Mock WebSocket**: Built-in mock for local development
- **TypeScript Ready**: PropTypes validation and clear component interfaces

## 📋 Prerequisites

- Node.js 18+ and npm
- Modern browser with WebGL support (for future Three.js integration)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RedLine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## 🎮 Usage

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port Vite assigns).

### Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

### Linting

Check code quality:

```bash
npm run lint
```

## 📁 Project Structure

```
RedLine/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── CanvasPlaceholder.jsx
│   │   ├── Header.jsx
│   │   ├── Leaderboard.jsx
│   │   ├── ParamsSidebar.jsx
│   │   ├── TrackCard.jsx
│   │   ├── Loading.jsx
│   │   ├── Footer.jsx
│   │   └── ErrorBoundary.jsx
│   ├── pages/               # Page components
│   │   ├── home.jsx
│   │   ├── Formula1.jsx
│   │   ├── MotoGP.jsx
│   │   ├── Simulation.jsx
│   │   └── Tracks.jsx
│   ├── data/                # Sample data
│   │   ├── tracks.js
│   │   ├── motogpTracks.js
│   │   └── sampleTelemetry.js
│   ├── hooks/               # Custom React hooks
│   │   └── useWebsocketMock.js
│   ├── css/                 # Component-specific styles
│   └── assets/              # Images, SVGs, etc.
├── tests/                   # Test files
├── public/                  # Static assets
├── .github/workflows/      # CI/CD configuration
└── README.md
```

## 🔌 Integration Guide

### Connecting Real Telemetry

The app is designed to work with WebSocket-based telemetry feeds. To connect a real backend:

1. **Update the WebSocket URL** in `.env`:
   ```
   VITE_WEBSOCKET_URL=wss://your-backend.com/ws
   ```

2. **Replace the mock hook** in `Simulation.jsx`:
   ```jsx
   // Instead of useWebsocketMock, use a real WebSocket connection
   useEffect(() => {
     const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL);
     ws.onmessage = (event) => {
       const data = JSON.parse(event.data);
       if (data.type === 'leaderboard') {
         setLeaderboard(data.data);
       }
     };
     return () => ws.close();
   }, [isRunning]);
   ```

3. **Expected WebSocket Message Format**:
   ```json
   {
     "type": "leaderboard",
     "data": [
       { "pos": 1, "name": "L. Hamilton", "team": "Mercedes", "time": "1:28.062" },
       { "pos": 2, "name": "M. Verstappen", "team": "Red Bull Racing", "time": "1:28.325" }
     ]
   }
   ```

### Mounting Three.js Renderer

The `CanvasPlaceholder` component exposes a ref for mounting your WebGL renderer:

```jsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function Simulation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Mount Three.js renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });

    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);

    // Your Three.js scene setup here
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      renderer.dispose();
    };
  }, []);

  return (
    <CanvasPlaceholder
      ref={canvasRef}
      timeOfDay={timeOfDay}
      weather={weather}
      onCanvasMount={(canvas) => {
        // Optional: additional setup when canvas is ready
        console.log('Canvas ready:', canvas);
      }}
    />
  );
}
```

### Using the Mock WebSocket Server

A Node.js mock WebSocket server is included (`ws-mock.js`). To use it:

1. **Install WebSocket server dependency**:
   ```bash
   npm install -D ws
   ```

2. **Run the mock server**:
   ```bash
   node ws-mock.js
   ```

3. **Connect from the app**:
   ```jsx
   // In Simulation.jsx or Leaderboard component
   const wsUrl = 'ws://localhost:8080';
   // The Leaderboard component supports websocketUrl prop
   ```

## 🎨 Styling

The project uses **Tailwind CSS** for utility-first styling, with custom CSS files for component-specific styles. The theme is dark by default with orange/red accents.

### Customization

- **Colors**: Edit `tailwind.config.js` to customize the color scheme
- **Components**: Component-specific styles are in `src/css/`
- **Global Styles**: Main stylesheet is `src/index.css`

## ♿ Accessibility

The app follows WCAG AA standards:

- All interactive elements are keyboard accessible
- ARIA labels and roles are provided where needed
- Color contrast meets accessibility requirements
- Screen reader announcements for live updates

## 🧪 Testing

Tests are written using Jest and React Testing Library. Key test files:

- `src/components/__tests__/CanvasPlaceholder.test.jsx`
- `src/components/__tests__/ParamsSidebar.test.jsx`
- `src/components/__tests__/Leaderboard.test.jsx`
- `src/components/__tests__/TrackCard.test.jsx`
- `src/components/__tests__/Loading.test.jsx`

Run all tests:
```bash
npm test
```

## 📦 Deployment

### Build for Production

```bash
npm run build
```

The `dist/` folder contains the production-ready static files.

### Deploy to Vercel/Netlify

1. Connect your repository to Vercel/Netlify
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables if needed

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Bundled with [Vite](https://vitejs.dev/)

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**RedLine** — Experience speed, precision, and creativity all in one place. 🏁
