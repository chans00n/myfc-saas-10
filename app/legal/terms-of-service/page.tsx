import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Terms of Service | My Facial Fitness",
  description: "Terms of service for My Facial Fitness application",
};

export default function TermsOfService() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:pt-16 md:pb-16">
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-8">
          <CardTitle className="text-3xl">Terms of Service</CardTitle>
          <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to My Facial Fitness. These terms and conditions outline the rules and regulations for the use of our website and services.
            </p>
            <p className="mb-4">
              By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use My Facial Fitness if you do not accept all of the terms and conditions stated on this page.
            </p>

            <h2 className="text-2xl font-semibold mb-4 mt-8">2. License to Use</h2>
            <p className="mb-4">
              Unless otherwise stated, My Facial Fitness and/or its licensors own the intellectual property rights for all material on the platform. All intellectual property rights are reserved.
            </p>
            <p className="mb-4">
              You may view and/or print pages from the platform for your own personal use subject to restrictions set in these terms and conditions.
            </p>
            <p className="mb-4">You must not:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Republish material from this platform</li>
              <li className="mb-2">Sell, rent or sub-license material from the platform</li>
              <li className="mb-2">Reproduce, duplicate or copy material from the platform</li>
              <li className="mb-2">Redistribute content from My Facial Fitness (unless content is specifically made for redistribution)</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4 mt-8">3. User Accounts</h2>
            <p className="mb-4">
              When you create an account with us, you guarantee that the information you provide is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the platform.
            </p>
            <p className="mb-4">
              You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password.
            </p>

            <h2 className="text-2xl font-semibold mb-4 mt-8">4. Subscriptions and Payments</h2>
            <p className="mb-4">
              Some parts of the service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis (such as monthly or annually), depending on the type of subscription plan you select when purchasing.
            </p>
            <p className="mb-4">
              At the end of each period, your subscription will automatically renew under the exact same conditions unless you cancel it or My Facial Fitness cancels it.
            </p>
            <p className="mb-4">
              You may cancel your subscription renewal either through your online account management page or by contacting customer support.
            </p>

            <h2 className="text-2xl font-semibold mb-4 mt-8">5. Content and Conduct</h2>
            <p className="mb-4">
              Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post on or through the service, including its legality, reliability, and appropriateness.
            </p>
            <p className="mb-4">
              By posting content on or through the service, you represent and warrant that: (i) the content is yours and/or you have the right to use it and the right to grant us the rights and license as provided in these Terms, and (ii) that the posting of your content on or through the service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person or entity.
            </p>

            <h2 className="text-2xl font-semibold mb-4 mt-8">6. Limitation of Liability</h2>
            <p className="mb-4">
              In no event shall My Facial Fitness, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
            </p>

            <h2 className="text-2xl font-semibold mb-4 mt-8">7. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>

            <h2 className="text-2xl font-semibold mb-4 mt-8">8. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="mb-8">
              <strong>Email:</strong> terms@myfacialfitness.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 