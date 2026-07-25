"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth.store";
import { ShoppingBag } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function handleCallback() {
      try {
        // Get the session from the URL hash (set by Supabase after OAuth redirect)
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw new Error(error.message);
        }

        if (!data.session?.access_token) {
          throw new Error("No session found in callback");
        }

        // Send the Supabase token to our backend
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
        const response = await fetch(`${apiUrl}/auth/supabase`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: data.session.access_token }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to authenticate with server",
          );
        }

        const { user, accessToken } = result.data;

        // Store in Zustand (same as email login)
        useAuthStore.getState().login(user, accessToken);

        // Redirect based on role
        const role = user.role;
        switch (role) {
          case "ADMIN":
            router.push("/admin");
            break;
          case "SELLER":
            router.push("/seller");
            break;
          default:
            router.push("/");
            break;
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Authentication failed",
        );
      }
    }

    handleCallback();
  }, [router]);

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Authentication Failed
          </h1>
          <p className="text-gray-500 mb-6">{errorMessage}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
          <ShoppingBag className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Signing you in...
        </h1>
        <p className="text-gray-500">Please wait while we complete your login</p>
      </div>
    </div>
  );
}
