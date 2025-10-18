"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Failed to send sign-in link. Please try again.");
      } else {
        setEmailSent(true);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen  flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a magic link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Click the link in the email to sign in to your account. The link will expire in 24 hours.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
            >
              Use a different email
            </Button>
            <Link href="/" className="block">
              <Button variant="link" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              next-recipe-hub
            </div>
            <CardTitle className="text-2xl">Welcome back!</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email}
                size="lg"
              >
                {isLoading ? "Sending link..." : "Send magic link"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>How it works:</strong> We&apos;ll send you a secure sign-in link to your email. 
                No password needed! If you don&apos;t have an account yet, we&apos;ll create one for you automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              next-recipe-hub
            </div>
            <CardTitle className="text-2xl">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
