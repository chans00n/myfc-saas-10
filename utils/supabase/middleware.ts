import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.
    const {
        data: { user },
    } = await supabase.auth.getUser()
    const url = request.nextUrl.clone()

    if (request.nextUrl.pathname.startsWith('/webhook')) {
        return supabaseResponse
    }

    // Check for admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            // Redirect to login if not authenticated
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
        
        // TODO: Replace with your actual admin check
        // For now, we'll use domain check for @myfc.app emails
        const isAdmin = user.email?.endsWith('@myfc.app') || user.email === 'admin@example.com'
        
        if (!isAdmin) {
            // Redirect non-admin users to dashboard
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        !request.nextUrl.pathname.startsWith('/signup') &&
        !request.nextUrl.pathname.startsWith('/forgot-password') &&
        !(request.nextUrl.pathname === '/')
    ) {
        // no user, potentially respond by redirecting the user to the login page
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }
    // // If user is logged in, redirect to dashboard
    if (user && request.nextUrl.pathname === '/') {
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }
    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse
}