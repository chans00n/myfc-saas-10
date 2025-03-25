import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Changelog | MYFC",
  description: "Track the latest updates and improvements to MYFC",
};

type ChangeType = "new" | "improved" | "fixed" | "removed";

interface Change {
  type: ChangeType;
  description: string;
}

interface Release {
  version: string;
  date: string;
  title: string;
  description: string;
  changes: Change[];
}

export default function Changelog() {
  // To add a new release, just add a new entry at the TOP of this array
  const releases: Release[] = [
    {
      version: "2.2.0",
      date: "June 20, 2024",
      title: "Mobile Responsiveness & Profile Enhancements",
      description: "Improved mobile experience and enhanced user profile functionality.",
      changes: [
        { type: "new", description: "Added user location detection via browser geolocation" },
        { type: "new", description: "Implemented account deletion functionality in user profile" },
        { type: "new", description: "Added additional profile fields (gender, birthday, location)" },
        { type: "improved", description: "Enhanced mobile responsiveness across all admin pages" },
        { type: "improved", description: "Better organized legal pages with improved navigation" },
        { type: "fixed", description: "Fixed mobile sidebar toggle behavior on small screens" },
        { type: "fixed", description: "Resolved gender field display issue in profile" },
        { type: "fixed", description: "Corrected 'Member Since' date display on profile page" }
      ]
    },
    {
      version: "2.1.0",
      date: "April 10, 2024",
      title: "Admin Dashboard & Premium Features",
      description: "New admin features and premium subscription enhancements.",
      changes: [
        { type: "new", description: "Implemented comprehensive admin dashboard" },
        { type: "new", description: "Added advanced workout management tools" },
        { type: "new", description: "Enhanced user management capabilities" },
        { type: "improved", description: "Improved subscription and payment processing" },
        { type: "new", description: "Added detailed analytics for administrators" }
      ]
    },
    {
      version: "2.0.0",
      date: "February 28, 2024",
      title: "Major Platform Upgrade",
      description: "Complete platform overhaul with new features and improved performance.",
      changes: [
        { type: "improved", description: "Redesigned user interface with improved accessibility" },
        { type: "new", description: "Added AI-powered workout recommendations" },
        { type: "new", description: "Implemented personalized coaching notes" },
        { type: "improved", description: "Enhanced progress tracking with detailed metrics" },
        { type: "new", description: "Added integration with health apps" },
        { type: "improved", description: "Improved video playback and streaming quality" }
      ]
    },
    {
      version: "1.2.0",
      date: "November 12, 2023",
      title: "Community Features",
      description: "Introduced community features and social sharing.",
      changes: [
        { type: "new", description: "Added leaderboards for workout consistency" },
        { type: "new", description: "Implemented achievement badges system" },
        { type: "new", description: "Added ability to share progress photos (optional)" },
        { type: "improved", description: "Improved mobile responsiveness" }
      ]
    },
    {
      version: "1.1.5",
      date: "September 20, 2023",
      title: "Bug Fixes & UI Improvements",
      description: "Several bug fixes and user interface enhancements.",
      changes: [
        { type: "fixed", description: "Fixed image upload errors on iOS devices" },
        { type: "improved", description: "Improved dark mode contrast" },
        { type: "new", description: "Added loading indicators for better UX" },
        { type: "fixed", description: "Fixed subscription management issues" }
      ]
    },
    {
      version: "1.1.0",
      date: "August 5, 2023",
      title: "Enhanced Progress Tracking",
      description: "Improved progress tracking features and performance optimizations.",
      changes: [
        { type: "new", description: "Added facial comparison tool for before/after photos" },
        { type: "new", description: "Implemented streak tracking for consistent workouts" },
        { type: "improved", description: "Improved analytics dashboard" },
        { type: "fixed", description: "Fixed login issues on Safari browsers" }
      ]
    },
    {
      version: "1.0.0",
      date: "June 15, 2023",
      title: "Initial Release",
      description: "The first public release of MYFC App.",
      changes: [
        { type: "new", description: "Complete facial workout library with 50+ exercises" },
        { type: "new", description: "Personalized workout recommendations" },
        { type: "new", description: "Progress tracking dashboard" },
        { type: "new", description: "User accounts and profiles" }
      ]
    }
  ];

  const getChangeTypeLabel = (type: ChangeType): string => {
    switch (type) {
      case "new": return "New";
      case "improved": return "Improved";
      case "fixed": return "Fixed";
      case "removed": return "Removed";
      default: return "Changed";
    }
  };

  const getChangeTypeColor = (type: ChangeType): string => {
    switch (type) {
      case "new": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "improved": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "fixed": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "removed": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getSemanticVersionColor = (version: string): string => {
    // Major version (breaking changes)
    if (version.split('.')[1] === '0' && version.split('.')[2] === '0') {
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 font-semibold";
    }
    // Minor version (new features)
    if (version.split('.')[2] === '0') {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 font-semibold";
    }
    // Patch version (bug fixes)
    return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 font-semibold";
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:pt-16 md:pb-16">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Changelog</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-1">Track updates and improvements to MYFC</p>
        <p className="text-xs text-neutral-500">
          Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="space-y-12">
        {releases.map((release, index) => (
          <div key={release.version}>
            {index !== 0 && <Separator className="mb-12" />}
            
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4">
              <Badge className={getSemanticVersionColor(release.version)} variant="outline">
                v{release.version}
              </Badge>
              <h2 className="text-xl font-semibold">{release.title}</h2>
              <span className="text-sm text-neutral-500 md:ml-auto">
                {release.date}
              </span>
            </div>
            
            <p className="text-neutral-700 dark:text-neutral-300 mb-6">
              {release.description}
            </p>
            
            <div className="space-y-4">
              {/* Group changes by type */}
              {['new', 'improved', 'fixed', 'removed'].map(changeType => {
                const filteredChanges = release.changes.filter(change => change.type === changeType);
                if (filteredChanges.length === 0) return null;
                
                return (
                  <div key={changeType} className="space-y-2">
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {getChangeTypeLabel(changeType as ChangeType)}
                    </h3>
                    <div className="ml-4 space-y-2">
                      {filteredChanges.map((change, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-neutral-700 dark:text-neutral-300">
                            {change.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 