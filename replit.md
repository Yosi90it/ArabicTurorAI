# ArabicAI - Learn Arabic with AI

## Overview
ArabicAI is a full-stack web application designed to help users learn Arabic through AI-powered interactive tools. It offers multiple learning modes including AI chat assistance, flashcards, book reading, video training, alphabet practice, and personalized daily challenges. The project aims to provide a comprehensive and engaging platform for learning Arabic, integrating AI for personalized and interactive experiences.

## User Preferences
Preferred communication style: Simple, everyday language.
Design preference: "Lebhafte" (lively) dashboard design with modern styling, progress overviews, goal tracking, and comprehensive statistics display.

## System Architecture
The application follows a monorepo structure, separating client, server, and shared code.
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS, shadcn/ui components, TanStack Query, and Wouter for routing.
- **Backend**: Node.js with Express and TypeScript, providing a RESTful API structure with middleware for logging and error handling.
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations, using a defined schema in `/shared/schema.ts`.
- **Core Features**:
    - **Interactive Learning**: Clickable words for instant translation, grammar info, and "Add to Flashcards" functionality.
    - **AI-Powered Tools**: AI chat assistance with follow-up suggestions, AI story generation based on learned vocabulary, and an AI-powered daily language challenge generator (Vocabulary, Translation, Grammar, Listening, Conversation).
    - **Multi-Book Integration**: Complete book reader system supporting three interactive Arabic books:
      * **Qiraatu al-Rashida** - Traditional structured pages with clear paragraph divisions
      * **Qasas al-Anbiya Part 1** - Prophet stories with narrative format
      * **Qasas al-Anbiya Part 2** - Extended prophet narratives with custom HTML content parsing
    - **Content Management**: HTML-based content system with automatic word extraction, supporting Arabic text with full tashkeel preservation and interactive span-based word clicking.
    - **Authentication**: Complete signup, login, and logout with JWT tokens, including a 72-hour trial system and protected routes.
    - **Multilingual Interface**: Comprehensive translation system supporting German and English across all UI elements.
    - **Verb Recognition**: Enhanced system for identifying verbs and providing conjugation options.
    - **Gamification**: Points, streaks, achievements, and progress tracking for daily challenges.
- **Deployment**: Configured for Replit with autoscale deployment, utilizing `nodejs-20`, `web`, and `postgresql-16` modules.

## Recent Updates (August 2025)
- **Third Book Integration Completed**: Successfully implemented Qasas al-Anbiya Part 2 with custom HTML parser supporting Arabic sectional headers (١), (٢), (٣) format
- **HTML Parser Enhancement**: Updated `parseQasasAlAnbiyaPart2HTML` function to correctly parse user-provided Arabic content with proper section extraction
- **Content Format Standardization**: Established consistent HTML structure using `<span class="word">text</span>` format for all interactive Arabic content
- **Cache Management**: Resolved React Query caching issues by implementing proper cache invalidation for real-time content updates
- **Multi-digit Arabic Numbers Support**: Fixed regex pattern to recognize multi-digit Arabic numerals (١٠، ١١، ١٢, etc.) in H2 headers, resolving issue where pages 4 and 5 weren't detecting headers with two-digit numbers

## External Dependencies
- **UI and Styling**: Radix UI, Tailwind CSS, Lucide React, Class Variance Authority.
- **Data and State**: TanStack Query, Drizzle ORM, Zod.
- **Development Tools**: Vite, TypeScript, ESBuild, TSX.
- **AI/External Services**:
    - **OpenAI API**: Used for AI chat, story generation (GPT-4o), and grammar analysis (ChatGPT) for verb recognition.
    - **Weaviate**: Vector database used for cost-effective, real-time Arabic-German vocabulary translation and semantic search.
    - **Web Speech API**: For audio pronunciation in the Alphabet Trainer and listening challenges.