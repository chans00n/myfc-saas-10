import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Privacy Policy | My Facial Fitness",
  description: "Privacy policy for My Facial Fitness application",
};

export default function PrivacyPolicy() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:pt-16 md:pb-16">
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-8">
          <CardTitle className="text-3xl">Privacy Policy</CardTitle>
          <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to My Facial Fitness. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our website
              and tell you about your privacy rights and how the law protects you.
            </p>

            <h2 className="text-2xl font-semibold mb-4 mt-8">2. The Data We Collect</h2>
            <p className="mb-4">
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Identity Data includes first name, last name, username or similar identifier.</li>
              <li className="mb-2">Contact Data includes email address.</li>
              <li className="mb-2">Technical Data includes internet protocol (IP) address, your login data, browser type and version.</li>
              <li className="mb-2">Profile Data includes your username and password, your interests, preferences, feedback and survey responses.</li>
              <li className="mb-2">Usage Data includes information about how you use our website and services.</li>
              <li className="mb-2">Facial Images includes photographs taken for progress tracking (only stored with your consent).</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4 mt-8">3. How We Use Your Data</h2>
            <p className="mb-4">
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Where we need to perform the contract we are about to enter into or have entered into with you.</li>
              <li className="mb-2">Where it is necessary for our legitimate interests and your interests and fundamental rights do not override those interests.</li>
              <li className="mb-2">Where we need to comply with a legal obligation.</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4 mt-8">4. Data Security</h2>
            <p className="mb-4">
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>

            <h2 className="text-2xl font-semibold mb-4 mt-8">5. Your Legal Rights</h2>
            <p className="mb-4">
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Request access to your personal data.</li>
              <li className="mb-2">Request correction of your personal data.</li>
              <li className="mb-2">Request erasure of your personal data.</li>
              <li className="mb-2">Object to processing of your personal data.</li>
              <li className="mb-2">Request restriction of processing your personal data.</li>
              <li className="mb-2">Request transfer of your personal data.</li>
              <li className="mb-2">Right to withdraw consent.</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4 mt-8">6. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
            </p>
            <p className="mb-8">
              <strong>Email:</strong> privacy@myfacialfitness.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 