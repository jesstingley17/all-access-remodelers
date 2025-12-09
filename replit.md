# All Access Remodelers

## Overview

This is a professional business website for All Access Remodelers, a company offering construction, property management, and cleaning services. The application is a full-stack React website with an Express backend, featuring a multi-page marketing site with service information, project gallery, about page, and legal pages (privacy policy, terms & conditions).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **Styling**: Tailwind CSS with custom design system defined in `design_guidelines.md`
- **UI Components**: shadcn/ui component library (Radix UI primitives with custom styling)
- **State Management**: TanStack React Query for server state
- **Build Tool**: Vite for development and production builds

The frontend follows a page-based structure under `client/src/pages/` with shared components in `client/src/components/`. The design system uses specific brand colors (Primary Blue #1a3a5c, Accent Orange #ff6b35, Dark Gray #4a4a4a) and Inter font family.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **HTTP Server**: Node.js createServer
- **API Structure**: RESTful routes prefixed with `/api`
- **Development**: tsx for TypeScript execution, Vite middleware for HMR

The server uses a storage interface pattern (`server/storage.ts`) with an in-memory implementation that can be swapped for database-backed storage. Routes are registered in `server/routes.ts`.

### Data Storage
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Defined in `shared/schema.ts` using Drizzle's schema builder
- **Migrations**: Managed via drizzle-kit with output to `./migrations`
- **Current Storage**: In-memory storage (MemStorage class) - database connection ready when DATABASE_URL is provided

The schema currently includes a basic users table. The architecture supports easy transition from memory storage to PostgreSQL.

### Build System
- **Client Build**: Vite outputs to `dist/public`
- **Server Build**: esbuild bundles server code to `dist/index.cjs`
- **Production**: Single command builds both client and server
- **Path Aliases**: `@/` maps to client source, `@shared/` maps to shared modules

## External Dependencies

### Third-Party Services
- **Database**: PostgreSQL (via DATABASE_URL environment variable)
- **Session Store**: connect-pg-simple for PostgreSQL-backed sessions

### Key Libraries
- **UI Framework**: Radix UI primitives (accordion, dialog, dropdown, etc.)
- **Form Handling**: React Hook Form with Zod validation
- **Date Utilities**: date-fns
- **Icons**: Lucide React
- **Carousel**: Embla Carousel

### Development Tools
- **Replit Plugins**: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner (development only)