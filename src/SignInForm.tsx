"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { getThemeColors } from "./lib/theme";

interface SignInFormProps {
  onSuccess?: () => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  // Always use dark theme for sign-in form
  const colors = getThemeColors('dark');

  const handleSignIn = async (method: "password" | "anonymous", formData?: FormData) => {
    setSubmitting(true);
    try {
      if (method === "password" && formData) {
        formData.set("flow", flow);
        await signIn("password", formData);
      } else {
        await signIn("anonymous");
      }
      // Call onSuccess callback when authentication succeeds
      onSuccess?.();
    } catch (error: any) {
      let toastTitle = "";
      if (error.message.includes("Invalid password")) {
        toastTitle = "Invalid password. Please try again.";
      } else {
        toastTitle =
          flow === "signIn"
            ? "Could not sign in, did you mean to sign up?"
            : "Could not sign up, did you mean to sign in?";
      }
      toast.error(toastTitle);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          void handleSignIn("password", formData);
        }}
      >
        <input
          className={`w-full px-4 py-3 rounded-lg ${colors.background.secondary} ${colors.border.accent} border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow shadow-sm hover:shadow ${colors.text.primary} placeholder-gray-400`}
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <input
          className={`w-full px-4 py-3 rounded-lg ${colors.background.secondary} ${colors.border.accent} border focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow shadow-sm hover:shadow ${colors.text.primary} placeholder-gray-400`}
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <button 
          className={`w-full px-4 py-3 rounded-lg ${colors.button.primary} font-semibold transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed`} 
          type="submit" 
          disabled={submitting}
        >
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </button>
        <div className={`text-center text-sm ${colors.text.secondary}`}>
          <span>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className={`${colors.text.accent} hover:underline font-medium cursor-pointer`}
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </button>
        </div>
      </form>
      <div className="flex items-center justify-center my-3">
        <hr className={`my-4 grow ${colors.border.primary}`} />
        <span className={`mx-4 ${colors.text.secondary}`}>or</span>
        <hr className={`my-4 grow ${colors.border.primary}`} />
      </div>
      <button 
        className={`w-full px-4 py-3 rounded-lg ${colors.button.primary} font-semibold transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed`} 
        onClick={() => void handleSignIn("anonymous")}
        disabled={submitting}
      >
        Sign in anonymously
      </button>
    </div>
  );
}
