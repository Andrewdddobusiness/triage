// app/(home-pages)/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CalendarIcon,
  ZapIcon,
  BarChartIcon,
  Users2Icon,
  BrainCircuitIcon,
  PhoneIcon,
  ClipboardCheckIcon,
  ClockIcon,
} from "lucide-react";
import dashboard from "@/public/images/dashboard.png";
import HomeLayout from "@/components/layout/home-layout";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/sign-up');
    }
  };

  return (
    <HomeLayout>
      {/* Hero Section */}
      <section className="bg-background py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
                Never miss a lead with your <span className="text-primary">AI receptionist</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                Spaak is an AI-powered voice assistant designed for tradies and service professionals who can't always
                answer their phone. When a call is missed, Spaak steps in.
              </p>
              <div className="mt-8">
                <Button 
                  onClick={handleGetStarted}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-md"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
                </Button>
                {/* <Link href="/demo" passHref>
                  <Button variant="outline" className="ml-4 border-primary text-primary hover:bg-primary/10">
                    Schedule a call
                  </Button>
                </Link> */}
              </div>
            </div>
            <div className="w-full lg:w-1/2 justify-center items-center flex">
              <div className="relative w-full max-w-lg">
                <Image
                  src={dashboard}
                  alt="Spaak Dashboard"
                  width={600}
                  height={400}
                  className="object-cover rounded-lg shadow-xl p-2 bg-background"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center text-foreground">How Spaak Works?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-muted p-6 rounded-lg text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                <PhoneIcon className="h-8 w-8 text-[#ffb351]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Missed Call</h3>
              <p className="text-muted-foreground">When you can't answer, Spaak automatically steps in to handle the call.</p>
            </div>
            <div className="bg-muted p-6 rounded-lg text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ffdacb] flex items-center justify-center">
                <ClipboardCheckIcon className="h-8 w-8 text-[#fe885a]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Capture Details</h3>
              <p className="text-muted-foreground">
                Spaak collects caller details, project needs, and preferred contact times.
              </p>
            </div>
            <div className="bg-muted p-6 rounded-lg text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#ffddde] flex items-center justify-center">
                <ClockIcon className="h-8 w-8 text-[#ffa2a3]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">Ready Summary</h3>
              <p className="text-muted-foreground">A complete summary is sent to your dashboard, ready for follow-up.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-primary text-center">Perfect for...</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="bg-background rounded-lg shadow-sm h-48 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60 z-10"></div>
              <Image src="/images/home/electrician.jpg" alt="Electrician" fill className="object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <h3 className="text-xl font-semibold text-white text-center">Electricians</h3>
              </div>
            </div>

            <div className="bg-background rounded-lg shadow-sm h-48 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60 z-10"></div>
              <Image src="/images/home/plumber.jpg" alt="Plumber" fill className="object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <h3 className="text-xl font-semibold text-white text-center">Plumbers</h3>
              </div>
            </div>

            <div className="bg-background rounded-lg shadow-sm h-48 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60 z-10"></div>
              <Image src="/images/home/carpenter.jpg" alt="Carpenter" fill className="object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <h3 className="text-xl font-semibold text-white text-center">Carpenters</h3>
              </div>
            </div>

            <div className="bg-background rounded-lg shadow-sm h-48 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60 z-10"></div>
              <Image src="/images/home/construction.jpg" alt="Construction" fill className="object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <h3 className="text-xl font-semibold text-white text-center">Construction</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      {/* <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Spaak saves you time!</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="border border-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Never Miss a Lead</h3>
              <p className="text-gray-600">
                Capture every potential job opportunity, even when you're unable to answer the phone.
              </p>
            </div>
            <div className="border border-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Reduce Admin Work</h3>
              <p className="text-gray-600">
                Detailed call summaries eliminate the need for manual note-taking and follow-up organization.
              </p>
            </div>
            <div className="border border-gray-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Hands-Free Setup</h3>
              <p className="text-gray-600">
                Simple configuration that works right out of the box — no technical expertise required.
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Call to Action Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to never miss a job opportunity?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join the growing community of trade professionals who rely on Spaak to capture leads while they focus on
            their craft.
          </p>
          <Button 
            onClick={handleGetStarted}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium py-3 px-8 rounded-md"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
          </Button>
        </div>
      </section>
    </HomeLayout>
  );
}
