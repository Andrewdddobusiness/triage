import React from "react";
import Image from "next/image";
import sawing from "../../../public/images/sawing.jpg";
import { signInAction } from "@/app/actions";

export default function Login() {
  return (
    <div className="flex h-screen w-full">
      {/* Left side - Image (hidden on small screens) */}
      <div className="hidden md:flex w-1/2 bg-gray-100 relative flex-col justify-center items-center">
        <Image src={sawing} alt="Sawing" fill className="object-cover opacity-90" />
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        {/* On mobile, the form container takes 50% of the width and is centered;
            on larger screens, it uses the full width of its half */}
        <div className="w-full md:w-3/4 xl:w-1/2 mx-auto px-8">
          <div className="flex flex-col items-center mb-8">
            <div className="text-orange-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 00.372.648l8.628 5.033z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold">BuildTriage</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Attach the signInAction to the form */}
          <form action={signInAction} method="POST" className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a href="#" className="text-sm text-orange-600 hover:text-orange-500">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Sign in
            </button>
          </form>

          {/* Sign up navigation */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
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
