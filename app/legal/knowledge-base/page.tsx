import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export const metadata = {
  title: "Knowledge Base | MYFC",
  description: "Learn everything about facial fitness and how to use MYFC effectively",
};

interface Article {
  title: string;
  description: string;
  link: string;
}

interface Category {
  title: string;
  description: string;
  articles: Article[];
}

export default function KnowledgeBase() {
  const categories: Category[] = [
    {
      title: "Getting Started",
      description: "Essential information for new users",
      articles: [
        {
          title: "What is Facial Fitness?",
          description: "Learn about the science behind facial exercises and their benefits",
          link: "#facial-fitness"
        },
        {
          title: "Your First Workout",
          description: "How to prepare for and complete your first facial workout",
          link: "#first-workout"
        },
        {
          title: "Setting Up Your Profile",
          description: "Customize your experience and track your progress",
          link: "#profile-setup"
        }
      ]
    },
    {
      title: "Exercise Techniques",
      description: "Detailed guides for proper form and execution",
      articles: [
        {
          title: "Proper Form Guide",
          description: "Essential tips for maintaining proper form during exercises",
          link: "#proper-form"
        },
        {
          title: "Common Mistakes to Avoid",
          description: "Learn about typical mistakes and how to correct them",
          link: "#common-mistakes"
        },
        {
          title: "Advanced Techniques",
          description: "Take your facial fitness to the next level",
          link: "#advanced-techniques"
        }
      ]
    },
    {
      title: "Progress Tracking",
      description: "Make the most of MYFC's tracking features",
      articles: [
        {
          title: "Taking Progress Photos",
          description: "Guidelines for consistent and effective progress tracking",
          link: "#progress-photos"
        },
        {
          title: "Understanding Your Results",
          description: "How to interpret your progress and measurements",
          link: "#understanding-results"
        },
        {
          title: "Setting Realistic Goals",
          description: "Tips for creating achievable fitness milestones",
          link: "#setting-goals"
        }
      ]
    },
    {
      title: "Pro Tips & Best Practices",
      description: "Expert advice for optimal results",
      articles: [
        {
          title: "Creating a Routine",
          description: "Build a sustainable facial fitness routine",
          link: "#creating-routine"
        },
        {
          title: "Nutrition and Hydration",
          description: "How diet affects your facial fitness journey",
          link: "#nutrition"
        },
        {
          title: "Recovery and Rest",
          description: "The importance of proper recovery between workouts",
          link: "#recovery"
        }
      ]
    }
  ];

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:pt-16 md:pb-16">
      <div className="mb-8">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Learn everything about facial fitness</p>
            <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">Knowledge Base</h1>
          </div>

      <div className="space-y-12">
        {categories.map((category, categoryIndex) => (
          <div key={category.title}>
            {categoryIndex !== 0 && <Separator className="mb-12" />}
            
            <div className="mb-6">
              <h2 className="text-2xl text-neutral-800 dark:text-neutral-200 font-semibold mb-2">{category.title}</h2>
              <p className="text-neutral-600 dark:text-neutral-400">{category.description}</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {category.articles.map((article) => (
                <Link 
                  key={article.title} 
                  href={article.link}
                  className="block p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
                >
                  <h3 className="font-semibold text-lg mb-2 text-neutral-800 dark:text-neutral-200">
                    {article.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    {article.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 