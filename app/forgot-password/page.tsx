import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ForgotPasswordForm from '@/components/ForgotPasswordForm'

export default function ForgotPassword() {
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
                        "The best investment you can make is in yourself. Taking care of your facial fitness is not just about looks—it's about confidence, health, and feeling your best every day."
                    </p>
                    <p className="text-sm text-gray-400">Emma Davis, Member since 2025</p>
                </div>
            </div>

            {/* Right Section */}
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
                        <CardTitle className="text-2xl font-bold">Forgot Your Password?</CardTitle>
                        <CardDescription>Enter your email address</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <ForgotPasswordForm />
                    </CardContent>
                    <CardFooter className="flex-col text-center">
                        <Link className="w-full text-sm text-muted-foreground" href="/login">
                            Back to login
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