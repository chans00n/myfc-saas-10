import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, FileText, History, Shield } from "lucide-react";

export const metadata = {
  title: "Legal Information | My Facial Fitness",
  description: "Legal information and policy documents for My Facial Fitness",
};

export default function LegalHub() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:pt-16 md:pb-16">
      <Card className="shadow-sm mb-8">
        <CardHeader>
          <CardTitle className="text-3xl">Legal Information</CardTitle>
          <p className="text-muted-foreground mt-2">
            Important legal documents and information about My Facial Fitness
          </p>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Link 
          href="/legal/privacy-policy"
          className="block"
        >
          <Card className="h-full transition-all hover:shadow-md">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mb-2 text-xl">Privacy Policy</CardTitle>
              <p className="mb-4 text-muted-foreground">
                Learn how we collect, use, and protect your personal information
              </p>
              <div className="flex items-center text-primary">
                Read Privacy Policy <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link 
          href="/legal/terms-of-service"
          className="block"
        >
          <Card className="h-full transition-all hover:shadow-md">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mb-2 text-xl">Terms of Service</CardTitle>
              <p className="mb-4 text-muted-foreground">
                The rules and guidelines for using My Facial Fitness
              </p>
              <div className="flex items-center text-primary">
                Read Terms of Service <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link 
          href="/legal/changelog"
          className="block"
        >
          <Card className="h-full transition-all hover:shadow-md">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <History className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mb-2 text-xl">Changelog</CardTitle>
              <p className="mb-4 text-muted-foreground">
                Track all updates and improvements to the platform
              </p>
              <div className="flex items-center text-primary">
                View Changelog <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
} 