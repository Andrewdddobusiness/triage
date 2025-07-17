import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-bold text-foreground">Spaak</h3>
            <p className="mt-2 text-muted-foreground">Your personalised AI secretary.</p>
          </div>
          <div className="flex space-x-6">
            <Link href="/about" className="text-secondary-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/pricing" className="text-secondary-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/privacy" className="text-secondary-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-secondary-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/support" className="text-secondary-foreground hover:text-foreground transition-colors">
              Support & Contact
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} Spaak. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
