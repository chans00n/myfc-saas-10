import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Changelog | My Facial Fitness",
  description: "Track the latest updates and improvements to My Facial Fitness",
};

type ReleaseType = "major" | "minor" | "patch";

interface Release {
  version: string;
  date: string;
  title: string;
  description: string;
  changes: string[];
  type: ReleaseType;
}

export default function Changelog() {
  const releases: Release[] = [
    {
      version: "1.0.0",
      date: "June 15, 2023",
      title: "Initial Release",
      description: "The first public release of My Facial Fitness App.",
      changes: [
        "Complete facial workout library with 50+ exercises",
        "Personalized workout recommendations",
        "Progress tracking dashboard",
        "User accounts and profiles",
      ],
      type: "major",
    },
    {
      version: "1.1.0",
      date: "August 5, 2023",
      title: "Enhanced Progress Tracking",
      description: "Improved progress tracking features and performance optimizations.",
      changes: [
        "Added facial comparison tool for before/after photos",
        "Implemented streak tracking for consistent workouts",
        "Improved analytics dashboard",
        "Fixed login issues on Safari browsers",
      ],
      type: "minor",
    },
    {
      version: "1.1.5",
      date: "September 20, 2023",
      title: "Bug Fixes & UI Improvements",
      description: "Several bug fixes and user interface enhancements.",
      changes: [
        "Fixed image upload errors on iOS devices",
        "Improved dark mode contrast",
        "Added loading indicators for better UX",
        "Fixed subscription management issues",
      ],
      type: "patch",
    },
    {
      version: "1.2.0",
      date: "November 12, 2023",
      title: "Community Features",
      description: "Introduced community features and social sharing.",
      changes: [
        "Added leaderboards for workout consistency",
        "Implemented achievement badges system",
        "Added ability to share progress photos (optional)",
        "Improved mobile responsiveness",
      ],
      type: "minor",
    },
    {
      version: "2.0.0",
      date: "February 28, 2024",
      title: "Major Platform Upgrade",
      description: "Complete platform overhaul with new features and improved performance.",
      changes: [
        "Redesigned user interface with improved accessibility",
        "Added AI-powered workout recommendations",
        "Implemented personalized coaching notes",
        "Enhanced progress tracking with detailed metrics",
        "Added integration with health apps",
        "Improved video playback and streaming quality",
      ],
      type: "major",
    },
    {
      version: "2.1.0",
      date: "April 10, 2024",
      title: "Admin Dashboard & Premium Features",
      description: "New admin features and premium subscription enhancements.",
      changes: [
        "Implemented comprehensive admin dashboard",
        "Added advanced workout management tools",
        "Enhanced user management capabilities",
        "Improved subscription and payment processing",
        "Added detailed analytics for administrators",
      ],
      type: "minor",
    },
  ];

  const getBadgeColor = (type: ReleaseType): string => {
    switch (type) {
      case "major":
        return "bg-emerald-500 hover:bg-emerald-600";
      case "minor":
        return "bg-blue-500 hover:bg-blue-600";
      case "patch":
        return "bg-amber-500 hover:bg-amber-600";
      default:
        return "bg-slate-500 hover:bg-slate-600";
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:pt-16 md:pb-16">
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-8">
          <CardTitle className="text-3xl">Changelog</CardTitle>
          <p className="text-muted-foreground mt-2">Track updates and improvements to My Facial Fitness</p>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="space-y-12">
            {releases.map((release, index) => (
              <div key={release.version} className={`relative ${index < releases.length - 1 ? "pb-12 border-l-2 border-muted ml-6" : ""}`}>
                <div className="flex items-center mb-4">
                  <div className="absolute -left-6 bg-background p-1 rounded-full border-2 border-muted">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getBadgeColor(release.type)}`}>
                      {release.type === "major" ? "M" : release.type === "minor" ? "m" : "p"}
                    </div>
                  </div>
                  <div className="ml-6">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold">{release.version}</h2>
                      <Badge variant="outline" className="font-normal">
                        {release.date}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold mt-1">{release.title}</h3>
                  </div>
                </div>
                
                <div className="ml-6">
                  <p className="text-muted-foreground mb-4">{release.description}</p>
                  
                  <div className="bg-muted/40 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Changes in this release:</h4>
                    <ul className="space-y-2">
                      {release.changes.map((change, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 