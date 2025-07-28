# Deposit BRI - Banking Simulation Application

## Overview

Deposit BRI is a mobile banking simulation application focused on deposit and savings management. It's a React-based web application with a Node.js/Express backend, using PostgreSQL (via Neon Database) for data storage. The application simulates basic banking operations with a fixed user login system and provides both customer and admin interfaces.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom BRI brand colors
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL store
- **API Pattern**: RESTful endpoints under `/api` prefix

### Database Design
- **Database**: PostgreSQL via Neon Database (serverless)
- **Schema Management**: Drizzle Kit for migrations
- **Tables**:
  - `users`: Customer accounts with deposit/savings balances
  - `notifikasi`: User notifications system
  - `chat`: Admin-customer chat messages

## Key Components

### Authentication System
- **Fixed Login**: No registration system - users login with predetermined credentials
- **Default User**: "Siti Aminah" with PIN "112233"
- **Admin Access**: Special admin code "011090" for admin dashboard access
- **Session Storage**: User data stored in localStorage for client persistence

### Banking Features
- **Balance Display**: Combined view of deposit and savings balances
- **Withdrawal Rules**: Requires minimum 1.5% of deposit amount in savings
- **Transaction Validation**: Client and server-side validation for banking rules
- **Progress Tracking**: Shows remaining amount needed for full withdrawal eligibility

### User Interface Components
- **BalanceCard**: Main dashboard component showing account balances
- **ChatModal**: Real-time customer support chat interface
- **NotificationModal**: System notifications and alerts display
- **Responsive Design**: Mobile-first approach with card-based layouts

### Admin Dashboard
- **Balance Management**: Admin can update customer balances
- **Notification System**: Send notifications to customers
- **Chat Support**: Two-way communication with customers
- **Invoice Generation**: Basic invoice creation functionality

## Data Flow

### Client-Server Communication
1. **API Requests**: All data operations go through `/api` endpoints
2. **Query Management**: TanStack Query handles caching, refetching, and state synchronization
3. **Real-time Updates**: Chat and notifications use polling (2-second intervals)
4. **Error Handling**: Centralized error handling with toast notifications

### Database Operations
1. **User Management**: CRUD operations for customer accounts
2. **Balance Updates**: Atomic transactions for financial operations
3. **Notification System**: Insert notifications with read/unread status
4. **Chat Messages**: Bidirectional messaging between admin and customers

## External Dependencies

### Database Service
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection**: WebSocket-based connection pooling
- **Environment**: DATABASE_URL environment variable required

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **PostCSS**: CSS processing with autoprefixer

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast JavaScript bundling for production
- **Drizzle Kit**: Database schema management and migrations

## Deployment Strategy

### Development Mode
- **Server**: tsx with hot reloading on `server/index.ts`
- **Client**: Vite dev server with HMR
- **Database**: Drizzle Kit push for schema changes

### Production Build
1. **Frontend**: Vite builds client to `dist/public`
2. **Backend**: ESBuild bundles server to `dist/index.js`
3. **Static Serving**: Express serves built frontend files
4. **Database**: Migrations applied via Drizzle Kit

### Environment Configuration
- **NODE_ENV**: Controls development/production behavior
- **DATABASE_URL**: PostgreSQL connection string (required)
- **Port**: Express server port configuration
- **Replit Integration**: Special handling for Replit environment

### File Structure
- **Monorepo Setup**: Client, server, and shared code in single repository
- **Shared Schema**: Common TypeScript types and Zod schemas
- **Path Aliases**: Clean imports with @ prefixes for better organization