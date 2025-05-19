"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";

const SpaakLogo = "/logos/logo-color.png";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // Add scroll event listener to detect when user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Add event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "backdrop-blur-lg bg-white/30 shadow" : "bg-transparent"
      }`}
    >
      <nav className="border-gray-200">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <Image src={SpaakLogo} alt="Spaak Logo" width={32} height={32} className="text-orange-500" />
            <h2 className="text-xl font-bold text-gray-800">Spaak</h2>
          </Link>
          <button
            onClick={toggleMenu}
            data-collapse-toggle="navbar-default"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-default"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
          <div id="navbar-default" className={`${isMenuOpen ? "block" : "hidden"} w-full md:block md:w-auto`}>
            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <div className="flex items-center space-x-4 flex-1 justify-end">
                <Link href="/sign-in" passHref legacyBehavior>
                  <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                    Sign In
                  </Button>
                </Link>

                <Link href="/sign-up" passHref legacyBehavior>
                  <Button className="bg-orange-500 text-white hover:bg-orange-600">Sign Up</Button>
                </Link>
              </div>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}
