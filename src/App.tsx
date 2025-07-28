"use client"

import type React from "react"
import { useState } from "react"

import { Authenticated, Unauthenticated, useQuery } from "convex/react"
import { api } from "../convex/_generated/api"
import { SignInForm } from "./SignInForm"
import { SignOutButton } from "./SignOutButton"
import { Toaster } from "sonner"
import ForexDashboard from "./components/ForexDashboard"
import ThemeToggle from "./components/ThemeToggle"
import { ThemeProvider } from "./lib/ThemeContext"
import { useTheme } from "./lib/ThemeContext"
import { TrendingUp, Bell, BarChart3, Zap, Globe, X, LogIn } from "lucide-react"

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

function AppContent() {
  const { colors } = useTheme()
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)

  return (
    <div className={`min-h-screen flex flex-col ${colors.background.primary} ${colors.text.primary}`}>
      <header
        className={`sticky top-0 z-50 backdrop-blur-xl ${colors.background.card}/80 border-b ${colors.border.primary}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className={`text-xl font-bold ${colors.text.primary}`}>ForexMonitor Pro</h1>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Authenticated>
                <SignOutButton />
              </Authenticated>
              <Unauthenticated>
                <button
                  onClick={() => setIsSignInModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </button>
              </Unauthenticated>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Content setIsSignInModalOpen={setIsSignInModalOpen} />
      </main>

      {/* Sign In Modal */}
      <Unauthenticated>
        <SignInModal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} />
      </Unauthenticated>

      <Toaster
        position="top-right"
        toastOptions={{
          className: `${colors.background.card} ${colors.border.primary} border`,
        }}
      />

      {/* Footer */}
      <footer className={`${colors.background.card}/60 border-t ${colors.border.primary}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className={`text-sm ${colors.text.secondary} mb-4 sm:mb-0`}>
              © {new Date().getFullYear()} ForexMonitor Pro. All rights reserved.
            </div>
            <div className={`text-sm ${colors.text.secondary} flex items-center`}>
              Created with ❤️ by {" "}&nbsp;
              <a
                href="https://davidngugi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors"
              >
                David Ngugi
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SignInModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { colors } = useTheme()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md ${colors.background.card} rounded-2xl shadow-2xl border ${colors.border.primary} overflow-hidden`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b}`}>
          <div>
            <h2 className={`text-2xl font-bold ${colors.text.primary}`}>Welcome Back</h2>
            <p className={`text-sm ${colors.text.secondary} mt-1`}>Sign in to access your dashboard</p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${colors.background.secondary} hover:${colors.background.tertiary} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <SignInForm />
        </div>

      </div>
    </div>
  )
}

function Content({ setIsSignInModalOpen }: { setIsSignInModalOpen: (open: boolean) => void }) {
  const { colors } = useTheme()
  const loggedInUser = useQuery(api.auth.loggedInUser)

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="relative">
          <div className={`w-12 h-12 border-4 ${colors.border.secondary} rounded-full animate-spin`}></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Authenticated>
        <ForexDashboard />
      </Authenticated>

      <Unauthenticated>
        <div className="relative overflow-hidden">
          {/* Hero Section */}
          <div className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">
                        <div
          className={`inline-flex items-center px-4 py-2 rounded-full ${colors.background.tertiary} ${colors.border.accent}/20 border mb-4`}
        >
                  <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                  <span className={`text-sm font-medium ${colors.status.accent}`}>Real-time forex monitoring</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                  <span className={`${colors.text.primary}`}>Trade Smarter</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                    With Confidence
                  </span>
                </h1>

                <p className={`text-lg sm:text-xl ${colors.text.secondary} mb-8 max-w-3xl mx-auto leading-relaxed`}>
                  Professional forex monitoring with real-time rates, intelligent alerts, and comprehensive market
                  analysis—all in one powerful platform.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                  <button
                    onClick={() => setIsSignInModalOpen(true)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Get Started Now
                  </button>
                  <button
                    onClick={() => setIsSignInModalOpen(true)}
                    className={`inline-flex items-center px-6 py-3 ${colors.background.card} ${colors.text.primary} font-semibold rounded-xl border ${colors.border.primary}/20 hover:${colors.background.secondary} transition-all duration-200 shadow-lg hover:shadow-xl`}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Demo
                  </button>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pb-8">
                <FeatureCard
                  icon={<BarChart3 className="w-8 h-8" />}
                  title="Real-time Rates"
                  description="Monitor live exchange rates across all major currency pairs with millisecond precision"
                  gradient="from-green-500 to-emerald-600"
                />
                <FeatureCard
                  icon={<Bell className="w-8 h-8" />}
                  title="Smart Alerts"
                  description="Set intelligent price alerts and get notified instantly when markets move"
                  gradient="from-blue-500 to-cyan-600"
                />
                <FeatureCard
                  icon={<Globe className="w-8 h-8" />}
                  title="Market Analysis"
                  description="Access comprehensive market data, news, and professional trading insights"
                  gradient="from-purple-500 to-pink-600"
                />
              </div>
            </div>
          </div>

          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </Unauthenticated>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}) {
  const { colors } = useTheme()

  return (
    <div className="group relative h-full">
      <div
        className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl -z-10"
        style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }}
      ></div>

      <div
        className={`relative h-full flex flex-col ${colors.background.card}/80 backdrop-blur-xl rounded-2xl p-6 ${colors.border.primary}/20 border shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105`}
      >
        <div
          className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} text-white mb-4 shadow-lg flex-shrink-0`}
        >
          {icon}
        </div>

        <h3 className={`text-lg font-bold ${colors.text.primary} mb-3 flex-shrink-0`}>{title}</h3>

        <p className={`${colors.text.secondary} leading-relaxed text-sm flex-1`}>{description}</p>
      </div>
    </div>
  )
}
