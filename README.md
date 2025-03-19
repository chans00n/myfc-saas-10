# Next.js SaaS Starter

![SaaS App Preview](https://github.com/user-attachments/assets/63e761c4-aece-47c2-a320-f1cc18bf916b)

A complete, production-ready SaaS starter template built with Next.js 14, Supabase Auth, Stripe subscriptions, and PostgreSQL with Drizzle ORM.

## Features

- **Authentication & Authorization**
  - Complete auth flow with Supabase (login, signup, password reset)
  - Social authentication with Google and GitHub
  - Protected routes for authenticated users

- **Payment Processing**
  - Stripe integration for subscription management
  - Stripe Pricing Tables for elegant plan selection
  - Customer portal for managing billing details
  - Webhook handling for payment events

- **Database**
  - PostgreSQL database with Drizzle ORM
  - User and subscription data management
  - Simple schema migration and management

- **Modern Stack**
  - Next.js 14 with App Router
  - TypeScript for type safety
  - Tailwind CSS with shadcn/ui components
  - Server and client components

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- Stripe account
- Supabase account

### Local Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/next-js-saas-starter.git
   cd next-js-saas-starter
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Copy `.env.example` to `.env.local` and fill in the required values:
   
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_postgres_connection_string
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_PRICING_TABLE_ID=your_stripe_pricing_table_id
   NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000
   ```

4. Set up the database
   ```bash
   npm run db:migrate
   ```

5. Set up Stripe products (Optional - for subscription features)
   ```bash
   npm run stripe:setup
   ```

6. Start the development server
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Configuration

#### Supabase Auth

1. Create a new project on [Supabase](https://app.supabase.io/)
2. Configure authentication providers in the Supabase dashboard
3. Add your site URL and redirect URLs for OAuth providers

#### Stripe Integration

1. Create a [Stripe](https://dashboard.stripe.com/register) account
2. Set up products and pricing in the Stripe dashboard
3. Create a pricing table in Stripe and configure the redirect URL to `/subscribe/success`
4. Set up webhooks to handle subscription events

## Project Structure

```
├── app/                  # Next.js app directory
│   ├── auth/             # Auth-related routes
│   ├── dashboard/        # Protected dashboard routes
│   ├── subscribe/        # Subscription management
│   ├── webhook/          # API endpoints for webhooks
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/           # Reusable UI components
├── lib/                  # Utility functions and libraries
├── public/               # Static assets
├── utils/                # Helper functions and utilities
│   ├── db/               # Database utilities
│   │   ├── schema.ts     # Drizzle schema definitions
│   │   └── db.ts         # Database connection
│   └── supabase/         # Supabase client functions
├── middleware.ts         # Next.js middleware for auth
├── drizzle.config.ts     # Drizzle ORM configuration
└── stripeSetup.ts        # Stripe setup script
```

## Deployment

This application can be easily deployed on [Vercel](https://vercel.com):

1. Push your repository to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Stripe](https://stripe.com/)
- [Drizzle ORM](https://github.com/drizzle-team/drizzle-orm)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
