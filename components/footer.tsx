import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 bg-zinc-950 text-zinc-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-bold text-white">Spaak</h3>
            <p className="mt-2 text-zinc-400">Your personalised AI secretary.</p>
          </div>
          <div className="flex space-x-6">
            <Link href="/about" className="text-zinc-300 hover:text-white transition-colors">
              About
            </Link>

            <Link href="/pricing" className="text-zinc-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/privacy" className="text-zinc-300 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/support" className="text-zinc-300 hover:text-white transition-colors">
              Support & Contact
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-zinc-700 text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} Spaak. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
