# UK Government Petitions Dashboard

## Overview

A live dashboard application that displays real-time updates from UK government petitions. The application fetches petition data from the official UK Parliament Petitions API, presenting signature counts, petition status, and progress toward key thresholds (10,000 and 100,000 signatures) in a government-standard interface inspired by the UK Government Digital Service (GDS) Design System.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching

**UI Component System:**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Design system follows UK Government Digital Service (GDS) guidelines with specific color palette:
  - Primary: `#1D70B8` (gov.uk blue)
  - Secondary: `#00703C` (gov.uk green)  
  - Accent/Destructive: `#D4351C` (gov.uk red)
  - Background: `#F3F2F1` (warm grey)

**State Management:**
- TanStack Query handles all server state with 30-second auto-refresh intervals
- React hooks for local component state
- Query caching with background refetching for real-time updates

**Routing Strategy:**
- Client-side routing with Wouter (lightweight alternative to React Router)
- Two main routes:
  - `/` - Dashboard view with petition grid
  - `/petition/:id` - Individual petition detail view

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js server framework
- TypeScript for type safety across the stack
- Development and production build configurations separated

**API Structure:**
- RESTful API endpoints under `/api` prefix
- Proxy pattern: Backend fetches from UK Parliament API and serves to frontend
- In-memory caching layer (30-second cache duration) to reduce external API calls

**Key Endpoints:**
- `GET /api/petitions` - Fetch petitions list with query parameters for filtering, sorting, and search
- `GET /api/petitions/:id` - Fetch individual petition details

**Data Flow:**
1. Client requests data from Express API
2. Express checks in-memory cache for recent data
3. If cache miss or expired, fetches from UK Parliament API (`https://petition.parliament.uk`)
4. Response cached and returned to client
5. TanStack Query caches on client-side and auto-refreshes every 30 seconds

### Data Storage Solutions

**No Traditional Database:**
- Application does not persist data locally
- All data sourced in real-time from UK Parliament Petitions API
- Drizzle ORM and PostgreSQL configuration present but currently unused
- Schema defined in `shared/schema.ts` using Zod for runtime validation

**Caching Strategy:**
- Server-side: Map-based in-memory cache with 30-second TTL
- Client-side: TanStack Query cache with automatic background refetching
- No persistent storage required as data is always fetched fresh from authoritative source

### Authentication and Authorization

**Public Access:**
- No authentication or authorization implemented
- All petition data is publicly accessible
- Read-only application with no user accounts or protected routes

### Design Patterns

**Monorepo Structure:**
- Shared types and schemas in `/shared` directory
- Client code in `/client` directory
- Server code in `/server` directory
- Enables type sharing between frontend and backend

**Type Safety:**
- Zod schemas define data structures and provide runtime validation
- TypeScript ensures compile-time type checking
- Shared schema types prevent frontend/backend drift

**Component Composition:**
- Atomic design principles with reusable UI components
- Skeleton loading states for improved perceived performance
- Progressive enhancement with graceful error handling

**Build Strategy:**
- Development: Vite dev server with HMR for frontend, tsx for backend hot reload
- Production: Vite builds optimized client bundle, esbuild bundles server code
- Static assets served from `/dist/public` in production

## External Dependencies

### Third-Party APIs

**UK Parliament Petitions API:**
- Base URL: `https://petition.parliament.uk`
- Endpoints used:
  - `/petitions.json` - List petitions with filters
  - `/petitions/:id.json` - Individual petition details
- No API key required (public endpoint)
- Rate limiting handled via server-side caching

### Database Services

**PostgreSQL (Configured but Unused):**
- Neon Database serverless PostgreSQL configured via `@neondatabase/serverless`
- Drizzle ORM setup with migration support
- Connection string expected in `DATABASE_URL` environment variable
- Currently the application does not use database; all data fetched from external API

### UI Component Libraries

**Radix UI Primitives:**
- Comprehensive set of unstyled, accessible UI primitives
- Components: Dialog, Dropdown, Select, Toast, Progress, Accordion, etc.
- Provides accessibility features (ARIA attributes, keyboard navigation)

**shadcn/ui:**
- Pre-built component library built on Radix UI
- Customized with Tailwind CSS
- Components copied into project for full customization
- Configuration in `components.json`

### Development Tools

**Vite Plugins:**
- `@vitejs/plugin-react` - React Fast Refresh support
- `@replit/vite-plugin-runtime-error-modal` - Development error overlay
- `@replit/vite-plugin-cartographer` - Replit-specific development tooling
- `@replit/vite-plugin-dev-banner` - Development environment banner

### Styling and Design

**Tailwind CSS:**
- Utility-first CSS framework
- Custom configuration with GDS-inspired color tokens
- PostCSS with Autoprefixer for browser compatibility
- CSS variables for theming support

**Design Tokens:**
- HSL color space for flexible theming
- CSS custom properties defined in `index.css`
- Responsive breakpoints and spacing scale
- Typography scale matching GDS guidelines