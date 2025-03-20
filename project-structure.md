# MYFC Project Structure

This document outlines the recommended folder structure for the MYFC (My Face Coach) mobile web application.

```
myfc/
├── app/                           # Next.js App Router
│   ├── api/                       # API Routes
│   │   ├── achievements/          # Achievement-related endpoints
│   │   ├── auth/                  # Auth-related endpoints (if needed)
│   │   ├── workouts/              # Workout-related endpoints
│   │   └── movements/             # Movement-related endpoints
│   ├── auth/                      # Auth pages
│   │   ├── login/                 # Login page
│   │   ├── signup/                # Signup page
│   │   └── forgot-password/       # Password recovery
│   ├── dashboard/                 # Dashboard (home) page
│   │   └── page.tsx               # Main dashboard component
│   ├── workouts/                  # Workouts section
│   │   ├── [id]/                  # Workout detail page
│   │   │   └── page.tsx           # Individual workout view
│   │   └── page.tsx               # Workouts list page
│   ├── progress/                  # Progress tracking page
│   │   └── page.tsx               # User progress view
│   ├── movements/                 # Movements library
│   │   ├── [id]/                  # Individual movement details
│   │   │   └── page.tsx           # Movement view
│   │   └── page.tsx               # Movements list
│   ├── profile/                   # User profile
│   │   └── page.tsx               # Profile page
│   ├── layout.tsx                 # Root layout
│   ├── globals.css                # Global styles
│   └── page.tsx                   # Landing page
│
├── components/                    # Reusable components
│   ├── layout/                    # Layout components
│   │   ├── Container.tsx          # Container component
│   │   ├── MobileNav.tsx          # Mobile navigation
│   │   └── DesktopNav.tsx         # Desktop navigation
│   ├── ui/                        # UI components from shadcn
│   │   ├── button.tsx             # Button component
│   │   ├── card.tsx               # Card component
│   │   └── ...                    # Other UI components
│   ├── workout/                   # Workout-specific components
│   │   ├── WorkoutCard.tsx        # Workout card component
│   │   ├── FocusAreas.tsx         # Focus areas display
│   │   └── WorkoutGrid.tsx        # Grid layout for workouts
│   ├── video/                     # Video player components
│   │   ├── VideoPlayer.tsx        # Custom video player
│   │   └── VideoControls.tsx      # Video control UI
│   ├── progress/                  # Progress components
│   │   ├── StreakCalendar.tsx     # Calendar component
│   │   ├── StatsDisplay.tsx       # Stats visualization
│   │   └── AchievementBadge.tsx   # Achievement badge
│   └── movement/                  # Movement components
│       ├── MovementCard.tsx       # Movement card
│       └── MovementList.tsx       # List of movements
│
├── lib/                           # Utility libraries
│   ├── supabase/                  # Supabase client
│   │   ├── client.ts              # Supabase client setup
│   │   └── db-types.ts            # Database type definitions
│   ├── utils/                     # Utility functions
│   │   ├── date.ts                # Date manipulation functions
│   │   └── format.ts              # Formatting utilities
│   └── hooks/                     # Custom React hooks
│       ├── useWorkouts.ts         # Hook for workout data
│       ├── useProgress.ts         # Hook for progress data
│       └── useAuth.ts             # Auth-related hooks
│
├── types/                         # TypeScript type definitions
│   ├── workout.ts                 # Workout types
│   ├── movement.ts                # Movement types
│   ├── user.ts                    # User types
│   └── achievement.ts             # Achievement types
│
├── database/                      # Database files
│   ├── migrations.sql             # SQL migrations for Supabase
│   └── schema.ts                  # TypeScript schema definitions
│
├── styles/                        # Additional styles
│   └── variables.css              # CSS variables
│
├── public/                        # Static assets
│   ├── images/                    # Image assets
│   ├── icons/                     # Icon assets
│   └── favicon.ico                # Favicon
│
├── middleware.ts                  # Next.js middleware for auth
├── tailwind.config.js             # Tailwind configuration
├── next.config.js                 # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Project dependencies
└── README.md                      # Project documentation
```

## Notes on Structure

1. **App Router**: Using Next.js 14 App Router for routing and layouts
2. **Components**: Organized by functionality and feature
3. **Mobile-First**: Structure supports mobile-first with responsive components
4. **API Routes**: Server-side functionality through API routes
5. **Type Safety**: Comprehensive TypeScript types throughout the project

## Key Considerations

- All components should be responsive, with mobile as the primary target
- Use server components where possible for improved performance
- Client components should be clearly marked with "use client" directive
- Keep data fetching close to where it's used
- Maintain consistent naming conventions throughout the project 