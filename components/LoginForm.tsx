"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFormState, useFormStatus } from 'react-dom'
import { loginUser } from '@/app/auth/actions'
import { toast } from "sonner"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { authEvents } from "@/lib/analytics/events"

// Submit button with loading state
function SubmitButton() {
    const { pending } = useFormStatus()
    
    return (
        <Button className="w-full mt-4" type="submit" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                </>
            ) : (
                "Sign In"
            )}
        </Button>
    )
}

export default function LoginForm() {
    const initialState = {
        message: ''
    }
    const [formState, formAction] = useFormState(loginUser, initialState)
    
    // Show toast notifications based on form state
    useEffect(() => {
        if (formState?.message) {
            toast.error(formState.message)
        } else if (formState && !formState.message) {
            // If there's no error message, the login was successful
            authEvents.login('email')
        }
    }, [formState])
    
    return (
        <form action={formAction}>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    name="email"
                    required
                />
            </div>
            <div className="grid gap-2 mt-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    name="password"
                    required
                />
            </div>
            <SubmitButton />
            {/* We'll still keep this for accessibility, but visual feedback will be via toast */}
            {formState?.message && (
                <p className="sr-only">{formState.message}</p>
            )}
        </form>
    )
}