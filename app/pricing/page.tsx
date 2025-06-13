import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import HomeLayout from "@/components/layouts/home-layout";

export default function PricingPage() {
  return (
    <HomeLayout>
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full mb-4 border border-orange-500">
              <span className="h-2 w-2 rounded-full bg-orange-500"></span>
              <span className="text-sm font-medium text-gray-800">Pricing</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Flexible pricing plans
              <br />
              for every need
            </h1>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Find the perfect plan—whether you're starting out or scaling up with advanced tools and premium support.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="p-6">
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-1 text-gray-900">Free</h2>
                <div className="bg-gray-100 text-xs font-medium text-gray-700 px-2 py-1 rounded inline-block mb-4">
                  Started Plan
                </div>
                <p className="text-gray-700 text-sm mb-4">
                  Start with the basics and experience our AI secretary with limited features.
                </p>
                <div className="flex items-baseline mb-1">
                  <span className="text-3xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600 ml-1">/ month</span>
                </div>
                <p className="text-xs text-gray-600 mb-6">Pause and cancel anytime.</p>
                <Button disabled className="w-full bg-gray-800 hover:bg-gray-700">
                  Coming Soon
                </Button>
              </div>
              <div className="border-t border-gray-100 p-6">
                <h3 className="font-medium mb-4 text-gray-900">Free plan includes:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    <span className="text-sm text-gray-800">10 calls per month</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    <span className="text-sm text-gray-800">Limited AI follow-ups</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    <span className="text-sm text-gray-800">Basic dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    <span className="text-sm text-gray-800">Community support</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border-2 border-orange-500">
              <div className="p-6">
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-1 text-gray-900">Pro</h2>
                <div className="bg-orange-100 text-xs font-medium text-orange-900 px-2 py-1 rounded inline-block mb-4">
                  Popular Plan
                </div>
                <p className="text-gray-700 text-sm mb-4">
                  Perfect for professionals who need reliable call handling and detailed records.
                </p>
                <div className="flex items-baseline mb-1">
                  <span className="text-3xl font-bold text-gray-900">$49</span>
                  <span className="text-gray-600 ml-1">/ month</span>
                </div>
                <p className="text-xs text-gray-600 mb-6">Pause and cancel anytime.</p>
                <Button disabled className="w-full bg-orange-500 hover:bg-orange-600">
                  Coming Soon
                </Button>
              </div>
              <div className="border-t border-gray-100 p-6">
                <h3 className="font-medium mb-4 text-gray-900">Pro plan includes:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    <span className="text-sm text-gray-800">100 calls per month</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    <span className="text-sm text-gray-800">Full transcription</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    <span className="text-sm text-gray-800">Complete call history</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    <span className="text-sm text-gray-800">AI-powered insights</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    <span className="text-sm text-gray-800">Priority support</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Elite Plan */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="p-6">
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-1 text-gray-900">Elite</h2>
                <div className="bg-gray-100 text-xs font-medium text-gray-700 px-2 py-1 rounded inline-block mb-4">
                  Enterprise Plan
                </div>
                <p className="text-gray-700 text-sm mb-4">
                  For teams that need custom solutions and dedicated support.
                </p>
                <div className="flex items-baseline mb-1">
                  <span className="text-3xl font-bold text-gray-900">$99</span>
                  <span className="text-gray-600 ml-1">/ month</span>
                </div>
                <p className="text-xs text-gray-600 mb-6">Pause and cancel anytime.</p>
                <Button disabled className="w-full bg-gray-800 hover:bg-gray-700">
                  Coming Soon
                </Button>
              </div>
              <div className="border-t border-gray-100 p-6">
                <h3 className="font-medium mb-4 text-gray-900">Elite plan includes:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    <span className="text-sm text-gray-800">Unlimited calls</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    <span className="text-sm text-gray-800">Team access</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    <span className="text-sm text-gray-800">Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    <span className="text-sm text-gray-800">Custom integrations</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    <span className="text-sm text-gray-800">Dedicated account manager</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold mb-2 text-gray-900">Can I change plans later?</h3>
                <p className="text-gray-700 text-sm">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next
                  billing cycle.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold mb-2 text-gray-900">Is there a contract or commitment?</h3>
                <p className="text-gray-700 text-sm">
                  No, all plans are month-to-month with no long-term commitment. You can cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
