import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import ForexDashboard from "./components/ForexDashboard";
import ThemeToggle from "./components/ThemeToggle";
import { ThemeProvider } from "./lib/ThemeContext";
import { useTheme } from "./lib/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { colors } = useTheme();
  
  return (
    <div className={`min-h-screen flex flex-col ${colors.background.primary}`}>
      <header className={`sticky top-0 z-10 ${colors.background.secondary}/80 backdrop-blur-sm h-16 flex justify-between items-center ${colors.border.primary} border-b shadow-sm px-4`}>
        <h2 className={`text-xl font-semibold ${colors.text.accent}`}>ForexMonitor Pro</h2>
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <Authenticated>
            <SignOutButton />
          </Authenticated>
        </div>
      </header>
      <main className="flex-1">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const { colors } = useTheme();
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${colors.status.info}`}></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Authenticated>
        <ForexDashboard />
      </Authenticated>
      
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-[600px] px-4">
          <div className="text-center mb-8">
            <h1 className={`text-4xl font-bold ${colors.text.primary} mb-4`}>
              Welcome to ForexMonitor Pro
            </h1>
            <p className={`text-xl ${colors.text.secondary} mb-8`}>
              Real-time forex monitoring, alerts, and analysis
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl">
              <div className={`${colors.background.card} p-6 rounded-lg shadow-sm ${colors.border.primary} border`}>
                <h3 className={`font-semibold text-lg mb-2 ${colors.text.primary}`}>Real-time Rates</h3>
                <p className={colors.text.secondary}>Monitor live exchange rates with customizable pairs</p>
              </div>
              <div className={`${colors.background.card} p-6 rounded-lg shadow-sm ${colors.border.primary} border`}>
                <h3 className={`font-semibold text-lg mb-2 ${colors.text.primary}`}>Smart Alerts</h3>
                <p className={colors.text.secondary}>Set price alerts and never miss important movements</p>
              </div>
              <div className={`${colors.background.card} p-6 rounded-lg shadow-sm ${colors.border.primary} border`}>
                <h3 className={`font-semibold text-lg mb-2 ${colors.text.primary}`}>News & Analysis</h3>
                <p className={colors.text.secondary}>Stay informed with financial news and live streams</p>
              </div>
            </div>
          </div>
          <div className="w-full max-w-md">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
