import HomeLayout from "@/components/layout/home-layout";
import Link from "next/link";

export default function TermsPage() {
  return (
    <HomeLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex flex-col md:flex-row">
          {/* Main content */}
          <div className="md:w-3/4 pr-0 md:pr-8">
            <h1 className="text-4xl text-zinc-900 font-bold mb-2">Terms and Conditions</h1>
            <p className="text-sm text-zinc-500 mb-6">
              Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>

            <div className="mb-6">
              <Link
                href="#"
                className="inline-flex items-center px-3 py-1.5 bg-orange-500 text-white rounded-md text-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  />
                </svg>
                Save as PDF
              </Link>
            </div>

            <div className="prose max-w-none">
              <p className="text-zinc-600 mb-8">
                Welcome to Spaak. These Terms and Conditions ("Terms") govern your use of our AI secretary service and
                website. By accessing or using our service, you agree to be bound by these Terms. If you do not agree to
                these Terms, please do not use our service.
              </p>

              <section id="acceptance" className="mb-8">
                <h2 className="text-xl text-zinc-900 font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-zinc-600">
                  By creating an account or using Spaak's services, you acknowledge that you have read, understood, and
                  agree to be bound by these Terms and our Privacy Policy. These Terms constitute a legally binding
                  agreement between you and Spaak.
                </p>
              </section>

              <section id="service-description" className="mb-8">
                <h2 className="text-xl text-zinc-900 font-semibold mb-3">2. Service Description</h2>
                <p className="text-zinc-600 mb-4">
                  Spaak provides an AI-powered secretary service that handles missed calls, provides transcriptions, and
                  offers intelligent call management features. Our service includes:
                </p>
                <ul className="list-disc pl-6 text-zinc-600">
                  <li>Call answering and transcription services</li>
                  <li>AI-powered call summaries and insights</li>
                  <li>Email and SMS notifications</li>
                  <li>Dashboard for call management</li>
                  <li>Integration capabilities with third-party services</li>
                </ul>
              </section>

              <section id="user-accounts" className="mb-8">
                <h2 className="text-xl text-zinc-900 font-semibold mb-3">3. User Accounts and Registration</h2>
                <div className="mb-4">
                  <h3 className="text-lg text-zinc-900 font-medium mb-2">3.1 Account Creation</h3>
                  <p className="text-zinc-600">
                    To use our service, you must create an account by providing accurate and complete information. You
                    are responsible for maintaining the confidentiality of your account credentials.
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg text-zinc-900 font-medium mb-2">3.2 Account Security</h3>
                  <p className="text-zinc-600">
                    You are solely responsible for all activities that occur under your account. You must immediately
                    notify us of any unauthorized use of your account or any other breach of security.
                  </p>
                </div>
              </section>

              <section id="acceptable-use" className="mb-8">
                <h2 className="text-xl text-zinc-900 font-semibold mb-3">4. Acceptable Use Policy</h2>
                <p className="text-zinc-600 mb-4">You agree not to use our service to:</p>
                <ul className="list-disc pl-6 text-zinc-600">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon the rights of others</li>
                  <li>Transmit harmful, offensive, or inappropriate content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use the service for spam, phishing, or other malicious activities</li>
                  <li>Reverse engineer or attempt to extract source code</li>
                </ul>
              </section>

              <section id="subscription-billing" className="mb-8">
                <h2 className="text-xl text-zinc-900 font-semibold mb-3">5. Subscription and Billing</h2>
                <div className="mb-4">
                  <h3 className="text-lg text-zinc-900 font-medium mb-2">5.1 Subscription Plans</h3>
                  <p className="text-zinc-600">
                    We offer various subscription plans with different features and usage limits. Plan details and
                    pricing are available on our pricing page and may be updated from time to time.
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg text-zinc-900 font-medium mb-2">5.2 Payment Terms</h3>
                  <p className="text-zinc-600">
                    Subscription fees are billed in advance on a monthly basis. All fees are non-refundable except as
                    required by law or as specifically stated in these Terms.
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg text-zinc-900 font-medium mb-2">5.3 Cancellation</h3>
                  <p className="text-zinc-600">
                    You may cancel your subscription at any time. Cancellation will take effect at the end of your
                    current billing period. You will continue to have access to the service until the end of your paid
                    period.
                  </p>
                </div>
              </section>

              <section id="data-privacy" className="mb-8">
                <h2 className="text-xl text-zinc-900 font-semibold mb-3">6. Data and Privacy</h2>
                <p className="text-zinc-600">
                  Your privacy is important to us. Our collection, use, and protection of your personal information is
                  governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our
                  service, you consent to the collection and use of your information as described in our Privacy Policy.
                </p>
              </section>

              <section id="intellectual-property" className="mb-8">
                <h2 className="text-xl text-zinc-900 font-semibold mb-3">7. Intellectual Property</h2>
                <p className="text-zinc-600">
                  The Spaak service, including all content, features, and functionality, is owned by Spaak and is
                  protected by copyright, trademark, and other intellectual property laws. You may not copy, modify,
                  distribute, or create derivative works based on our service without our express written permission.
                </p>
              </section>

              <section id="limitation-liability" className="mb-8">
                <h2 className="text-xl text-zinc-900 font-semibold mb-3">8. Limitation of Liability</h2>
                <p className="text-zinc-600">
                  To the maximum extent permitted by law, Spaak shall not be liable for any indirect, incidental,
                  special, consequential, or punitive damages, including but not limited to loss of profits, data, or
                  other intangible losses, resulting from your use of the service.
                </p>
              </section>

              <section id="termination" className="mb-8">
                <h2 className="text-xl text-zinc-900 font-semibold mb-3">9. Termination</h2>
                <p className="text-zinc-600">
                  We may terminate or suspend your account and access to the service immediately, without prior notice,
                  if you breach these Terms. Upon termination, your right to use the service will cease immediately, and
                  we may delete your account and data.
                </p>
              </section>

              <section id="changes-terms" className="mb-8">
                <h2 className="text-xl text-zinc-900 font-semibold mb-3">10. Changes to Terms</h2>
                <p className="text-zinc-600">
                  We reserve the right to modify these Terms at any time. We will notify you of any material changes by
                  posting the new Terms on our website and updating the "Last updated" date. Your continued use of the
                  service after such changes constitutes acceptance of the new Terms.
                </p>
              </section>

              <section id="governing-law" className="mb-8">
                <h2 className="text-xl text-zinc-900 font-semibold mb-3">11. Governing Law</h2>
                <p className="text-zinc-600">
                  These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction],
                  without regard to its conflict of law provisions. Any disputes arising under these Terms shall be
                  subject to the exclusive jurisdiction of the courts.
                </p>
              </section>

              <section id="contact" className="mb-8">
                <h2 className="text-xl text-zinc-900 font-semibold mb-3">12. Contact Information</h2>
                <p className="text-zinc-600">
                  If you have any questions about these Terms, please contact us through our support page.
                </p>
              </section>
            </div>
          </div>

          {/* Table of Contents Sidebar */}
          <div className="md:w-1/4 mt-8 md:mt-0">
            <div className="sticky top-8">
              <h3 className="text-lg font-semibold mb-4 text-zinc-900">Table of Contents</h3>
              <nav className="space-y-2">
                <Link href="#acceptance" className="block text-sm text-zinc-600 hover:text-orange-500">
                  1. Acceptance of Terms
                </Link>
                <Link href="#service-description" className="block text-sm text-zinc-600 hover:text-orange-500">
                  2. Service Description
                </Link>
                <Link href="#user-accounts" className="block text-sm text-zinc-600 hover:text-orange-500">
                  3. User Accounts
                </Link>
                <Link href="#acceptable-use" className="block text-sm text-zinc-600 hover:text-orange-500">
                  4. Acceptable Use
                </Link>
                <Link href="#subscription-billing" className="block text-sm text-zinc-600 hover:text-orange-500">
                  5. Subscription & Billing
                </Link>
                <Link href="#data-privacy" className="block text-sm text-zinc-600 hover:text-orange-500">
                  6. Data & Privacy
                </Link>
                <Link href="#intellectual-property" className="block text-sm text-zinc-600 hover:text-orange-500">
                  7. Intellectual Property
                </Link>
                <Link href="#limitation-liability" className="block text-sm text-zinc-600 hover:text-orange-500">
                  8. Limitation of Liability
                </Link>
                <Link href="#termination" className="block text-sm text-zinc-600 hover:text-orange-500">
                  9. Termination
                </Link>
                <Link href="#changes-terms" className="block text-sm text-zinc-600 hover:text-orange-500">
                  10. Changes to Terms
                </Link>
                <Link href="#governing-law" className="block text-sm text-zinc-600 hover:text-orange-500">
                  11. Governing Law
                </Link>
                <Link href="#contact" className="block text-sm text-zinc-600 hover:text-orange-500">
                  12. Contact
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
