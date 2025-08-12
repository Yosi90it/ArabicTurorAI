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

### January 5, 2025 - Landing Page & Admin Security
✓ **Landing Page**: Created comprehensive marketing landing page at root route `/`
✓ **Full-screen Layout**: Landing page renders without sidebar using route-based layout control
✓ **Hero Section**: Gradient hero with CTA buttons and key metrics
✓ **Features Grid**: Six key platform features with icons and descriptions
✓ **Testimonials**: User testimonials with ratings and avatars
✓ **Pricing Section**: Monthly/yearly toggle with three pricing tiers
✓ **Admin Security**: Protected admin panel with password authentication
✓ **AuthContext**: Secure login system with localStorage persistence

### June 17, 2025 - Interactive Learning Features
✓ **Tashkeel Toggle in BookReader**: Added switch to show/hide Arabic diacritics
✓ **Clickable Word Translation**: Words in BookReader and VideoTrainer are clickable for instant translation and grammar info
✓ **Word Modal Component**: Custom modal showing translation, grammar, and "Add to Flashcards" functionality
✓ **Dynamic Flashcard Collection**: User-added words from reading/video content automatically populate flashcards
✓ **AI Chat Follow-up Suggestions**: Context-aware suggestion buttons appear after AI responses
✓ **FlashcardContext**: React context for managing user-generated flashcard entries
✓ **Arabic Dictionary Integration**: Comprehensive word lookup with grammar analysis
✓ **Toast Notifications**: User feedback when adding words to flashcard collection
✓ **Global Tashkeel Toggle**: Sidebar control for Arabic diacritics across all pages
✓ **Enhanced Flashcards**: Contextual sentences with highlighted target words
✓ **Subscription Page**: Premium plan options with feature comparison
✓ **Enhanced Alphabet Trainer**: Audio pronunciation using Web Speech API and interactive quiz mode
✓ **7-Day Mastery Plan**: Complete structured learning program with daily tasks, mnemonics, and progress tracking
✓ **Vowel Mastery System**: Comprehensive fatha, kasra, damma training with flexible scheduling and spaced repetition

### July 4, 2025 - Complete Authentication & Trial System
✓ **User Authentication Flow**: Complete signup, login, and logout functionality with JWT tokens
✓ **Language Selection**: Post-authentication language selection page (English/German)
✓ **72-Hour Trial System**: Automatic trial expiration with redirect to subscription page
✓ **Protected Routes**: Authentication and language selection validation for learning pages
✓ **Global Logout Button**: Fixed positioning top-right with responsive design
✓ **Multilingual Interface**: German translation support for all UI elements
✓ **Trial Status Integration**: Synchronized trial state between AuthContext and TrialContext
✓ **Session Persistence**: Proper token storage and restoration on app reload

### July 6, 2025 - AI Story Generator Integration
✓ **Flashcards Tab Enhancement**: Added second tab "Geschichten-Generator" within Flashcards page
✓ **Personalized Story Creation**: AI generates custom Arabic stories using user's learned flashcard vocabulary
✓ **Difficulty Levels**: Three levels (Anfänger, Mittelstufe, Fortgeschritten) with appropriate complexity
✓ **Word Selection Control**: Choose how many vocabulary words to include (5-20 words)
✓ **Interactive Story Text**: Generated stories have clickable words for analysis and audio playback
✓ **OpenAI API Integration**: Backend endpoint for story generation using GPT-4o model
✓ **Vocabulary Reinforcement**: Stories highlight which learned words were used

### July 9, 2025 - Weaviate Vector Database Integration
✓ **Cost-Effective Translation System**: Replaced expensive OpenAI word analysis with Weaviate vector database
✓ **Vocabulary Database Setup**: Created 400+ entry Arabic-German vocabulary database in Weaviate
✓ **Schema Creation**: Established "Vocabulary" class with arabic/german/context fields
✓ **REST API Integration**: Direct Weaviate REST API calls for reliable data access
✓ **BookReader Enhancement**: Updated word translation to use Weaviate with dictionary fallback
✓ **Server-Side Processing**: New /api/weaviate/translate endpoint for secure database queries
✓ **Performance Optimization**: Fast translation responses (100-200ms average)
✓ **Data Import Success**: Successfully imported religious, family, number, and daily vocabulary terms
✓ **Extended Vocabulary Database**: Added 400+ word forms and variations from book content
✓ **ClickableText Integration**: Updated component to use Weaviate API with async word translation
✓ **Complete Word Coverage**: All book words now properly translated with German equivalents
✓ **Arabic Text Normalization**: Implemented consistent Tashkeel removal for accurate word matching
✓ **Semantic Search**: Uses normalized text with exact and partial matching for robust translation
✓ **Context-Rich Database**: Each entry includes usage context and grammatical information
✓ **Complete Custom Vocabulary**: All 500+ words from custom-vocab-import.js successfully imported
✓ **Comprehensive Coverage**: School, time, activity, religious, and conversational vocabulary fully integrated
✓ **Extended Database**: 700+ vocabulary entries with German translations and context information
✓ **Complete Coverage**: All common words, phrases, and grammatical particles included
✓ **Interlinear Reading Mode**: Shows German translations directly under each Arabic word
✓ **Sequential Translation**: Loads word-by-word translations with visual progress indicators
✓ **Religious Phrases**: Complete Islamic phrase collection including prayers and greetings
✓ **Conversation Vocabulary**: Full dialog vocabulary for market shopping and daily interactions

### July 17, 2025 - PDF Content Processing and Integration
✓ **Direct PDF Processing**: Processed "Al-Qir'atur.Rashida (1-2).pdf" pages 30-180 directly from uploaded file
✓ **Interactive Book Content**: Created structured content with 151 pages and 3325 words for translation
✓ **BookReader Integration**: Updated main book content to include processed PDF material
✓ **Authentic Arabic Content**: Integrated classical Arabic reading lessons with educational themes
✓ **Seamless User Experience**: Removed separate PDF converter interface, integrated processing into existing BookReader
✓ **Educational Structure**: Organized content into themed lessons (family, nature, religion, daily life)

### July 28, 2025 - Visual Book Reader Removal
✓ **Cleanup Request**: Removed all Qiraatu al-Rashida page images per user request
✓ **Component Removal**: Deleted VisualBookReader.tsx and removed from navigation
✓ **Route Cleanup**: Removed visual book reader routes from App.tsx
✓ **Sidebar Update**: Removed visual book navigation item

### August 12, 2025 - Personalized Daily Language Challenge Generator
✓ **Five Challenge Types**: Vocabulary, translation, grammar, listening, and conversation challenges
✓ **Smart Personalization**: Uses user's flashcard vocabulary to create relevant challenges
✓ **Adaptive Difficulty**: Beginner, intermediate, and advanced levels with appropriate complexity
✓ **Gamification Integration**: Points, streaks, achievements, and progress tracking
✓ **Audio Support**: Web Speech API for pronunciation in listening challenges
✓ **Multiple Formats**: Text input and multiple choice question types
✓ **Progress Analytics**: Daily completion tracking with visual progress indicators
✓ **Responsive Design**: Mobile-optimized interface with touch-friendly interactions
✓ **Multilingual UI**: Complete German/English translation support for all interface elements

### July 18, 2025 - Complete Multilingual Implementation
✓ **Comprehensive Translation System**: Extended LanguageContext with 50+ UI element translations
✓ **BookReader Multilingual Support**: All texts now use dynamic translations (German/English)
✓ **Component-Level Localization**: Updated Sidebar, GlobalHeader, InterlinearText, ClickableText, WordModal
✓ **Toast Notification Translations**: All user feedback messages now respect language selection
✓ **Universal Language Switch**: Every UI element dynamically switches between German and English
✓ **Mobile-Optimized Translations**: Responsive text handling for different screen sizes

### Architecture Enhancements
- Added `/pages/LandingPage.tsx` as comprehensive marketing homepage
- Implemented route-based layout control for full-screen landing experience
- Added `/contexts/AuthContext.tsx` for admin authentication
- Added `/contexts/FlashcardContext.tsx` for state management
- Added `/contexts/TashkeelContext.tsx` for global diacritics toggle
- Added `/contexts/ContentContext.tsx` for book/video management
- Created `/data/arabicDictionary.ts` with Arabic-English word mappings
- Implemented `/components/WordModal.tsx` for interactive word details
- Enhanced `/components/ClickableText.tsx` for word interaction across modules
- Added `/pages/Subscription.tsx` with premium plan options
- Added `/pages/AdminPanel.tsx` with secure content management
- Added `/pages/AdminLogin.tsx` with password protection
- Added `/pages/DailyChallenge.tsx` with personalized challenge generation
- Added `/components/DailyChallengeCard.tsx` for interactive challenge UI

## Changelog

```
Changelog:
- June 17, 2025. Initial setup with complete Arabic learning platform
- June 17, 2025. Added interactive learning features and word-to-flashcard functionality
- July 4, 2025. Implemented complete authentication system with 72-hour trial and logout functionality
- July 9, 2025. Integrated Weaviate vector database for cost-effective word translations
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```