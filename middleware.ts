import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    try {
        return await updateSession(request)
    } catch (error: any) {
        console.error('Middleware error:', error)

        // Handle database connection errors
        if (error.code === 'XX000' && error.message.includes('Max client connections')) {
            return new NextResponse(
                JSON.stringify({
                    error: 'Service temporarily unavailable. Please try again in a moment.',
                }),
                {
                    status: 503,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': '5',
                    },
                }
            )
        }

        // Handle other errors
        return new NextResponse(
            JSON.stringify({
                error: 'Internal server error',
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )
    }
}

export const config = {
    matcher: [
        '/(api|trpc)(.*)',
        '/((?!_next/static|_next/image|favicon.ico).*)',
        '/admin/:path*',
    ],
}

