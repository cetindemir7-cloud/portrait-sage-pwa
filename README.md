# Portrait Sage PWA 🎥

AI-powered portrait coaching app for taking professional photos with real-time feedback.

## Features

- 🧠 **Live Face Analysis** - 468-point facial landmarks with position tracking
- 🎯 **Smart Guidance** - Turkish voice and visual cues to improve framing
- 📊 **Real-time Scoring** - Instant 0-100 scoring for lighting, composition, framing
- 💾 **On-device Storage** - Photos stay only on your phone
- 📱 **Progressive Web App** - Works offline, installable

## Project Structure

```
src/
├── pages/
│   └── index.tsx           # Main app component
├── components/
│   ├── CoachingOverlay.tsx    # Real-time coaching UI
│   ├── StatusBanner.tsx       # Status messages
│   ├── ModeSelector.tsx       # Mode selection component
│   ├── ScoreRing.tsx          # Score visualization
│   └── GallerySheet.tsx       # Photo gallery
├── hooks/
│   └── useFaceCoach.ts        # Face analysis hook (MediaPipe)
├── lib/
│   ├── coaching.ts            # Coaching logic and modes
│   └── gallery.ts             # IndexedDB photo storage
├── styles/
│   └── globals.css            # Global styles
└── App.tsx                    # Root component
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:3000`

### Build

```bash
npm run build
```

## Modes

1. **Headshot** - Classic portrait pose
2. **Actor** - Professional headshot for actors
3. **Author** - Thoughtful author-style portrait
4. **Cinematic** - Wide cinematic composition

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **MediaPipe** - Face detection & landmarks
- **Vite** - Build tool
- **Sonner** - Toast notifications
- **IndexedDB** - Local photo storage

## Architecture

### Face Analysis
Uses MediaPipe Face Detector for:
- Real-time face detection
- 468 facial landmarks
- Face confidence scoring

### Scoring System
Evaluates:
- **Framing** - Face position in frame
- **Lighting** - Light quality and shadows
- **Composition** - Rule of thirds, balance
- **Overall** - Combined score

### Storage
Photos are stored in IndexedDB with metadata:
- Timestamp
- Mode used
- All scores
- Before/after comparison

## Known Limitations

- Requires camera permissions
- Works best in good lighting
- Optimized for mobile devices

## Next Steps

- [ ] Audio feedback system
- [ ] Video recording mode
- [ ] Share functionality
- [ ] History statistics
- [ ] Cloud sync (optional)

## License

MIT
