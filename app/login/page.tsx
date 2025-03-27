import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import Link from 'next/link'
import Image from 'next/image'

import ProviderSigninBlock from '@/components/ProviderSigninBlock'
import LoginForm from "@/components/LoginForm"

export default function Login() {
    return (
        <div className="flex min-h-screen">
            {/* Left Section */}
            <div className="hidden w-1/2 bg-black p-8 lg:flex lg:flex-col lg:justify-between">
                <div className="flex items-center gap-2">
                    <Image 
                        src="/logo.png" 
                        alt="MYFC Logo" 
                        width={60} 
                        height={60}
                        className="invert" 
                        priority
                        unoptimized
                    />
                </div>
                <div className="space-y-4">
                    <p className="text-xl text-white">
                        "Since incorporating facial fitness into my daily routine, I've discovered a whole new level of self-confidence. It's not about fighting aging—it's about feeling strong and vibrant at every stage of life."
                    </p>
                    <p className="text-sm text-gray-400">Sarah Chen, Member since 2025</p>
                </div>
            </div>

            {/* Right Section - Keeping existing form content */}
            <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
                <Card className="w-full max-w-sm">
                    <CardHeader className="space-y-1">
                        <div className="lg:hidden flex justify-center py-4">
                            <Link href='/'>
                                <Image 
                                    src="/logo.png" 
                                    alt="MYFC Logo" 
                                    width={70} 
                                    height={70}
                                    className="dark:invert"
                                    priority
                                    unoptimized
                                />
                            </Link>
                        </div>
                        <CardTitle className="text-2xl font-bold">Login</CardTitle>
                        <CardDescription>Choose your preferred login method</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <LoginForm />
                        <div className="relative flex py-5 items-center">
                            <div className="flex-grow border-t border-gray-400"></div>
                            <span className="flex-shrink mx-4 text-sm text-muted-foreground">OR CONTINUE WITH</span>
                            <div className="flex-grow border-t border-gray-400"></div>
                        </div>
                        <ProviderSigninBlock />
                    </CardContent>
                    <CardFooter className="flex-col text-center">
                        <Link className="w-full text-sm text-muted-foreground" href="/forgot-password">
                            Forgot password?
                        </Link>
                        <Link className="w-full text-sm text-muted-foreground" href="/signup">
                            Don&apos;t have an account? Signup
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}