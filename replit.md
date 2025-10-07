# Amazon Tours Booking Platform

## Overview

This is a biophilic tour booking platform for Amazon rainforest experiences, inspired by Airbnb's immersive design approach. The application allows users to browse, filter, and book guided tours in various Amazon locations including Leticia, Puerto Nariño, and Mocagua. The platform emphasizes nature-first design with organic flows, visual storytelling, and a calm, restorative user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching

**UI Component System:**
- Shadcn/ui component library with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variant management
- Custom biophilic design system with nature-inspired color palette (forest greens, earth browns, sunset oranges)

**Design Philosophy:**
- Biophilic design principles emphasizing connection to nature
- Organic, flowing layouts avoiding rigid grids
- Typography hierarchy using Playfair Display (serif), Inter (sans-serif), and Caveat (handwritten)
- Dark/light mode support with nature-themed color schemes

**State Management:**
- React Query for asynchronous state and API data caching
- React hooks for local component state
- URL parameters for shareable filter/search states

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for type-safe API development
- Development mode uses Vite middleware for HMR and SSR-like capabilities
- Production mode serves static built assets

**Data Layer:**
- Drizzle ORM configured for PostgreSQL
- Schema definitions using Drizzle with Zod validation
- Database migrations managed through Drizzle Kit
- Currently using in-memory storage implementation with interface pattern for easy database migration

**API Design:**
- RESTful endpoints for tour data retrieval
- Query parameter support for filtering (location, category)
- JSON response format with error handling middleware

**Data Sources:**
- Tour data initially seeded from JSON file (tours_data.json)
- Structured tour information including pricing tiers, categories, locations, and descriptions
- Image assets stored in attached_assets directory

### Key Architectural Patterns

**Repository Pattern:**
- IStorage interface defines data access contract
- MemStorage provides in-memory implementation
- Enables future migration to PostgreSQL without API changes

**Component Composition:**
- Reusable UI components (TourCard, ReviewCard, FilterBar, HeroSection)
- Example components demonstrating usage patterns
- Slot pattern from Radix UI for flexible component APIs

**Type Safety:**
- Shared schema types between client and server
- Drizzle schema generates TypeScript types
- Zod schemas for runtime validation

**Route Organization:**
- Home page with hero section and featured tours
- Tours listing page with filtering capabilities
- Individual tour detail pages with full information
- 404 not found page for invalid routes

## External Dependencies

**Database & ORM:**
- PostgreSQL configured via @neondatabase/serverless driver
- Drizzle ORM for type-safe database queries
- Connection configured through DATABASE_URL environment variable

**UI Framework:**
- Radix UI component primitives for accessibility
- Embla Carousel for image galleries
- React Hook Form with Zod resolvers for form validation
- Date-fns for date formatting

**Styling:**
- Tailwind CSS with PostCSS
- Custom CSS variables for theming
- Autoprefixer for browser compatibility

**Development Tools:**
- Replit-specific plugins for development banner and error overlay
- TSX for TypeScript execution in Node.js
- ESBuild for production bundling

**Session Management:**
- Connect-pg-simple for PostgreSQL session store (configured but not yet actively used)
- Express session middleware setup

**Image Assets:**
- Generated AI images stored in attached_assets/generated_images/
- Images reference Amazon wildlife (jaguars, pink dolphins), landscapes (canopy, river), and experiences (canoe tours)