# MYFC (My Face Coach)

A mobile web application for facial fitness workouts with daily exercises, progress tracking, and membership features.

## Overview

MYFC helps users improve their facial fitness through guided daily workouts. Users can follow along with video instructions, track their progress, and achieve facial fitness goals.

## Features

- Daily facial fitness workouts with video instructions
- Comprehensive movement library targeting different facial areas
- Progress tracking with streaks and achievements
- User history and workout completion tracking
- Responsive design optimized for mobile and desktop
- Membership system integrated with Stripe payments

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Serverless Functions
- **Database:** PostgreSQL with Supabase
- **Authentication:** Supabase Auth
- **Styling:** Tailwind CSS with custom design system
- **Deployment:** Vercel

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database and auth)
- Stripe account (for payments)

## Getting Started

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/myfc.git
   cd myfc
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```
   Then fill in the required environment variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Other environment variables as needed

4. Set up the database
   - Run the SQL migrations in `database/migrations.sql` in your Supabase project

5. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
myfc/
├── app/                # Next.js App Router
├── components/         # Reusable components
├── lib/                # Utility libraries
├── types/              # TypeScript type definitions
├── database/           # Database files
├── styles/             # Additional styles
└── public/             # Static assets
```

Detailed structure can be found in [project-structure.md](./project-structure.md).

## Development Workflow

1. Track tasks in the [project tracker](./MYFC-ProjectTracker.md)
2. Create components according to the mobile-first design principles
3. Implement features in the order defined in the project tracker
4. Test on both mobile and desktop viewports

## Mobile-First Design

This project follows a mobile-first design approach:
- Core layouts optimized for mobile (320px-480px)
- Progressive enhancement for larger screens
- Touch-friendly UI elements
- Responsive adaptations for tablet and desktop

## License

[MIT](LICENSE)

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.io/)
- [Stripe](https://stripe.com/)
