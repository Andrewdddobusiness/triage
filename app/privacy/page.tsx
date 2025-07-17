import React from "react";
import HomeLayout from "@/components/layout/home-layout";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <HomeLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex flex-col md:flex-row">
          {/* Main content */}
          <div className="md:w-3/4 pr-0 md:pr-8">
            <h1 className="text-4xl text-zinc-900 font-bold mb-2">Privacy Policy</h1>
            <p className="text-sm text-zinc-500 mb-6">Last updated: May 19, 2025</p>

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
                At Spaak ("we", "us", "our"), we take your privacy seriously and are committed to protecting your
                personal information. This Privacy Policy explains how we collect, use, and protect the information we
                collect from you when you use our services. By using our services, you agree to the collection and use
                of information in accordance with this policy. Please read it carefully to understand how we handle your
                information.
              </p>

              <section id="introduction" className="mb-8">
                <h2 className="text-xl text-zinc-900 font-semibold mb-3">1. Introduction</h2>
                <p className="text-zinc-600">
                  Spaak is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and
                  protect your data when you use our app.
                </p>
              </section>

              <section id="information-we-collect" className="mb-8">
                <h2 className="text-xl text-zinc-900 font-semibold mb-3">2. Information We Collect</h2>
                <div id="personal-data" className="mb-4">
                  <h3 className="text-lg text-zinc-900 font-medium mb-2">2.1 Personal Data</h3>
                  <p className="text-zinc-600 mb-2">We may collect the following data:</p>
                  <ul className="list-disc pl-6 text-zinc-600">
                    <li>Name and contact info (e.g. from missed call transcription)</li>
                    <li>Audio recordings of missed calls (if enabled)</li>
                    <li>Usage data (for analytics)</li>
                    <li>Email address (for summaries or notifications)</li>
                  </ul>
                </div>

                <div id="non-personal-data" className="mb-4">
                  <h3 className="text-lg text-zinc-900 font-medium mb-2">2.2 Non-Personal Data</h3>
                  <p className="text-zinc-600">
                    We also collect non-personal information such as device type, browser information, and usage
                    patterns to improve our service and user experience.
                  </p>
                </div>
              </section>

              <section id="how-we-use" className="mb-8">
                <h2 className="text-xl text-zinc-900 font-semibold mb-3">3. How We Use Your Information</h2>
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">3.1 Personal Data</h3>
                  <p className="text-zinc-600 mb-2">We use your data to:</p>
                  <ul className="list-disc pl-6 text-zinc-600">
                    <li>Transcribe and summarize missed calls</li>
                    <li>Notify you via email or SMS</li>
                    <li>Improve our AI assistant's accuracy</li>
                    <li>Provide customer support</li>
                  </ul>
                </div>
              </section>

              <section id="data-sharing" className="mb-8">
                <h2 className="text-xl text-zinc-900 font-semibold mb-3">4. Data Sharing</h2>
                <p className="text-zinc-600 mb-2">We do not sell your data. We may share data with:</p>
                <ul className="list-disc pl-6 text-zinc-600">
                  <li>Trusted service providers (e.g., for transcription, email delivery)</li>
                  <li>Law enforcement (only if legally required)</li>
                </ul>
              </section>

              <section id="security" className="mb-8">
                <h2 className="text-xl text-zinc-900 font-semibold mb-3">5. Security</h2>
                <p className="text-zinc-600">
                  We use encryption and secure storage to protect your data. Access is limited to authorized personnel
                  only.
                </p>
              </section>

              <section id="your-rights" className="mb-8">
                <h2 className="text-xl text-zinc-900font-semibold mb-3">6. Your Rights</h2>
                <p className="text-zinc-600 mb-2">You may:</p>
                <ul className="list-disc pl-6 text-zinc-600 mb-2">
                  <li>Request access to your data</li>
                  <li>Request deletion of your data</li>
                  <li>Opt out of analytics tracking</li>
                </ul>
                {/* <p className="text-zinc-600">
                  To exercise these rights, contact us at:{" "}
                  <a href="mailto:privacy@spaak.app" className="text-blue-600 hover:underline">
                    privacy@spaak.app
                  </a>
                </p> */}
              </section>

              <section id="changes" className="mb-8">
                <h2 className="text-xl text-zinc-900 font-semibold mb-3">7. Changes to This Policy</h2>
                <p className="text-zinc-600">
                  We may update this Privacy Policy. We'll notify you of significant changes via email or in-app.
                </p>
              </section>

              {/* <section id="contact" className="mb-8">
                <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
                <p className="text-zinc-600">
                  For questions about this policy, email{" "}
                  <a href="mailto:privacy@spaak.app" className="text-blue-600 hover:underline">
                    privacy@spaak.app
                  </a>
                </p>
              </section> */}
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:w-1/4 mt-8 md:mt-0">
            <div className="bg-zinc-50 p-4 rounded-md sticky top-24">
              <h3 className="text-sm font-semibold text-zinc-500 uppercase mb-3">Table of Contents</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#introduction" className="text-zinc-600 hover:text-orange-500">
                    1. Introduction
                  </Link>
                </li>
                <li>
                  <Link href="#information-we-collect" className="text-zinc-600 hover:text-orange-500">
                    2. Information We Collect
                  </Link>
                </li>
                <li className="pl-4">
                  <Link href="#personal-data" className="text-zinc-600 hover:text-orange-500">
                    2.1 Personal Data
                  </Link>
                </li>
                <li className="pl-4">
                  <Link href="#non-personal-data" className="text-zinc-600 hover:text-orange-500">
                    2.2 Non-Personal Data
                  </Link>
                </li>
                <li>
                  <Link href="#how-we-use" className="text-zinc-600 hover:text-orange-500">
                    3. How We Use Your Information
                  </Link>
                </li>
                <li>
                  <Link href="#data-sharing" className="text-zinc-600 hover:text-orange-500">
                    4. Data Sharing
                  </Link>
                </li>
                <li>
                  <Link href="#security" className="text-zinc-600 hover:text-orange-500">
                    5. Security
                  </Link>
                </li>
                <li>
                  <Link href="#your-rights" className="text-zinc-600 hover:text-orange-500">
                    6. Your Rights
                  </Link>
                </li>
                <li>
                  <Link href="#changes" className="text-zinc-600 hover:text-orange-500">
                    7. Changes to This Policy
                  </Link>
                </li>
                {/* <li>
                  <Link href="#contact" className="text-zinc-600 hover:text-orange-500">
                    8. Contact Us
                  </Link>
                </li> */}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
