# ArabicAI - Learn Arabic with AI

## Overview

ArabicAI is a full-stack web application designed to help users learn Arabic through AI-powered interactive tools. The application features a modern React frontend with a Node.js/Express backend, built using TypeScript throughout. It provides multiple learning modes including AI chat assistance, flashcards, book reading, video training, and alphabet practice.

## System Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript, Vite for bundling
- **Backend**: Node.js with Express and TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Deployment**: Replit with autoscale deployment

### Architecture Pattern
The application follows a monorepo structure with clear separation between client, server, and shared code:
- `/client` - React frontend application
- `/server` - Express backend API
- `/shared` - Shared TypeScript types and database schema

## Key Components

### Frontend Architecture
- **Component Structure**: Uses shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for Arabic learning theme
- **Routing**: File-based routing with Wouter for SPA navigation
- **State Management**: TanStack Query for API calls and caching
- **Layout**: Sidebar navigation with main content area

### Backend Architecture
- **Express Server**: RESTful API structure with middleware for logging and error handling
- **Storage Layer**: Abstracted storage interface with in-memory implementation (ready for database integration)
- **Route Registration**: Centralized route registration system
- **Development Tools**: Vite integration for hot module replacement in development

### Database Design
- **Schema**: Defined in `/shared/schema.ts` using Drizzle ORM
- **Current Tables**: Users table with username/password authentication
- **Migration Strategy**: Drizzle Kit for schema migrations
- **Connection**: PostgreSQL via Neon serverless driver

## Data Flow

1. **Client Requests**: React components use TanStack Query to make API calls
2. **API Layer**: Express routes handle HTTP requests and responses
3. **Business Logic**: Storage interface abstracts data operations
4. **Database**: Drizzle ORM manages PostgreSQL interactions
5. **Response**: JSON responses flow back through the same layers

### Authentication Flow
- Basic user model with username/password structure
- Storage interface provides user CRUD operations
- Ready for session management implementation

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management

### Data and State
- **TanStack Query**: Server state management and caching
- **Drizzle ORM**: Type-safe database operations
- **Zod**: Runtime type validation

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: Production bundling
- **TSX**: TypeScript execution for development

## Deployment Strategy

### Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16
- **Development**: `npm run dev` starts both frontend and backend
- **Production Build**: Vite builds frontend, ESBuild bundles backend
- **Deployment**: Autoscale deployment with build and start commands
- **Port Configuration**: Internal port 5000, external port 80

### Database Setup
- PostgreSQL 16 module enabled
- Environment variable `DATABASE_URL` required
- Drizzle migrations in `/migrations` directory
- Push schema with `npm run db:push`

### Build Process
1. Frontend builds to `/dist/public` via Vite
2. Backend bundles to `/dist/index.js` via ESBuild
3. Static assets served from built frontend
4. Production server runs bundled backend

## Recent Updates

### June 17, 2025 - Interactive Learning Features
✓ **Tashkeel Toggle in BookReader**: Added switch to show/hide Arabic diacritics
✓ **Clickable Word Translation**: Words in BookReader and VideoTrainer are clickable for instant translation and grammar info
✓ **Word Modal Component**: Custom modal showing translation, grammar, and "Add to Flashcards" functionality
✓ **Dynamic Flashcard Collection**: User-added words from reading/video content automatically populate flashcards
✓ **AI Chat Follow-up Suggestions**: Context-aware suggestion buttons appear after AI responses
✓ **FlashcardContext**: React context for managing user-generated flashcard entries
✓ **Arabic Dictionary Integration**: Comprehensive word lookup with grammar analysis
✓ **Toast Notifications**: User feedback when adding words to flashcard collection

### Architecture Enhancements
- Added `/contexts/FlashcardContext.tsx` for state management
- Created `/data/arabicDictionary.ts` with Arabic-English word mappings
- Implemented `/components/WordModal.tsx` for interactive word details
- Enhanced `/components/ClickableText.tsx` for word interaction across modules

## Changelog

```
Changelog:
- June 17, 2025. Initial setup with complete Arabic learning platform
- June 17, 2025. Added interactive learning features and word-to-flashcard functionality
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```