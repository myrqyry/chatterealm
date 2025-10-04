# ChatterRealm

A real-time multiplayer chat application with game-like features, built with React, TypeScript, Socket.IO, and modern web technologies.

## 🏗️ Architecture

ChatterRealm is built as a monorepo with three main packages:

- **Frontend** (`packages/frontend`): React-based UI with Material-UI, Tailwind CSS, and GSAP animations
- **Backend** (`packages/backend`): Express server with Socket.IO for real-time communication
- **Shared** (`packages/shared`): Shared TypeScript types and constants

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- pnpm (we use pnpm for package management)

### Installation

1. Install pnpm if you haven't already:
```bash
npm install -g pnpm
```

2. Clone the repository:
```bash
git clone https://github.com/myrqyry/chatterealm.git
cd chatterealm
```

3. Install dependencies:
```bash
pnpm install
```

4. Set up environment variables:
```bash
# Frontend (optional for development)
cp packages/frontend/.env.example packages/frontend/.env.development

# Backend
cp packages/backend/.env.example packages/backend/.env.development
```

### Development

Run both frontend and backend in development mode:

```bash
pnpm dev
```

Or run them separately:

```bash
# Frontend (runs on http://localhost:5173)
pnpm --filter frontend dev

# Backend (runs on http://localhost:3001)
pnpm --filter backend dev
```

### Building

Build all packages:

```bash
pnpm build
```

Build individual packages:

```bash
# Build shared types first (required by other packages)
pnpm build:shared

# Build frontend
pnpm --filter frontend build

# Build backend
pnpm --filter backend build
```

### Testing

Run tests:

```bash
# Run all tests
pnpm test

# Run frontend tests
pnpm --filter frontend test

# Run frontend tests with UI
pnpm --filter frontend test:ui

# Run backend tests
pnpm --filter backend test
```

## 📁 Project Structure

```
chatterealm/
├── packages/
│   ├── frontend/          # React frontend application
│   │   ├── src/
│   │   │   ├── components/   # React components
│   │   │   ├── services/     # API and business logic
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   └── utils/        # Utility functions
│   │   ├── vite.config.ts    # Vite configuration
│   │   └── package.json
│   │
│   ├── backend/           # Express backend server
│   │   ├── src/
│   │   │   ├── services/     # Business logic services
│   │   │   └── index.ts      # Server entry point
│   │   ├── scripts/          # Utility scripts
│   │   └── package.json
│   │
│   └── shared/            # Shared types and constants
│       ├── src/
│       │   ├── types/        # TypeScript type definitions
│       │   └── constants/    # Shared constants
│       └── package.json
│
├── package.json           # Root package.json with workspace config
├── pnpm-workspace.yaml    # pnpm workspace configuration
└── pnpm-lock.yaml         # Locked dependency versions
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite 6** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **Tailwind CSS 4** - Utility-first CSS
- **Socket.IO Client** - Real-time communication
- **GSAP** - Advanced animations
- **Tone.js** - Audio synthesis
- **Zustand** - State management
- **Vitest** - Testing framework

### Backend
- **Express 4** - Web framework
- **Socket.IO** - WebSocket server
- **TypeScript** - Type safety
- **express-rate-limit** - API rate limiting
- **CORS** - Cross-origin resource sharing
- **Jest** - Testing framework

## 🎮 Features

- Real-time multiplayer chat with game-like mechanics
- Grid-based world with terrain generation
- Player avatars and character classes
- Building and item systems
- NPC interactions
- Sound effects and audio feedback
- Responsive design with modern UI

## 🔧 Development Workflow

### Package Management

We use **pnpm** exclusively for package management. This ensures:
- Faster installation times
- Efficient disk space usage
- Strict dependency resolution
- Better workspace support

**Important:** Always use `pnpm` commands, not `npm` or `yarn`.

### Build Order

The shared package must be built before other packages:

1. `shared` package exports TypeScript types and constants
2. `frontend` and `backend` depend on the compiled `shared` package
3. The build scripts handle this automatically

### Linting

Lint the frontend code:

```bash
pnpm --filter frontend lint
```

### Code Style

- TypeScript strict mode enabled
- ESLint configured for React and TypeScript
- Consistent code formatting

## 🌐 Environment Variables

### Frontend

Create `packages/frontend/.env.development` or `.env.production`:

```env
# Optional - uses proxy in development
VITE_API_URL=https://api.chatterealm.com
VITE_WS_URL=wss://api.chatterealm.com
```

### Backend

Create `packages/backend/.env.development` or `.env.production`:

```env
PORT=3001
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔒 Security

- Rate limiting on API endpoints (100 requests per 15 minutes)
- CORS configured for allowed origins only
- Environment-based configuration for production
- No secrets in source code

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Keep commits focused and atomic
- Write clear commit messages

## 📄 License

[Add your license here]

## 🤝 Support

For issues, questions, or contributions, please open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Enhanced error boundaries and error handling
- [ ] Comprehensive test coverage
- [ ] Performance optimization and bundle size reduction
- [ ] API documentation
- [ ] Deployment guides
- [ ] CI/CD pipeline setup

## 📚 Additional Documentation

- [Styling Strategy](packages/frontend/styling-consistency-strategy.md) - Guidelines for using Material-UI and Tailwind CSS together
- [Animation Libraries](packages/frontend/animation-libraries.md) - Overview of GSAP and animation patterns (if exists)

---

Built with ❤️ by the ChatterRealm team
