import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function SplashPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-neutral-50 dark:bg-neutral-900">
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="mx-auto">
            <Image 
              src="/myfc-logo.png" 
              alt="My Face Coach Logo" 
              width={120} 
              height={120} 
              className="mx-auto dark:hidden" 
              priority
            />
            <Image 
              src="/myfc-logo-dark.png" 
              alt="My Face Coach Logo" 
              width={120} 
              height={120} 
              className="mx-auto hidden dark:block" 
              priority
            />
          </div>
          
          {/* App Name and Tagline */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-neutral-900 dark:text-neutral-50">
            Elevate Your Routine with Facial Fitness
            </h1>
            <p className="text-lg text-muted-foreground">
            Your face is unique, and it deserves the same attention and care as the rest of your body. Let's make facial fitness a natural part of your daily wellness routine—because when you look strong, you feel strong.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="space-y-4 pt-4">
            <Link href="/signup" className="block w-full">
              <Button size="lg" className="w-full text-base py-6">
                Try for Free
              </Button>
            </Link>
            
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t border-neutral-200 dark:border-neutral-800">
        <div className="container flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MYFC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}