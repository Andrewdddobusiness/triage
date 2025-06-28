"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import sawing from "../../../public/images/sawing.jpg";
import logoColor from "../../../public/images/logo/color/logo-color-1.png";
import { signInAction } from "@/app/actions/auth";
import { FormMessage } from "@/components/form-message";
import { Message } from "@/components/form-message";

export default function Login(props: { searchParams: Promise<Message> }) {
  const [searchParams, setSearchParams] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize searchParams
    props.searchParams.then(setSearchParams);
  }, [props.searchParams]);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await signInAction(formData);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get user-friendly error messages
  const getErrorMessage = (error: string): string => {
    const lowerError = error.toLowerCase();

    if (lowerError.includes("email not confirmed") || lowerError.includes("email_not_confirmed")) {
      return "Please check your email and click the verification link before signing in.";
    }
    if (lowerError.includes("invalid login credentials") || lowerError.includes("invalid_credentials")) {
      return "Invalid email or password. Please try again.";
    }
    if (lowerError.includes("too many requests")) {
      return "Too many sign-in attempts. Please wait a moment before trying again.";
    }
    if (lowerError.includes("user not found")) {
      return "No account found with this email address.";
    }

    // Generic fallback for security
    return "Sign-in failed. Please check your credentials and try again.";
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left side - Image (hidden on small screens) */}
      <div className="hidden md:flex w-1/2 p-8">
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
          <Image src={sawing} alt="Wet Concrete" fill className="object-cover" />
          {/* Optional overlay with your brand colors */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent"></div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <div className="w-full md:w-3/4 xl:w-1/2 mx-auto px-8">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4">
              <Image src={logoColor} alt="Spaak Logo" width={48} height={48} />
            </div>
            <h2 className="text-3xl font-bold text-zinc-700">Spaak</h2>
            <p className="text-zinc-600">Sign in to your account</p>
          </div>

          {/* Error Message Display */}
          {searchParams && "error" in searchParams && (
            <div className="mb-4 text-zinc-700">
              <FormMessage message={{ error: getErrorMessage(searchParams.error) }} />
            </div>
          )}

          {/* Success Message Display */}
          {searchParams && "success" in searchParams && (
            <div className="mb-4 text-zinc-700">
              <FormMessage message={searchParams} />
            </div>
          )}

          {/* General Message Display */}
          {searchParams && "message" in searchParams && (
            <div className="mb-4 text-zinc-700f">
              <FormMessage message={searchParams} />
            </div>
          )}

          {/* Attach the signInAction to the form */}
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
                  Password
                </label>
                <a href="/forgot-password" className="text-sm text-orange-600 hover:text-orange-500">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Sign up navigation */}
          <div className="text-center pt-2">
            <p className="text-sm text-zinc-600">
              Don't have an account?{" "}
              <a href="/sign-up" className="text-orange-600 hover:text-orange-500 font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
