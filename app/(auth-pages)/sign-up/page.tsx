"use client";

import { signUpAction } from "@/app/actions/auth";
import { signInWithGoogleAction } from "@/app/actions/auth";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import wetConcrete from "../../../public/images/wet-concrete.jpg";
import logoColor from "../../../public/images/logo/color/logo-color-1.png";
import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import React from "react";
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePasswordConfirmation,
  getPasswordStrength,
} from "@/utils/validation";

export default function Signup(props: { searchParams: Promise<Message> }) {
  const [searchParams, setSearchParams] = useState<Message | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Validation states
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Handle name change with validation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);

    if (touched.name) {
      const validation = validateName(newName);
      setNameError(validation.isValid ? "" : validation.error || "");
    }
  };

  // Handle email change with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (touched.email) {
      const validation = validateEmail(newEmail);
      setEmailError(validation.isValid ? "" : validation.error || "");
    }
  };

  // Handle password change with validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (touched.password) {
      const validation = validatePassword(newPassword);
      setPasswordError(validation.isValid ? "" : validation.error || "");
    }

    // Re-validate confirm password if it's been touched
    if (touched.confirmPassword && confirmPassword) {
      const confirmValidation = validatePasswordConfirmation(newPassword, confirmPassword);
      setConfirmPasswordError(confirmValidation.isValid ? "" : confirmValidation.error || "");
    }
  };

  // Handle confirm password change with validation
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);

    if (touched.confirmPassword) {
      const validation = validatePasswordConfirmation(password, newConfirmPassword);
      setConfirmPasswordError(validation.isValid ? "" : validation.error || "");
    }
  };

  // Handle field blur (when user leaves the field)
  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate the field when it loses focus
    switch (field) {
      case "name":
        const nameValidation = validateName(name);
        setNameError(nameValidation.isValid ? "" : nameValidation.error || "");
        break;
      case "email":
        const emailValidation = validateEmail(email);
        setEmailError(emailValidation.isValid ? "" : emailValidation.error || "");
        break;
      case "password":
        const passwordValidation = validatePassword(password);
        setPasswordError(passwordValidation.isValid ? "" : passwordValidation.error || "");
        break;
      case "confirmPassword":
        const confirmValidation = validatePasswordConfirmation(password, confirmPassword);
        setConfirmPasswordError(confirmValidation.isValid ? "" : confirmValidation.error || "");
        break;
    }
  };

  // Handle form submission with client-side auth
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();

      // Sign up the user with Supabase client
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Sign up error:", error.message);
        setIsLoading(false);
        return;
      }

      // Create service provider record
      if (data.user) {
        const { error: serviceProviderError } = await supabase.from("service_providers").insert({
          auth_user_id: data.user.id,
          owner_name: name,
          onboarding_status: "pending",
        });

        if (serviceProviderError) {
          console.error("Failed to create service provider:", serviceProviderError);
        }
      }

      // Check if user was immediately signed in (email confirmation disabled)
      if (data.session) {
        // Show redirecting state
        setIsRedirecting(true);

        // Wait for auth state to be updated, then redirect
        const waitForAuth = () => {
          const { isAuthenticated } = useAuthStore.getState();
          if (isAuthenticated) {
            router.push("/dashboard");
          } else {
            setTimeout(waitForAuth, 100);
          }
        };

        // Start checking after a short delay
        setTimeout(waitForAuth, 200);
        return;
      }

      // Email confirmation required

      setIsSuccess(true);
    } catch (error) {
      console.error("Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    const nameValid = validateName(name).isValid;
    const emailValid = validateEmail(email).isValid;
    const passwordValid = validatePassword(password).isValid;
    const confirmPasswordValid = validatePasswordConfirmation(password, confirmPassword).isValid;

    return nameValid && emailValid && passwordValid && confirmPasswordValid && termsAccepted;
  };

  // Get password strength for display
  const passwordStrength = getPasswordStrength(password);

  // Initialize searchParams
  React.useEffect(() => {
    props.searchParams.then(setSearchParams);
  }, [props.searchParams]);

  // Check for success parameter in URL
  React.useEffect(() => {
    props.searchParams.then((params) => {
      if (params && "success" in params) {
        setIsSuccess(true);
      }
    });
  }, [props.searchParams]);

  if (searchParams && "message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  // Redirecting screen
  if (isRedirecting) {
    return (
      <div className="flex h-screen w-full">
        <div className="flex w-full mx-auto bg-white overflow-hidden">
          <div className="w-full flex items-center justify-center p-8">
            <div className="w-full max-w-md text-center">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <Image src={logoColor} alt="Spaak Logo" width={48} height={48} />
              </div>

              {/* Redirecting message */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-700 mb-4">Welcome to Spaak!</h1>
                <p className="text-gray-600 mb-6">Account created successfully. Redirecting you to your dashboard...</p>
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success screen
  if (isSuccess) {
    return (
      <div className="flex h-screen w-full">
        <div className="flex w-full mx-auto bg-white overflow-hidden">
          {/* Left side - Success message */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12">
            <div className="w-full max-w-md text-center">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <Image src={logoColor} alt="Spaak Logo" width={48} height={48} />
              </div>

              {/* Success message */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-700 mb-4">Check Your Email</h1>
                <p className="text-gray-600 mb-2">We've sent a verification link to:</p>
                <p className="text-orange-600 font-medium mb-4">{email}</p>
                <p className="text-gray-600 text-sm">
                  Please check your email and click the verification link to activate your account.
                </p>
              </div>

              {/* Go to Sign In button */}
              <Link href="/sign-in">
                <Button className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors h-12">
                  Go to Sign In
                </Button>
              </Link>

              {/* Additional help text */}
              <p className="text-sm text-gray-500 mt-4">
                Didn't receive the email? Check your spam folder or{" "}
                <button onClick={() => setIsSuccess(false)} className="text-orange-600 hover:text-orange-500 underline">
                  try again
                </button>
              </p>
            </div>
          </div>

          {/* Right side - Image (same as sign-up form) */}
          <div className="hidden md:flex w-1/2 p-8">
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image src={wetConcrete} alt="Wet Concrete" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      <div className="flex w-full mx-auto bg-white overflow-hidden">
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
            {/* <form action={signInWithGoogleAction}>
              <Button
                type="submit"
                variant="outline"
                className="w-full flex items-center bg-white justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors mb-6 h-12"
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
              </Button>
            </form> */}

            {/* Divider */}
            {/* <div className="flex items-center mb-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div> */}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Name Field */}
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-2">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Rodrigo Robinson"
                  value={name}
                  onChange={handleNameChange}
                  onBlur={() => handleBlur("name")}
                  disabled={isLoading}
                  required
                  className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder:text-gray-500 [&:not(:placeholder-shown)]:bg-white [&:not(:placeholder-shown)]:text-black ${nameError ? "border-red-500" : "border-gray-300"} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
              </div>

              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-2">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="rodrigo@companyemail.com"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => handleBlur("email")}
                  disabled={isLoading}
                  required
                  className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder:text-gray-500 [&:not(:placeholder-shown)]:bg-white [&:not(:placeholder-shown)]:text-black ${emailError ? "border-red-500" : "border-gray-300"} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-2">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="min 8 chars"
                    minLength={8}
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => handleBlur("password")}
                    disabled={isLoading}
                    required
                    className={`w-full px-4 py-3 pr-12 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder:text-gray-500 ${passwordError ? "border-red-500" : "border-gray-300"} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 h-8 w-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Button>
                </div>
                {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                {password && !passwordError && (
                  <div className="mt-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.level === "weak"
                              ? "w-1/4 bg-red-500"
                              : passwordStrength.level === "medium"
                                ? "w-2/4 bg-yellow-500"
                                : passwordStrength.level === "strong"
                                  ? "w-3/4 bg-blue-500"
                                  : "w-full bg-green-500"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs ${
                          passwordStrength.level === "weak"
                            ? "text-red-500"
                            : passwordStrength.level === "medium"
                              ? "text-yellow-600"
                              : passwordStrength.level === "strong"
                                ? "text-blue-500"
                                : "text-green-500"
                        }`}
                      >
                        {passwordStrength.description}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <Label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 mb-2">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    minLength={8}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    onBlur={() => handleBlur("confirmPassword")}
                    disabled={isLoading}
                    required
                    className={`w-full px-4 py-3 pr-12 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder:text-gray-500 ${confirmPasswordError ? "border-red-500" : "border-gray-300"} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 h-8 w-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Button>
                </div>
                {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
              </div>

              {/* Terms and Privacy */}
              <div className="flex items-start gap-3 mb-6">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  disabled={isLoading}
                  required
                  className={`mt-1 border-2 border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                <label htmlFor="terms" className={`text-sm text-zinc-700 ${isLoading ? "opacity-50" : ""}`}>
                  I agree to the{" "}
                  <Link href="/terms" className="text-orange-600 hover:text-orange-500">
                    Terms & Privacy
                  </Link>
                </label>
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={!isFormValid() || isLoading}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed h-12 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Signing up..." : "Sign up"}
              </Button>

              {/* Sign in navigation */}
              <div className="text-center pt-4">
                <p className="text-sm text-zinc-700">
                  Have an account?{" "}
                  <Link href="/sign-in" className="text-orange-600 hover:text-orange-500 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>

              {searchParams && <FormMessage message={searchParams} />}
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
