import React from "react";
import Link from "next/link";
import Image from "next/image";
import HomeLayout from "@/components/layouts/home-layout";
import teamImage from "@/public/images/site-people.jpg";

export default function AboutPage() {
  return (
    <HomeLayout>
      {/* Hero Section with Gradient Circle on White Background */}
      <div className="relative bg-white py-20 overflow-hidden">
        {/* Gradient circle background */}
        <div className="absolute top-0 left-0 w-[600px] h-[300px] rounded-full bg-gradient-to-r from-[#ffb351] to-[#ffa2a3] opacity-80 blur-3xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-start gap-12">
            {/* Left column - About heading and intro */}
            <div className="lg:w-1/2">
              <h1 className="text-5xl font-bold text-[#495057] mb-6">About</h1>
              <p className="text-lg text-[#495057] mb-8">
                Get to know the team behind Spaak, and discover our commitment to helping tradies and service
                professionals never miss an opportunity through our AI-powered voice assistant.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Team Image with Overlapping Text Box */}
      <div className="relative">
        {/* Glassmorphism box that overlaps the image */}

        <div className="absolute top-0 left-0 right-0 md:left-auto md:w-1/2 lg:w-2/5 backdrop-blur-md bg-white/70 border border-white/20 p-8 rounded-lg shadow-lg z-10 -mt-20 mx-4 md:mx-8 lg:mx-12">
          <h1 className="text-3xl font-bold text-[#495057] mb-6">Who are we?</h1>
          <p className="text-[#495057] mb-6">
            We invite you to embark on a journey to discover how we're transforming the way tradies handle missed calls.
          </p>
          <p className="text-[#495057]">
            Our team adopts the mindset of problem-solvering and customer-first solutions united by a shared passion for
            innovation and excellence.
          </p>
        </div>

        <div className="w-full h-[500px] relative">
          <Image src={teamImage} alt="The Spaak team" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#495057] to-transparent opacity-80"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <div className="container mx-auto">
            <div className="max-w-3xl" />
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="py-16 bg-[#495057] text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to never miss a job opportunity?</h2>
          <p className="text-lg text-[#adb5bd] mb-8 max-w-2xl mx-auto">
            Join the growing community of trade professionals who rely on Spaak to capture leads while they focus on
            their craft.
          </p>
          <Link
            href="/sign-up"
            className="inline-block bg-[#ffb351] hover:bg-orange-500 text-white font-medium py-3 px-8 rounded-md transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </HomeLayout>
  );
}
