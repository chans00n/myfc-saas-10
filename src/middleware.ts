import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check auth status
  const { data } = await supabase.auth.getSession()

  // If not authenticated and trying to access protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                           request.nextUrl.pathname.startsWith('/workouts') ||
                           request.nextUrl.pathname.startsWith('/progress') ||
                           request.nextUrl.pathname.startsWith('/profile')
                           
  if (isProtectedRoute && !data.session) {
    // Redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

// Specify which routes the middleware should run on
export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/workouts/:path*',
    '/progress/:path*',
    '/profile/:path*',
    // Auth routes that need session info but don't require auth
    '/auth/:path*',
  ],
} 