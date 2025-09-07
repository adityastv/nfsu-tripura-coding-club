# Overview

This is a coding club management platform built for NFSU (National Forensic Sciences University). The application provides a comprehensive system for managing students, coding challenges, and contests with separate interfaces for administrators and students. It features three types of coding challenges: Multiple Choice Questions (MCQ), Coding problems, and Capture The Flag (CTF) challenges. The platform includes real-time leaderboards, submission tracking, and activity monitoring.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Development Setup**: tsx for running TypeScript in development, esbuild for production builds
- **Data Storage**: In-memory storage with interface design for future database integration
- **Schema Validation**: Zod schemas shared between client and server
- **Session Management**: Prepared for session-based authentication

## Authentication & Authorization
- **Authentication**: Username/password based login system
- **Authorization**: Role-based access control with admin and student roles
- **Session Handling**: Local storage for client-side session persistence
- **Security**: Prepared infrastructure for secure session management

## Data Models
- **Users**: Support for admin and student roles with points and problem tracking
- **Questions**: Three types - MCQ, Coding, and CTF with difficulty levels and point values
- **Submissions**: Track user attempts and correctness for each question
- **Activities**: Audit log for user actions and system events

## UI/UX Design
- **Design System**: Custom theme with Indian flag accent colors
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Time Display**: IST timezone handling for all time-related features
- **Component Architecture**: Modular component structure with reusable UI elements

## Development Tools
- **Type Safety**: Full TypeScript coverage with strict configuration
- **Code Quality**: Configured for modern ES modules and bundle optimization
- **Development Experience**: Hot reload with Vite and runtime error overlays
- **Path Aliases**: Organized imports with @ aliases for clean code structure

# External Dependencies

## Database & ORM
- **Drizzle ORM**: Type-safe SQL query builder configured for PostgreSQL
- **Neon Database**: Serverless PostgreSQL database provider
- **Migration System**: Drizzle Kit for database schema management

## UI Framework
- **Radix UI**: Comprehensive primitive component library for accessible UI
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **Date-fns**: Date manipulation and formatting utilities

## Development Infrastructure
- **Replit Integration**: Specialized plugins for Replit development environment
- **Vite Plugins**: Runtime error handling and development tools
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Forms & Validation
- **React Hook Form**: Performant form library with validation
- **Zod**: Runtime type validation and schema definition
- **Hookform Resolvers**: Integration between React Hook Form and Zod

## Code Editor Features
- **Embla Carousel**: Touch-friendly carousel component for UI elements
- **CMDK**: Command palette functionality for enhanced UX
- **Class Variance Authority**: Type-safe variant management for components