"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useTheme } from "./lib/ThemeContext";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const { colors } = useTheme();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData).catch((error) => {
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
            setSubmitting(false);
          });
        }}
      >
        <input
          className={`w-full px-4 py-3 rounded-lg ${colors.background.secondary} ${colors.border.accent} border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm hover:shadow`}
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <input
          className={`w-full px-4 py-3 rounded-lg ${colors.background.secondary} ${colors.border.accent} border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm hover:shadow`}
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
        onClick={() => void signIn("anonymous")}
      >
        Sign in anonymously
      </button>
    </div>
  );
}
