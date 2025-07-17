"use client";

import React, { useState } from "react";
import Link from "next/link";
import HomeLayout from "@/components/layout/home-layout";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
  // Add this state to control visibility of the Coming Soon section
  const [showComingSoon] = useState(true); // Set to true when you want to display it

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !message) {
      setSubmitStatus({
        success: false,
        message: "Please provide your email and a message.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Here we would typically use an API route to handle the email sending
      // For now, we'll simulate the API call
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "andrew@1spaak.com",
          subject: `Contact form submission - ${category || "General inquiry"}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${email}</p>
            <p><strong>Category:</strong> ${category || "Not specified"}</p>
            <p><strong>Message:</strong> ${message}</p>
          `,
          from: "onboarding@resend.dev", // Use Resend's default domain
        }),
      });

      if (response.ok) {
        setSubmitStatus({
          success: true,
          message: "Your message has been sent successfully!",
        });
        // Reset form
        setEmail("");
        setMessage("");
        setCategory("");
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: "There was an error sending your message. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <HomeLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {!showComingSoon && (
          <>
            <h1 className="text-4xl font-bold mb-8 text-gray-700">Contact Us</h1>
            <div className="gap-12">
              {/* Left Column - Contact Form */}
              <div>
                <p className="text-gray-600 mb-6">
                  Using Spaak?{" "}
                  <Link href="/sign-in" className="text-blue-600 hover:underline">
                    Sign in
                  </Link>{" "}
                  so we can see contact you for support. If that's not possible, send us your request manually.
                </p>

                {submitStatus.message && (
                  <div
                    className={`p-4 mb-6 rounded-md ${submitStatus.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {submitStatus.message}
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`border rounded-md p-3 text-center cursor-pointer ${category === "billing" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-500"}`}
                      onClick={() => handleCategorySelect("billing")}
                    >
                      <p className="text-sm font-medium">Billing & plans</p>
                    </div>
                    <div
                      className={`border rounded-md p-3 text-center cursor-pointer ${category === "connections" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-500"}`}
                      onClick={() => handleCategorySelect("connections")}
                    >
                      <p className="text-sm font-medium">Connections</p>
                    </div>
                    <div
                      className={`border rounded-md p-3 text-center cursor-pointer ${category === "notifications" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-500"}`}
                      onClick={() => handleCategorySelect("notifications")}
                    >
                      <p className="text-sm font-medium">Notifications</p>
                    </div>
                    <div
                      className={`border rounded-md p-3 text-center cursor-pointer ${category === "other" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-500"}`}
                      onClick={() => handleCategorySelect("other")}
                    >
                      <p className="text-sm font-medium">Other</p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Can't find above? Tell us better:
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Describe your issue"
                      required
                    ></textarea>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : "Send your request"}
                  </Button>
                </form>
              </div>
            </div>
          </>
        )}

        {/* Coming Soon Section - Toggle visibility with the showComingSoon state */}
        {showComingSoon && (
          <div className="mt-16 bg-gradient-to-r from-orange-50 to-amber-50 p-8 rounded-lg border border-orange-200">
            <div className="flex items-center mb-4">
              <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mr-3">
                COMING SOON
              </span>
              <h2 className="text-2xl font-bold text-gray-800">Contact Form</h2>
            </div>

            <p className="text-gray-600 mb-6">
              We're currently working on improving our contact form to better serve your needs. Soon you'll be able to
              submit your inquiries more efficiently and track your support requests.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="font-medium text-gray-800 mb-2">Easy Submission</h3>
                <p className="text-sm text-gray-600">Submit your inquiries with our streamlined contact form.</p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="font-medium text-gray-800 mb-2">Request Tracking</h3>
                <p className="text-sm text-gray-600">Follow the status of your support requests in real-time.</p>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="font-medium text-gray-800 mb-2">Quick Resolution</h3>
                <p className="text-sm text-gray-600">Get faster responses to your support needs.</p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-md" disabled>
                Join the Waitlist
              </Button>
            </div>
          </div>
        )}

        {/* Support Help Categories */}
        {/* <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Need help with something?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: "Billing & Plans", icon: "💳", desc: "Questions about pricing or invoices" },
              { title: "Connections", icon: "🔌", desc: "Issues with integrations or data syncing" },
              { title: "Notifications", icon: "🔔", desc: "Missed alerts or settings confusion" },
              { title: "Other", icon: "❓", desc: "Anything else you can't find" },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div> */}

        {/* Mini FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I change my billing plan later?",
                a: "Yes! You can manage your billing plan from your account settings at any time.",
              },
              {
                q: "Why am I not getting notifications?",
                a: "Make sure you've enabled them in your preferences, and check your spam folder just in case.",
              },
            ].map((item, i) => (
              <details
                key={i}
                className="group border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-sm transition"
              >
                <summary className="text-gray-800 font-medium group-open:text-orange-600 flex justify-between items-center">
                  {item.q}
                  <span className="ml-2 text-orange-500 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-2 text-sm text-gray-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
