"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useTheme } from "./lib/ThemeContext";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const { colors } = useTheme();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className={`px-4 py-2 rounded ${colors.button.secondary} font-semibold transition-colors shadow-sm hover:shadow`}
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );
}
