"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFormState, useFormStatus } from 'react-dom'
import { signup } from '@/app/auth/actions'
import { toast } from "sonner"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

// Submit button with loading state
function SubmitButton() {
    const { pending } = useFormStatus()
    
    return (
        <Button className="w-full mt-4" type="submit" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                </>
            ) : (
                "Sign Up"
            )}
        </Button>
    )
}

export default function SignupForm() {
    const initialState = {
        message: ''
    }

    const [formState, formAction] = useFormState(signup, initialState)
    
    // Show toast notifications based on form state
    useEffect(() => {
        if (formState?.message) {
            toast.error(formState.message)
        }
    }, [formState])

    return (
        <form action={formAction}>
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    name="name"
                    required
                />
            </div>
            <div className="grid gap-2 mt-2">
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