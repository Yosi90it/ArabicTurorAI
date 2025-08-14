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
    - **Content Integration**: Direct PDF processing for interactive book content (e.g., "Al-Qir'atur.Rashida"), with interlinear reading mode.
    - **Authentication**: Complete signup, login, and logout with JWT tokens, including a 72-hour trial system and protected routes.
    - **Multilingual Interface**: Comprehensive translation system supporting German and English across all UI elements.
    - **Verb Recognition**: Enhanced system for identifying verbs and providing conjugation options.
    - **Gamification**: Points, streaks, achievements, and progress tracking for daily challenges.
- **Deployment**: Configured for Replit with autoscale deployment, utilizing `nodejs-20`, `web`, and `postgresql-16` modules.

## External Dependencies
- **UI and Styling**: Radix UI, Tailwind CSS, Lucide React, Class Variance Authority.
- **Data and State**: TanStack Query, Drizzle ORM, Zod.
- **Development Tools**: Vite, TypeScript, ESBuild, TSX.
- **AI/External Services**:
    - **OpenAI API**: Used for AI chat, story generation (GPT-4o), and grammar analysis (ChatGPT) for verb recognition.
    - **Weaviate**: Vector database used for cost-effective, real-time Arabic-German vocabulary translation and semantic search.
    - **Web Speech API**: For audio pronunciation in the Alphabet Trainer and listening challenges.