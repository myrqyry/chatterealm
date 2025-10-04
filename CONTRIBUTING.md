# Contributing to ChatterRealm

Thank you for your interest in contributing to ChatterRealm! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- pnpm (we use pnpm exclusively for package management)
- Git

### Setting Up Your Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/chatterealm.git
   cd chatterealm
   ```

3. Install pnpm if you haven't already:
   ```bash
   npm install -g pnpm
   ```

4. Install dependencies:
   ```bash
   pnpm install
   ```

5. Build the shared package:
   ```bash
   pnpm build:shared
   ```

6. Set up environment variables:
   ```bash
   cp packages/frontend/.env.example packages/frontend/.env.development
   cp packages/backend/.env.example packages/backend/.env.development
   ```

7. Run the development servers:
   ```bash
   pnpm dev
   ```

## Development Workflow

### Branch Naming Convention

Use descriptive branch names that follow this pattern:
- `feature/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation updates
- `refactor/description` - for code refactoring
- `test/description` - for adding or updating tests

Example: `feature/add-chat-rooms` or `fix/websocket-reconnection`

### Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our code style guidelines

3. Run linting and tests:
   ```bash
   pnpm --filter frontend lint
   pnpm test
   ```

4. Build to ensure everything compiles:
   ```bash
   pnpm build
   ```

5. Commit your changes with a clear message:
   ```bash
   git commit -m "Add feature: description of what you did"
   ```

### Commit Message Guidelines

Write clear, concise commit messages that explain what and why:

**Format:**
```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic changes)
- `refactor`: Code refactoring (no functional changes)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Example:**
```
feat: add player inventory system

- Implement inventory data structure
- Add UI for inventory display
- Connect to backend storage

Closes #123
```

## Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow ESLint rules configured in the project
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Prefer `const` over `let`, avoid `var`
- Use async/await instead of callbacks

### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper prop types (TypeScript interfaces)
- Name components using PascalCase
- Name files matching component names

### Styling

- Follow the [Styling Consistency Strategy](packages/frontend/styling-consistency-strategy.md)
- Use Material-UI for complex interactive components
- Use Tailwind CSS for utility styling and layout
- Keep semantic color tokens in `packages/frontend/src/utils/tokens.ts`

### File Organization

```
packages/
├── frontend/
│   └── src/
│       ├── components/      # React components
│       ├── hooks/           # Custom React hooks
│       ├── services/        # Business logic and API calls
│       ├── utils/           # Utility functions
│       ├── types/           # TypeScript type definitions (local)
│       └── stores/          # State management (Zustand)
├── backend/
│   └── src/
│       ├── services/        # Business logic services
│       └── index.ts         # Server entry point
└── shared/
    └── src/
        ├── types/           # Shared TypeScript types
        └── constants/       # Shared constants
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run frontend tests only
pnpm --filter frontend test

# Run frontend tests with UI
pnpm --filter frontend test:ui

# Run backend tests only
pnpm --filter backend test
```

### Writing Tests

- Write tests for new features and bug fixes
- Frontend: Use Vitest and React Testing Library
- Backend: Use Jest
- Aim for meaningful test coverage, not just high percentages
- Test behavior, not implementation details

**Example test structure:**

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = someFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

## Pull Request Process

### Before Submitting

1. Ensure your code passes all tests:
   ```bash
   pnpm test
   ```

2. Ensure your code builds without errors:
   ```bash
   pnpm build
   ```

3. Lint your code:
   ```bash
   pnpm --filter frontend lint
   ```

4. Update documentation if needed

5. Update the README.md if adding new features

### Submitting a Pull Request

1. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Go to the ChatterRealm repository on GitHub

3. Click "New Pull Request"

4. Select your fork and branch

5. Fill out the PR template:
   - **Title**: Clear, concise description of changes
   - **Description**: Detailed explanation of what and why
   - **Related Issues**: Link any related issues (e.g., "Closes #123")
   - **Testing**: Describe how you tested the changes
   - **Screenshots**: Add screenshots for UI changes

6. Request review from maintainers

### PR Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, a maintainer will merge your PR
- Your contribution will be credited in the commit history

## Project Structure

### Monorepo Architecture

ChatterRealm uses a monorepo structure managed with pnpm workspaces:

- **packages/frontend**: React application (Vite, TypeScript, Material-UI, Tailwind)
- **packages/backend**: Express server (Socket.IO, TypeScript)
- **packages/shared**: Shared types and constants used by both frontend and backend

### Key Technologies

- **Frontend**: React 18, TypeScript, Vite 6, Material-UI, Tailwind CSS 4, Socket.IO Client, GSAP, Tone.js
- **Backend**: Express 4, TypeScript, Socket.IO, Jest
- **Build Tools**: pnpm, TypeScript, Vite
- **Testing**: Vitest (frontend), Jest (backend)

### Important Notes

- **Always use pnpm**, never npm or yarn
- The `shared` package must be built before `frontend` or `backend`
- Use the workspace protocol for inter-package dependencies (`"shared": "workspace:*"`)
- Keep types in `shared/src/types` for cross-package use

## Questions or Need Help?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Tag issues appropriately (bug, enhancement, question, etc.)
- Be patient and respectful when asking for help

## Recognition

All contributors will be recognized in our contributors list. Thank you for making ChatterRealm better!

---

Happy coding! 🚀
