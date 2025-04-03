// app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { CalendarIcon, ZapIcon, BarChartIcon, Users2Icon, BrainCircuitIcon } from "lucide-react";
import Navbar from "@/components/navigation/navigation";
import dashboard from "@/public/images/dashboard.png";
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-50 to-orange-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">Powerful Features</h1>
              <p className="mt-4 text-lg text-gray-700 max-w-2xl">
                Discover how Triage simplifies construction inquiries with smart features designed to save time and
                improve productivity.
              </p>
              <div className="mt-8">
                <Link
                  href="/sign-up"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-md inline-flex items-center transition duration-150 ease-in-out"
                >
                  Get Started
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative h-64 sm:h-80 lg:h-96 w-full">
                <Image
                  src={dashboard}
                  alt="BuildTriage Dashboard"
                  fill
                  className="object-cover rounded-lg shadow-xl p-2 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      {/* <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
    
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="h-48 bg-orange-50 rounded-md flex items-center justify-center mb-6">
                  <Image
                    src="/transcription-icon.svg"
                    alt="Live Transcription"
                    width={120}
                    height={120}
                    className="opacity-80"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Live Transcription</h3>
                <p className="text-gray-600">
                  Get real-time transcriptions during meetings, making note-taking a thing of the past.
                </p>
              </div>
            </div>

         
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="h-48 bg-orange-50 rounded-md flex items-center justify-center mb-6">
                  <Image
                    src="/playback-icon.svg"
                    alt="Meeting Playback"
                    width={120}
                    height={120}
                    className="opacity-80"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Meeting Playback</h3>
                <p className="text-gray-600">
                  Revisit recordings with timestamps for key moments to extract and easily review all discussions.
                </p>
              </div>
            </div>

            
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="h-48 bg-orange-50 rounded-md flex items-center justify-center mb-6">
                  <Image
                    src="/whiteboard-icon.svg"
                    alt="Interactive Whiteboard"
                    width={120}
                    height={120}
                    className="opacity-80"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Interactive Whiteboard</h3>
                <p className="text-gray-600">
                  Collaborate visually with in-meeting sketches and annotations for better planning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* How You Collaborate Section */}
      {/* <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2">
              <div className="relative h-96 w-full">
                <Image
                  src="/collaboration-screenshot.jpg"
                  alt="Collaboration Features"
                  fill
                  className="object-cover rounded-lg shadow-xl"
                />
              </div>
            </div>

            <div className="lg:w-1/2 lg:pl-12 mb-10 lg:mb-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">How You Collaborate</h2>
              <p className="text-lg text-gray-600 mb-8">
                Intuitive experiences built with groundbreaking features transform your workflow, making it effortless.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-pink-500 rounded-md p-2 mr-4">
                    <BrainCircuitIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">AI-Powered Insights</h3>
                    <p className="mt-1 text-gray-600">
                      Get real-time action items, summaries, and key takeaways instantly with our advanced AI tools.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-amber-500 rounded-md p-2 mr-4">
                    <Users2Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Virtual Breakout Rooms</h3>
                    <p className="mt-1 text-gray-600">
                      Split participants into smaller groups for focused discussions without scheduling separate
                      meetings.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-2 mr-4">
                    <CalendarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Custom Meeting Themes</h3>
                    <p className="mt-1 text-gray-600">
                      Personalize the look and feel of your meetings to match your team's branding.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Flexible Across All Devices */}
      {/* <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Flexible Across All Devices</h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Access your construction management tools wherever you are, on any device.
          </p>

          <div className="relative h-64 sm:h-96 w-full max-w-4xl mx-auto">
            <Image
              src="/multi-device-mockup.jpg"
              alt="BuildTriage on multiple devices"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </section> */}

      {/* Call to Action Section */}
      <section className="py-16 bg-orange-500 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to streamline your construction inquiries?</h2>
          <p className="text-xl mb-8 opacity-90">
            Discover how BuildTriage can transform the way you handle construction projects.
          </p>
          <Link
            href="/demo"
            className="bg-white text-orange-500 hover:bg-gray-100 font-medium py-3 px-8 rounded-md inline-flex items-center transition duration-150 ease-in-out"
          >
            Request a Demo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-800 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-white">BuildTriage</h3>
              <p className="mt-2 text-gray-400">Streamlining construction management.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                About
              </Link>
              <Link href="/features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} BuildTriage. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
