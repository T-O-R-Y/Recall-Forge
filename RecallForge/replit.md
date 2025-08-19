# Overview

StudyMemo is a modern study application built as a full-stack web application for creating and managing digital flashcards. The application enables users to organize flashcards into collections, take quizzes, track progress, and search through their study materials. It features a React-based frontend with a clean, educational interface and an Express.js backend with PostgreSQL database storage.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend uses React with TypeScript, employing a component-based architecture with modern React patterns:
- **UI Framework**: Built with shadcn/ui components providing a consistent design system
- **Styling**: Tailwind CSS for utility-first styling with custom CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management and API caching
- **Form Handling**: React Hook Form with Zod validation schemas
- **Build System**: Vite for fast development and optimized production builds

## Backend Architecture
The backend follows a REST API architecture pattern:
- **Framework**: Express.js with TypeScript for type safety
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **API Design**: RESTful endpoints organized by resource type (collections, cards, quizzes)
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Development Tools**: Hot reloading with Vite integration for seamless development

## Authentication System
The application uses a custom username/password authentication system:
- **Provider**: Custom local authentication with Passport.js LocalStrategy
- **Session Management**: Express sessions with PostgreSQL session store
- **User Management**: Registration and login with username/password
- **Password Security**: Scrypt-based password hashing for secure storage
- **Authorization**: Route-level authentication middleware protecting all API endpoints

## Database Design
PostgreSQL database with Drizzle ORM providing type-safe database access:
- **Schema Management**: Code-first schema definition with automatic migration support
- **Core Tables**: Users, Collections, Cards, Quizzes, Quiz Questions, Study Progress, and Sessions
- **Relationships**: Proper foreign key constraints with cascade deletion for data integrity
- **Connection**: Neon serverless PostgreSQL with connection pooling

## Project Structure
The application uses a monorepo structure with clear separation of concerns:
- **Client Directory**: React frontend application with components, pages, and utilities
- **Server Directory**: Express.js backend with routes, database, and authentication
- **Shared Directory**: Common TypeScript types and database schema shared between frontend and backend
- **Configuration**: Centralized configuration files for TypeScript, Tailwind, Vite, and Drizzle

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket support for real-time connections
- **Connection Pooling**: @neondatabase/serverless for efficient database connection management

## Authentication Services
- **Replit Auth**: OpenID Connect authentication provider integrated with Replit's ecosystem
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple

## UI and Styling Libraries
- **Radix UI**: Headless UI components for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide Icons**: Modern icon library for consistent iconography

## Development Tools
- **TypeScript**: Static type checking across the entire application
- **Vite**: Modern build tool with hot module replacement
- **ESBuild**: Fast JavaScript bundler for production builds
- **Drizzle Kit**: Database migration and schema management tools