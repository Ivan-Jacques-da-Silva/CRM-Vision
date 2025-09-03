# Overview

VisionCRM is a modern customer relationship management platform built with React and Node.js. The application features a comprehensive sales pipeline, client management, task tracking, and integrated chat functionality. It provides a centralized dashboard for managing customer interactions, sales opportunities, and business workflows.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using React with TypeScript and employs a component-based architecture:

- **UI Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query for server state management
- **Routing**: React Router for client-side navigation
- **Theme System**: Custom theme context with light/dark mode support

The frontend follows a modular structure with pages, components, and services organized separately. The UI emphasizes glassmorphism design patterns with responsive layouts optimized for both desktop and mobile devices.

## Backend Architecture

The backend uses Express.js with TypeScript in an ESM configuration:

- **Server Framework**: Express.js with middleware for JSON parsing and request logging
- **Database Layer**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development
- **Development Setup**: Vite integration for hot module replacement and development server

The server implements a clean separation between routes, storage, and business logic with proper error handling middleware.

## Data Storage Solutions

- **Database**: PostgreSQL configured through Drizzle ORM
- **Schema Management**: Type-safe schema definitions using Drizzle with Zod validation
- **Development Storage**: In-memory storage implementation for rapid prototyping
- **Migration System**: Drizzle Kit for database schema migrations

The database schema currently includes user management with extensible design for CRM entities like clients, opportunities, and tasks.

## Authentication and Authorization

- **Session Management**: Planned implementation with connect-pg-simple for PostgreSQL session storage
- **Token-based Auth**: Local storage for demo authentication with provision for JWT implementation
- **Demo Access**: Built-in demo credentials for testing and evaluation

## External Service Integrations

- **Chat Platforms**: Planned integrations with WhatsApp, Facebook Messenger, and Instagram Direct
- **Webhook Support**: Configurable webhook endpoints for external platform integrations
- **Third-party Services**: Designed for integration with Zapier, Make.com, and other automation platforms

The application architecture supports multiple deployment environments with proper configuration management and includes comprehensive error handling and logging systems.