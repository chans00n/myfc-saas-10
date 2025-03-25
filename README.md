# MYFC (My Face Coach)

A mobile-focused web application for facial fitness workouts with daily exercises, progress tracking, and membership features.

## Overview

MYFC helps users improve their facial fitness through guided daily workouts. Users can follow along with video instructions, track their progress, and achieve facial fitness goals through a structured program of exercises.

## Key Features

- **Daily Workout Program**: Guided facial fitness workouts with video instructions
- **Movement Library**: Comprehensive collection of movements targeting different facial areas
- **Progress Tracking**: Track streaks, completed workouts, and achievements
- **Mobile-First Design**: Optimized for mobile devices with progressive enhancement for larger screens
- **Admin Dashboard**: Complete admin panel for content management and user administration
- **Membership System**: Subscription plans with Stripe payment integration
- **PWA Support**: Progressive Web App capabilities for mobile installation
- **Dark/Light Mode**: Theme support with automatic system preference detection

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Components**: shadcn/ui component library
- **State Management**: React Context API and local state
- **Charts**: Recharts for data visualization
- **Drag & Drop**: hello-pangea/dnd for drag and drop interfaces

### Backend & API
- **API Routes**: Next.js API Routes (serverless functions)
- **Authentication**: Supabase Auth with middleware protection
- **Database Access**: Server-side data fetching with caching
- **Admin Operations**: Separate admin API endpoints with admin-level access

### Database
- **Database**: PostgreSQL hosted on Supabase
- **ORM**: Drizzle ORM for type-safe database queries
- **Migrations**: SQL migrations organized in the `/sql` directory
- **Row-Level Security**: Supabase RLS policies for data protection

### Authentication
- **Provider**: Supabase Auth
- **Methods**: Email/password, social login (Google, GitHub)
- **Protection**: Middleware for route protection
- **Role-Based Access**: User and admin role separation

### Payment Processing
- **Provider**: Stripe
- **Features**: Subscription management, checkout sessions, webhooks
- **UI**: Stripe Checkout and Pricing Tables

### Deployment & DevOps
- **Hosting**: Vercel
- **CI/CD**: Vercel's GitHub integration
- **Environment**: Development, staging, and production environments

## Project Structure

```
myfc/
├── app/                  # Next.js App Router
│   ├── admin/            # Admin panel section
│   ├── api/              # API Routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # User dashboard
│   └── ...               # Other app routes
├── components/           # Reusable React components
│   ├── admin/            # Admin-specific components
│   ├── ui/               # shadcn UI components
│   └── ...               # Feature-specific components
├── contexts/             # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   └── supabase/         # Supabase client and helpers
├── public/               # Static assets
├── sql/                  # SQL files organized by category
│   ├── database/         # Database schema definitions
│   ├── migrations/       # Migration scripts
│   ├── leaderboard/      # Leaderboard-related SQL
│   └── ...               # Other SQL categories
├── types/                # TypeScript type definitions
└── utils/                # Utility functions and helpers
    └── db/               # Database utilities and Drizzle ORM
```

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or pnpm
- Supabase account
- Stripe account (for payments)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/myfc-saas.git
   cd myfc-saas
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then fill in the required environment variables in `.env.local`:
   - Supabase credentials
   - Stripe API keys
   - Other required config variables

4. Set up the database:
   - Run the SQL migrations in your Supabase project
   - Or use Drizzle migrations:
     ```bash
     npm run db:migrate
     ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run Drizzle migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Start Drizzle Studio for database management
- `npm run stripe:setup` - Set up Stripe products and prices

## Mobile-First Design

This project follows a mobile-first design approach with:
- Core layouts optimized for mobile screens (320px-480px)
- Progressive enhancement for tablet and desktop
- Touch-friendly UI elements with appropriate sizing
- Responsive adaptations using Tailwind's breakpoint system
- Bottom navigation for mobile and sidebar for larger screens

## Admin Panel

The admin section provides tools to manage:
- User accounts and memberships
- Workout content (create, edit, publish)
- Movement library management
- Analytics and reporting

Access to the admin section is restricted to users with the admin role.

## Development Guidelines

- Follow the mobile-first approach for all new features
- Use server components where possible to improve performance
- Add client-side interactivity with the "use client" directive only when necessary
- Maintain TypeScript types for all data structures
- Follow the established project structure for new features
- Use the shadcn/ui component library for consistent UI

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.io/)
- [Stripe](https://stripe.com/)
- [Vercel](https://vercel.com/)
