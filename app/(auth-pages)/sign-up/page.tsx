import { signUpAction, signInWithGoogleAction } from "@/app/actions/auth";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import wetConcrete from "../../../public/images/wet-concrete.jpg";
import logoColor from "../../../public/images/logo/color/logo-color-1.png";
import Image from "next/image";

export default async function Signup(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      <div className="flex w-full  mx-auto bg-white overflow-hidden">
        {/* Left side - Sign up form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12">
          <div className="w-full max-w-md">
            {/* Logo and Header */}
            <div className="flex flex-col items-start mb-8">
              <div className="mb-6">
                <Image src={logoColor} alt="Spaak Logo" width={48} height={48} />
              </div>
              <h1 className="text-3xl font-bold text-zinc-700 mb-2">Get Started Now</h1>
              <p className="text-gray-600">Enter your credentials to access your account</p>
            </div>

            {/* Google Sign In Button */}
            <form action={signInWithGoogleAction}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors mb-6"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-gray-700 font-medium">Log in with Google</span>
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center mb-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <form className="space-y-4" action={signUpAction}>
              {/* Name Field */}
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Rodrigo Robinson"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="rodrigo@companyemail.com"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="min 8 chars"
                  minLength={8}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Terms and Privacy */}
              <div className="flex items-start gap-3 mb-6">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link href="/terms" className="text-orange-600 hover:text-orange-500">
                    Terms & Privacy
                  </Link>
                </label>
              </div>

              {/* Sign Up Button */}
              <SubmitButton
                formAction={signUpAction}
                pendingText="Signing up..."
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
              >
                Sign up
              </SubmitButton>

              {/* Sign in navigation */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Have an account?{" "}
                  <Link href="/sign-in" className="text-orange-600 hover:text-orange-500 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>

              <FormMessage message={searchParams} />
            </form>
          </div>
        </div>

        {/* Right side - Image with rounded corners and padding */}
        <div className="hidden md:flex w-1/2 p-8">
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            <Image src={wetConcrete} alt="Wet Concrete" fill className="object-cover" />
            {/* Optional overlay with your brand colors */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
