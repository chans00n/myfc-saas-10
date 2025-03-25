import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Privacy Policy | MYFC",
  description: "Privacy policy for MYFC application",
};

export default function PrivacyPolicy() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:pt-16 md:pb-16">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-4">
        Welcome to MYFC ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">2. Information We Collect</h2>

        <h2 className="text-2xl font-semibold mb-4 mt-8">2.1 Personal Information</h2>
        <p className="mb-4">
        We may collect personally identifiable information, such as:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">Identity Data includes first name, last name, username or similar identifier.</li>
          <li className="mb-2">Contact Data includes email address.</li>
          <li className="mb-2">Payment information (processed via Stripe)</li>
          <li className="mb-2">Technical Data includes internet protocol (IP) address, your login data, browser type and version.</li>
          <li className="mb-2">Profile Data includes your username and password, your interests, preferences, feedback and survey responses.</li>
          <li className="mb-2">Usage Data includes information about how you use our website and services.</li>
          <li className="mb-2">Facial Images includes photographs taken for progress tracking (only stored with your consent).</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 mt-8">2.2 Non-Personal Information</h2>
        <p className="mb-4">
        We may also collect non-personal information automatically when you visit our website. This information may include:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">IP address</li>
          <li className="mb-2">Browser and device type</li>
          <li className="mb-2">Operating system</li>
          <li className="mb-2">Referring URL</li>
          <li className="mb-2">Pages you view on our site</li>
          <li className="mb-2">Date and time</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 mt-8">3. How We Use Your Data</h2>
        <p className="mb-4">
          We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">Providing, operating, and maintaining our services</li>
          <li className="mb-2">Managing your account and subscription</li>
          <li className="mb-2">Processing payments via Stripe</li>
          <li className="mb-2">Sending you administrative emails</li>
          <li className="mb-2">Responding to comments, questions, and requests</li>
          <li className="mb-2">Improving our website and services</li>
          <li className="mb-2">Sending you marketing and promotional communications (with your consent)</li>
          <li className="mb-2">Analyzing usage patterns and trends</li>
          <li className="mb-2">Protecting against, identifying, and preventing fraud and other illegal activities</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 mt-8">4. Disclosure of Your Information</h2>
        <p className="mb-4">
        We may share your information with:
        </p>

        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2"><b>Service Providers:</b> Third-party vendors (like Stripe) who provide services on our behalf</li>
          <li className="mb-2"><b>Business Transfers:</b> In connection with any merger, sale of company assets, financing, or acquisition</li>
          <li className="mb-2"><b>Legal Requirements:</b> When required to comply with applicable laws and regulations</li>
          <li className="mb-2"><b>Protection:</b> To protect the rights, property, or safety of our company, users, or others</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 mt-8">5. Data Security</h2>
        <p className="mb-4">
        We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">6. Third-Party Services</h2>
        <p className="mb-4">
        Our service may contain links to third-party websites or services. We are not responsible for the content or privacy practices of these third parties. This includes Stripe, which processes payments for our services. We encourage you to read their privacy policies.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">7. Your Legal Rights</h2>
        <p className="mb-4">
        Depending on your location, you may have certain rights regarding your personal information, including:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li className="mb-2">Access to your personal data</li>
          <li className="mb-2">Correction of inaccurate data</li>
          <li className="mb-2">Deletion of your data</li>
          <li className="mb-2">Restriction of processing</li>
          <li className="mb-2">Data portability</li>
          <li className="mb-2">Objection to processing</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 mt-8">8. Children's Privacy</h2>
        <p className="mb-4">
        Our services are not directed to individuals under the age of 13 (or the applicable age in your jurisdiction). We do not knowingly collect personal information from children.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">9. Changes to This Privacy Policy</h2>
        <p className="mb-4">
        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">10. Contact Us</h2>
        <p className="mb-4">
        If you have any questions about this Privacy Policy, please contact us at:
        </p>
        <p className="mb-8">
          <strong>Email:</strong> <a href="mailto:hello@myfc.app">hello@myfc.app</a>
        </p>
      </div>
    </div>
  );
} 