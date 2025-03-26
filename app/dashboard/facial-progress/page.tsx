import FacialTrackingCapture from "@/components/FacialTrackingCapture";
import FacialProgressGallery from "@/components/FacialProgressGallery";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Facial Progress Tracking | My Facial Fitness",
  description: "Track your facial fitness progress with consistent, high-quality photos",
};

export default function FacialProgressPage() {
  return (
    <div className="mx-auto py-8 p-4">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Document your facial fitness journey</p>
                    <h1 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">Facial Progress Tracking</h1>
                </div>
            </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FacialTrackingCapture />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Progress Gallery</CardTitle>
              <CardDescription>
                View your collection of progress photos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FacialProgressGallery />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Why Track Your Progress?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex">
                  <span className="mr-2 text-neutral-800 dark:text-neutral-400">•</span>
                  <span className="text-neutral-600 dark:text-neutral-400">Visualize subtle changes that occur over time</span>
                </li>
                <li className="flex">
                  <span className="mr-2 text-neutral-800 dark:text-neutral-400">•</span>
                  <span className="text-neutral-600 dark:text-neutral-400">Stay motivated by seeing your facial transformation</span>
                </li>
                <li className="flex">
                  <span className="mr-2 text-neutral-800 dark:text-neutral-400">•</span>
                  <span className="text-neutral-600 dark:text-neutral-400">Identify which exercises are most effective for you</span>
                </li>
                <li className="flex">
                  <span className="mr-2 text-neutral-800 dark:text-neutral-400">•</span>
                  <span className="text-neutral-600 dark:text-neutral-400">Create before and after comparisons to share your success</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex">
                  <span className="mr-2 text-neutral-800 dark:text-neutral-400">•</span>
                  <span className="text-neutral-600 dark:text-neutral-400">Take photos weekly on the same day</span>
                </li>
                <li className="flex">
                  <span className="mr-2 text-neutral-800 dark:text-neutral-400">•</span>
                  <span className="text-neutral-600 dark:text-neutral-400">Maintain consistent lighting and position</span>
                </li>
                <li className="flex">
                  <span className="mr-2 text-neutral-800 dark:text-neutral-400">•</span>
                  <span className="text-neutral-600 dark:text-neutral-400">Use the alignment guides for accurate comparisons</span>
                </li>
                <li className="flex">
                  <span className="mr-2 text-neutral-800 dark:text-neutral-400">•</span>
                  <span className="text-neutral-600 dark:text-neutral-400">Keep a neutral expression in all photos</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 