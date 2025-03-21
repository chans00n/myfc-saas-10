import Image from 'next/image';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full mx-auto text-center">
        <div className="mb-8 relative h-24 w-24 mx-auto">
          <Image 
            src="/icon.png" 
            alt="MYFC Logo" 
            width={96} 
            height={96}
            className="mx-auto"
          />
        </div>
        
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-4">
          You&apos;re Offline
        </h1>
        
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          It looks like you&apos;re currently offline. Some features may be unavailable until you reconnect.
        </p>
        
        <div className="mb-8 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <h2 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-2">
            What you can still do:
          </h2>
          <ul className="text-left text-neutral-600 dark:text-neutral-400 space-y-2">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              View previously loaded workouts
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Access cached movements
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              View your previous progress (if visited before)
            </li>
          </ul>
        </div>
        
        <Link href="/dashboard" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition duration-200">
          Try Again
        </Link>
      </div>
    </div>
  );
} 