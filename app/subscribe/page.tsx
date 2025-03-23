import Image from "next/image"
import { createClient } from '@/utils/supabase/server'
import CustomPricingPage from "@/components/CustomPricingPage"

export default async function Subscribe() {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
            <header className="px-4 lg:px-6 h-16 flex items-center bg-white dark:bg-gray-900 border-b fixed border-b-slate-200 dark:border-b-slate-800 w-full z-10">
                <Image src="/logo.png" alt="logo" width={50} height={50} />
                <span className="ml-3 font-semibold text-lg">MyFC Fitness</span>
            </header>
            
            {/* Hero section */}
            <div className="w-full pt-24 pb-12 lg:pt-32 xl:pt-36">
                <div className="text-center py-6 md:py-10 lg:py-12 max-w-4xl mx-auto px-4">
                    <h1 className="font-bold text-2xl md:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-4">
                        Invest in Your Fitness Journey
                    </h1>
                    <h2 className="pt-4 text-gray-600 dark:text-gray-300 text-md md:text-lg lg:text-xl max-w-2xl mx-auto">
                        Choose the perfect plan to transform your body and health with expert-designed programs tailored just for you.
                    </h2>
                    
                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                        <div className="bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">Cancel anytime</span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">7-day free trial</span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">Save 25% annually</span>
                        </div>
                    </div>
                </div>
                
                <CustomPricingPage userId={user?.id || ""} userEmail={user?.email || ""} />
            </div>
            
            {/* Footer */}
            <footer className="py-8 mt-auto bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>© {new Date().getFullYear()} MyFC Fitness. All rights reserved.</p>
                    <div className="mt-2 space-x-4">
                        <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Terms</a>
                        <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</a>
                        <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}