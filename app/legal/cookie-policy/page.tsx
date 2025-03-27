import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy | MYFC',
  description: 'Learn about how MYFC uses cookies and tracking technologies.',
}

export default function CookiePolicy() {
  return (
    <div className="container max-w-7xl py-12">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border bg-neutral-100/95 dark:bg-neutral-900/95 p-8 backdrop-blur supports-[backdrop-filter]:bg-neutral-100/80 dark:supports-[backdrop-filter]:bg-neutral-900/80">
          <div className="prose prose-gray dark:prose-invert">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-200">Cookie Policy</h1>
            <p className="text-muted-foreground text-neutral-900 dark:text-neutral-200">Last updated: {new Date().toLocaleDateString()}</p>

            <h2 className="mt-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-200">What are cookies?</h2>
            <p className="text-neutral-900 dark:text-neutral-200">
              Cookies are small text files that are stored on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences, 
              analyzing how you use our service, and helping with our marketing efforts.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-200">How we use cookies</h2>
            <p className="text-neutral-900 dark:text-neutral-200">We use different types of cookies for different purposes:</p>

            <div className="mt-6 space-y-8">
              <section>
                <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-200">Essential Cookies</h3>
                <p className="mt-2 text-muted-foreground text-neutral-900 dark:text-neutral-200">
                  These cookies are necessary for the website to function properly. They enable core 
                  functionality such as security, account authentication, and remembering your preferences. 
                  You cannot disable these cookies through our consent management system.
                </p>
                <ul className="mt-3 list-disc pl-6 text-muted-foreground text-neutral-900 dark:text-neutral-200">
                  <li>Authentication status</li>
                  <li>Security tokens</li>
                  <li>Session management</li>
                  <li>Load balancing</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-200">Analytics Cookies</h3>
                <p className="mt-2 text-muted-foreground text-neutral-900 dark:text-neutral-200">
                  These cookies help us understand how visitors interact with our website. The information 
                  collected is used to improve our service and user experience.
                </p>
                <ul className="mt-3 list-disc pl-6 text-muted-foreground text-neutral-900 dark:text-neutral-200">
                  <li>Google Analytics</li>
                  <li>Usage patterns</li>
                  <li>Performance metrics</li>
                  <li>Error tracking</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-200">Marketing Cookies</h3>
                <p className="mt-2 text-muted-foreground text-neutral-900 dark:text-neutral-200">
                  These cookies are used to track visitors across websites. The intention is to display ads 
                  that are relevant and engaging for individual users.
                </p>
                <ul className="mt-3 list-disc pl-6 text-muted-foreground text-neutral-900 dark:text-neutral-200">
                  <li>Advertising effectiveness</li>
                  <li>Marketing campaign tracking</li>
                  <li>User journey analysis</li>
                  <li>Personalized recommendations</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-200">Preference Cookies</h3>
                <p className="mt-2 text-muted-foreground text-neutral-900 dark:text-neutral-200">
                  These cookies remember your settings and preferences to enhance your experience on future visits.
                </p>
                <ul className="mt-3 list-disc pl-6 text-muted-foreground text-neutral-900 dark:text-neutral-200">
                  <li>Language preferences</li>
                  <li>Theme settings</li>
                  <li>Regional preferences</li>
                  <li>Customized layouts</li>
                </ul>
              </section>
            </div>

            <h2 className="mt-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-200">Managing Your Cookie Preferences</h2>
            <p className="text-muted-foreground text-neutral-900 dark:text-neutral-200">
              You can manage your cookie preferences at any time by clicking the "Cookie Settings" 
              button in the cookie banner or footer. You can also clear cookies through your browser 
              settings, although this may impact your experience on our and other websites.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-200">Third-Party Cookies</h2>
            <p className="text-muted-foreground text-neutral-900 dark:text-neutral-200">
              Some of our pages include content from third-party services. These services may set their 
              own cookies and have their own cookie policies. We recommend reviewing their specific 
              privacy and cookie policies for more information.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-200">Updates to This Policy</h2>
            <p className="text-muted-foreground text-neutral-900 dark:text-neutral-200">
              We may update this Cookie Policy from time to time to reflect changes in technology, 
              legislation, or our data practices. When we make material changes to this policy, we 
              will notify you through our website or via email.
            </p>

            <h2 className="mt-8 text-2xl font-semibold text-neutral-900 dark:text-neutral-200">Contact Us</h2>
            <p className="text-muted-foreground text-neutral-900 dark:text-neutral-200">
              If you have any questions about our use of cookies, please contact us at{' '}
              <a href="mailto:privacy@myfc.app" className="text-primary hover:underline">
                privacy@myfc.app
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 