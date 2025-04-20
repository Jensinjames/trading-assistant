"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    console.error("Auth error:", error);
  }, [error]);

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "You do not have permission to sign in.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      case "Default":
      default:
        return "An error occurred during authentication. Please try again.";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-4">
            <p className="text-center text-red-600">
              {getErrorMessage(error)}
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-center space-x-4">
          <Link
            href="/auth/signin"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
} 