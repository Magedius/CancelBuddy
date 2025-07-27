# CancelBuddy - Subscription Cancellation Reminder App

## Overview

CancelBuddy is a mobile-optimized subscription management application that helps users track their recurring subscriptions and avoid unnecessary monthly charges by reminding them when free trial periods are about to end. Despite the "Cancel" in the name, this is a comprehensive subscription tracking and management tool, not a cancellation service. The app serves as a personal dashboard that tracks all subscriptions and sends timely reminders through multiple notification channels.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: Extensive use of Radix UI primitives through shadcn/ui

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API architecture
- **Development Server**: Custom Vite integration for hot module replacement

### Data Storage Solutions
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via DATABASE_URL)
- **Schema Management**: Drizzle migrations with shared schema definitions
- **Development Storage**: In-memory storage implementation for development/testing

## Key Components

### Database Schema
Located in `shared/schema.ts`, defines two main entities:
- **Subscriptions**: Tracks service name, pricing, trial periods, cancellation URLs, and status
- **Notification Settings**: Manages user preferences for different notification channels (push, email, SMS, WhatsApp)

### API Endpoints
- `GET /api/subscriptions` - Retrieve all subscriptions
- `GET /api/subscriptions/:id` - Get single subscription
- `POST /api/subscriptions` - Create new subscription
- `PATCH /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Remove subscription
- `GET /api/settings` - Get notification settings
- `PATCH /api/settings` - Update notification settings

### Frontend Components
- **Home Page**: Dashboard showing subscription overview and status cards
- **Subscription Cards**: Display trial status with color-coded urgency levels
- **Add Subscription Modal**: Form for adding new subscriptions with popular service presets
- **Settings Modal**: Configuration for notification preferences and reminder timing

### Notification System
Status calculation based on trial end dates:
- **Safe**: More than reminder days remaining
- **Warning**: Within reminder period but more than 1 day
- **Urgent**: 1 day or less remaining

## Data Flow

1. **Subscription Creation**: User selects from popular services or creates custom subscription
2. **Status Calculation**: Server calculates urgency status based on trial end date and user's reminder preferences
3. **Dashboard Display**: React Query fetches and caches subscription data, displaying color-coded status cards
4. **Settings Management**: User preferences for notification channels and reminder timing
5. **Real-time Updates**: TanStack Query provides optimistic updates and automatic refetching

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React ecosystem with TypeScript support
- **Styling**: Tailwind CSS with PostCSS processing
- **Form Handling**: React Hook Form with Zod validation resolvers
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: Neon Database serverless PostgreSQL
- **Session Management**: connect-pg-simple for PostgreSQL session store
- **Validation**: Zod for runtime type checking and schema validation
- **ORM**: Drizzle ORM with PostgreSQL dialect

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Development**: tsx for TypeScript execution in development
- **Database Tools**: Drizzle Kit for migrations and schema management
- **Replit Integration**: Custom cartographer plugin for Replit environment

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations handle schema deployment

### Environment Configuration
- **Development**: Uses tsx with NODE_ENV=development
- **Production**: Compiled JavaScript execution with NODE_ENV=production
- **Database**: Requires DATABASE_URL environment variable

### Static Asset Handling
- **Development**: Vite dev server with HMR
- **Production**: Express serves static files from dist/public
- **Asset Resolution**: Path aliases configured for clean imports

The application is designed with a mobile-first approach, emphasizing user experience with smooth animations, intuitive navigation, and a clean interface that creates an immediate "wow effect" for users.

## Recent Changes (January 26, 2025)

### Dedicated Costs Page
- Created standalone `/costs` page for detailed cost analysis
- Moved cost chart from collapsible home component to dedicated page
- Added "Kustannukset" button to bottom navigation bar
- Includes comprehensive cost breakdown with subscription details
- Enhanced with back navigation arrow and improved layout
- Shows monthly, 6-month, and yearly subscription cost projections
- Includes savings potential insights with purple gradient design

### Enhanced Subscription Management
- Implemented complete CRUD operations for subscriptions (Create, Read, Update, Delete)
- Added dropdown menu with "Muokkaa" (Edit) and "Poista" (Delete) options
- Edit functionality reuses AddSubscriptionModal with pre-filled data
- Delete includes confirmation dialog with toast notifications
- Full integration with TanStack Query for optimistic updates

### Collapsible Subscription Cards
- Cards show minimal info when collapsed: name, logo, price, status, expand arrow
- Clicking card header expands to show full details and action buttons
- Smooth animations and proper z-index layering for Netflix backgrounds
- Maintains all CRUD functionality in expanded state

### Progressive Web App (PWA) Features
- **Web App Manifest**: Full PWA configuration with Finnish localization and badging permissions
- **Service Worker**: Offline caching, background sync, and badge management
- **Install Button**: Appears on mobile devices for home screen installation
- **iOS Support**: Apple touch icons and Safari-specific meta tags
- **Badge Notifications**: App icon shows red number when subscriptions are expiring
- **Background Updates**: Service worker checks subscription status and updates badges
- **Installation Logic**: Detects installed state and requests notification permissions
- **Mobile Optimization**: User-scalable disabled for app-like experience

### App Icon Badge System
- **Dynamic Badge Count**: Shows number of subscriptions with "warning" or "urgent" status
- **Real-time Updates**: Badge updates automatically when subscription status changes
- **Cross-platform Support**: Works on both Android and iOS (with PWA installed)
- **Visual Alert**: Red number appears on app icon to prompt user attention
- **Background Sync**: Service worker maintains badge accuracy even when app is closed

### Visual Enhancements
- Custom Netflix background integration for Netflix subscription cards
- 20% opacity overlay maintaining readability
- Service-specific logo backgrounds and colors
- Improved z-index layering for proper content display

### Technical Improvements
- Enhanced error handling with user-friendly Finnish messages
- Proper session management with activation flow
- Comprehensive API testing validated all endpoints working
- LSP diagnostics resolved for type safety
- PWA installation prompts for Android and iOS devices

### Google Cloud Run Production Deployment (January 27, 2025)
- **Container Runtime Contract Compliance**: Follows all Google Cloud Run requirements exactly
- **Network Binding**: Server listens on `0.0.0.0` (required) instead of `127.0.0.1`, uses PORT env variable
- **Port Configuration**: Defaults to 8080 as per Google Cloud Run standards (was 5000)
- **Health Monitoring**: `/health` and `/ready` endpoints with service version info and storage checks
- **Error Handling**: Graceful error handling prevents container crashes that cause slow restarts
- **Security & Performance**: Non-root user, security updates, optimized dependency management
- **Build Process**: Single-stage Dockerfile optimized for Cloud Run with health checks
- **Documentation**: Updated README.md with Google Cloud Run best practices and deployment guide
- **Testing**: Verified build process works correctly with all Google requirements