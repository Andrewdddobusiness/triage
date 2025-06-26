"use client";
import Image from "next/image";
import sawing from "../../../public/images/sawing.jpg";
import logoColor from "../../../public/images/logo/color/logo-color-1.png";
import { signInAction } from "@/app/actions/auth";

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
            <div className="mb-4">
              <Image src={logoColor} alt="Spaak Logo" width={48} height={48} />
            </div>
            <h2 className="text-3xl font-bold text-zinc-700">Spaak</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Attach the signInAction to the form */}
          <form action={signInAction} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 autofill:bg-white autofill:text-gray-900 autofill:shadow-[inset_0_0_0px_1000px_white]"
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
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
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
