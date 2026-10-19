<div align="center">

<img src="public/SpaceScope.png" width="110" alt="SpaceScope logo" />

# SpaceScope

**Real-time satellite tracking, celestial telemetry and an interactive astronomical visualizer.**

<a href="https://space-scope-lqli.vercel.app"><img src="https://img.shields.io/badge/Live_Demo-Open_the_app-2ea44f?style=for-the-badge" alt="Live demo" /></a>

<br/>

<img src="docs/screenshot.png" width="860" alt="SpaceScope screenshot" />

</div>

## ✨ Features

### 🚀 Real-Time Space Data
- **ISS Tracker**: Monitor the International Space Station's position in real-time
- **Space Weather**: Track solar activity, geomagnetic storms, and X-ray flux
- **NASA APOD**: Daily astronomy pictures with full-screen viewing
- **Space News**: Latest headlines from across the space industry

### 🌍 Interactive Visualizations
- **3D Earth Globe**: Interactive globe with real-time satellite tracking
- **AR Sky View**: Augmented reality view of the night sky
- **Mission Timeline**: Explore humanity's space exploration history
- **Time Rewind**: Journey through cosmic time periods

### 📊 Mission Control Dashboard
- Comprehensive dashboard with all space data in one place
- Separate dedicated pages for each feature
- Real-time data from NASA, NOAA, and Spaceflight News APIs

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm installed
- [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd cosmic-navigator

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:8083` to see SpaceScope in action!

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Motion**: GSAP (ScrollTrigger, MotionPath) with Lenis smooth scrolling
- **Interactive components**: React Bits (installed through the shadcn registry, see `src/components/react-bits`)
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: TanStack React Query
- **Routing**: React Router DOM
- **Dashboard animations**: Framer Motion

## 📁 Project Structure

```
cosmic-navigator/
├── public/
│   ├── SpaceScope.png          # App logo
│   └── earth.glb              # 3D Earth model
├── src/
│   ├── components/
│   │   ├── Layout/            # Shared layout components
│   │   ├── SpaceScope/        # Landing page components
│   │   └── ui/                # Reusable UI components
│   ├── pages/                 # Page components
│   ├── services/              # API services
│   ├── types/                 # TypeScript definitions
│   └── lib/                   # Utilities and constants
└── package.json
```

## 🌐 APIs Used

- **NASA APOD**: Astronomy Picture of the Day
- **wheretheiss.at**: Real-time ISS position, altitude and velocity (HTTPS, no key)
- **NOAA Space Weather**: Solar and geomagnetic data
- **Spaceflight News API**: Latest space industry news

## 🎨 Design System

SpaceScope uses a custom cosmic theme with:
- **Colors**: Cosmic glow, nebula purple, aurora pink, star white, space navy
- **Typography**: Space Grotesk for headings, Inter for body text
- **Effects**: Glass morphism, particle systems, starfield backgrounds

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- NASA for providing amazing space data and imagery
- NOAA for space weather monitoring
- Spaceflight News for keeping the community informed
- The open-source community for incredible tools and libraries

---

**Made with ❤️ for space enthusiasts everywhere**

🌟 *Explore the cosmos, one pixel at a time* 🌟
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Configuration

Copy `.env.example` to `.env` and add a free NASA API key (https://api.nasa.gov) as `VITE_NASA_API_KEY`. Without it the app falls back to NASA's heavily rate-limited `DEMO_KEY`.

## How can I deploy this project?

This is a static Vite app. Build with `npm run build` and serve the `dist` folder.

- **Vercel**: import the repo. `vercel.json` already rewrites all routes to `index.html` so client-side routes such as `/dashboard/iss` work on refresh.
- **Netlify**: connect the repo with build command `npm run build` and publish directory `dist`. `public/_redirects` provides the same single-page fallback.
- Add `VITE_NASA_API_KEY` as an environment variable on the host.
