import Image from "next/image"
import { createClient } from '@/utils/supabase/server'
import CustomPricingPage from "../../components/CustomPricingPage"

export default async function Subscribe() {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
            <header className="px-4 lg:px-6 h-16 flex items-center bg-white dark:bg-gray-900 border-b fixed border-b-slate-200 dark:border-b-slate-800 w-full z-10">
                <Image src="/logo.png" alt="logo" width={80} height={80} />
            </header>
            
            <div className="w-full pt-24 pb-12">
                <CustomPricingPage userId={user?.id || ""} userEmail={user?.email || ""} />
            </div>
            
            <footer className="py-6 mt-auto bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>© {new Date().getFullYear()} MYFC. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}