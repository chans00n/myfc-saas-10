import Image from "next/image"
import { createClient } from '@/utils/supabase/server'
import CustomPricingPage from "@/components/CustomPricingPage"

export default async function Subscribe() {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    return (
        <div className="flex flex-col min-h-screen bg-secondary">
            <header className="px-4 lg:px-6 h-16 flex items-center bg-white border-b fixed border-b-slate-200 w-full z-10">
                <Image src="/logo.png" alt="logo" width={50} height={50} />
                <span className="sr-only">Acme Inc</span>
            </header>
            <div className="w-full py-20 lg:py-32 xl:py-40">
                <div className="text-center py-6 md:py-10 lg:py-12">
                    <h1 className="font-bold text-xl md:text-3xl lg:text-4xl">Pricing</h1>
                    <h1 className="pt-4 text-muted-foreground text-sm md:text-md lg:text-lg">Choose the right plan for your fitness journey! Cancel anytime!</h1>
                </div>
                
                <CustomPricingPage userId={user?.id || ""} userEmail={user?.email || ""} />
            </div>
        </div>
    )
}