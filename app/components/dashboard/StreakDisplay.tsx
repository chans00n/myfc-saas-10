import { UserStreak } from '@/types/database';

interface StreakDisplayProps {
  streak: UserStreak | null;
}

export default function StreakDisplay({ streak }: StreakDisplayProps) {
  const currentStreak = streak?.current_streak || 0;
  
  return (
    <div className="mb-8">
      <div className="mb-5">
        <h2 className="text-xl font-normal text-neutral-800 dark:text-neutral-200">
          You have a <span className="font-bold border-b-2 border-indigo-500 dark:border-indigo-400">{currentStreak} day streak</span> today
        </h2>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Your lift streak this month</p>
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{currentStreak} days</p>
        </div>
        
        <div className="h-5 flex space-x-1 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 p-1">
          {Array.from({ length: 30 }, (_, i) => (
            <div 
              key={i} 
              className={`flex-1 h-full rounded-sm ${
                i < currentStreak 
                  ? i % 5 === 0 
                      ? 'bg-indigo-600 dark:bg-indigo-500' 
                      : 'bg-indigo-500 dark:bg-indigo-400'
                  : 'bg-neutral-200 dark:bg-neutral-700'
              } ${i === currentStreak - 1 ? 'animate-pulse' : ''}`}
            ></div>
          ))}
        </div>
        
        {currentStreak >= 5 && (
          <div className="mt-2 text-center">
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              {currentStreak >= 30 
                ? "Amazing! You've completed a full month streak! 🎉" 
                : `Keep going! ${30 - currentStreak} more days for a full month streak`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 