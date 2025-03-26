export const dynamicRoutes = {
    // Mark all authenticated routes as dynamic
    '/dashboard': true,
    '/admin': true,
    '/api': true,
    '/workout': true,
    '/profile': true,
    '/bookmarks': true,
    '/leaderboards': true,
}

export const runtime = 'edge' as const
export const dynamic = 'force-dynamic' as const

// Disable static generation for API routes
export const preferredRegion = 'auto' as const
export const revalidate = 0 as const 