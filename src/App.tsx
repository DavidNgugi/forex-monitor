"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

import { Authenticated, Unauthenticated, useQuery } from "convex/react"
import { useConvexAuth } from "convex/react"
import { api } from "../convex/_generated/api"
import { SignInForm } from "./SignInForm"
import { SignOutButton } from "./SignOutButton"
import { Toaster } from "sonner"
import ForexDashboard from "./components/ForexDashboard"
import ThemeToggle from "./components/ThemeToggle"
import { ThemeProvider } from "./lib/ThemeContext"
import { useTheme } from "./lib/ThemeContext"
import { getThemeColors } from "./lib/theme"
import { TrendingUp, Bell, BarChart3, Zap, Globe, X, LogIn } from "lucide-react"

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

function Header({ setIsSignInModalOpen }: { setIsSignInModalOpen: (open: boolean) => void }) {
  const { colors } = useTheme()
  const { isAuthenticated } = useConvexAuth()

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
        isAuthenticated 
          ? `${colors.background.card} ${colors.border.primary} shadow-lg` 
          : `bg-gray-800/80 border-gray-600`
      }`}
    >
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${
        isAuthenticated ? 'w-full' : 'max-w-7xl'
      }`}>
        <div className={`flex items-center h-16 ${
          isAuthenticated ? 'justify-between' : 'justify-between'
        }`}>
          {/* Logo - Always on the left */}
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
              isAuthenticated 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600'
            }`}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className={`text-xl font-bold transition-colors duration-300 ${
              isAuthenticated 
                ? colors.text.primary 
                : 'text-white'
            }`}>ForexMonitor Pro</h1>
          </div>

          {/* Right side elements - Grouped together */}
          <div className={`flex items-center ${
            isAuthenticated ? 'space-x-3' : 'space-x-4'
          }`}>
            <Authenticated>
              <ThemeToggle />
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
  )
}

function AppContent() {
  const { colors } = useTheme()
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)

  return (
    <div className={`min-h-screen flex flex-col ${colors.background.primary} ${colors.text.primary}`}>
      <Header setIsSignInModalOpen={setIsSignInModalOpen} />

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

      {/* Footer - Only show for authenticated users */}
      <Authenticated>
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
      </Authenticated>
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
        <div className={`flex items-center justify-between p-6 border-b ${colors.border.primary}`}>
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

// Aurora Background Component
const AuroraBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let time = 0;
    const animate = (timestamp: number) => {
      time += 0.016; // 60fps
      
      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0f0f23');
      gradient.addColorStop(0.5, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create aurora effect
      const auroraLayers = [
        { color: '#4f46e5', speed: 0.5, amplitude: 0.3, frequency: 0.02 },
        { color: '#7c3aed', speed: 0.3, amplitude: 0.4, frequency: 0.015 },
        { color: '#06b6d4', speed: 0.7, amplitude: 0.25, frequency: 0.025 }
      ];

      auroraLayers.forEach((layer, layerIndex) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        // Create aurora curve
        for (let x = 0; x <= canvas.width; x += 2) {
          const normalizedX = x / canvas.width;
          const wave1 = Math.sin(normalizedX * 4 + time * layer.speed) * layer.amplitude;
          const wave2 = Math.sin(normalizedX * 8 + time * layer.speed * 0.5) * layer.amplitude * 0.5;
          const wave3 = Math.sin(normalizedX * 12 + time * layer.speed * 0.3) * layer.amplitude * 0.3;
          
          const y = canvas.height * 0.3 + 
                   (wave1 + wave2 + wave3) * canvas.height * 0.2 +
                   Math.sin(time * 0.5 + layerIndex) * 20;

          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();

        // Create gradient for aurora
        const auroraGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        auroraGradient.addColorStop(0, `${layer.color}40`);
        auroraGradient.addColorStop(0.5, `${layer.color}20`);
        auroraGradient.addColorStop(1, `${layer.color}00`);

        ctx.fillStyle = auroraGradient;
        ctx.fill();

        // Add glow effect
        ctx.shadowColor = layer.color;
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Add floating particles
      for (let i = 0; i < 50; i++) {
        const x = (Math.sin(time * 0.5 + i * 0.1) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(time * 0.3 + i * 0.2) * 0.5 + 0.5) * canvas.height;
        const size = Math.sin(time + i) * 2 + 3;
        const opacity = Math.sin(time * 0.5 + i) * 0.3 + 0.7;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

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
        <div className="relative overflow-hidden flex flex-col h-screen">
          {/* Aurora Background */}
          <div className="relative flex-1 flex flex-col">
            <AuroraBackground />
            
            {/* Hero Section */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
              <div className="max-w-4xl mx-auto animate-fade-in">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4 animate-fade-in">
                  <Zap className="w-4 h-4 text-blue-400 mr-2" />
                  <span className="text-sm font-medium text-blue-300">Real-time forex monitoring</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 animate-scale-in">
                  <span className="text-white">Trade Smarter</span>
                  <br />
                  <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                    With Confidence
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
                  Professional forex monitoring with real-time rates, intelligent alerts, and comprehensive market
                  analysis—all in one powerful platform.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-slide-up">
                  <button
                    onClick={() => setIsSignInModalOpen(true)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Get Started Now
                  </button>
                  <button
                    onClick={() => setIsSignInModalOpen(true)}
                    className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Demo
                  </button>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-slide-up">
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

            {/* Floating elements */}
            <div className="absolute top-20 left-10 w-4 h-4 bg-purple-400 rounded-full opacity-60 animate-float-1" />
            <div className="absolute top-40 right-20 w-3 h-3 bg-blue-400 rounded-full opacity-60 animate-float-2" />
            <div className="absolute bottom-40 left-20 w-2 h-2 bg-pink-400 rounded-full opacity-60 animate-float-3" />
          </div>

          {/* Footer */}
          <footer className="relative z-10 bg-black/20 backdrop-blur-sm border-t border-white/10 flex-shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="text-sm text-gray-300 mb-4 sm:mb-0">
                  © {new Date().getFullYear()} ForexMonitor Pro. All rights reserved.
                </div>
                <div className="text-sm text-gray-300 flex items-center">
                  Created with ❤️ by {" "}&nbsp;
                  <a
                    href="https://davidngugi.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline transition-colors"
                  >
                    David Ngugi
                  </a>
                </div>
              </div>
            </div>
          </footer>
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
  return (
    <div className="group relative h-full">
      <div
        className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl -z-10"
        style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }}
      ></div>

      <div
        className="relative h-full flex flex-col bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105"
      >
        <div className="flex items-center mb-4">
          <div
            className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} text-white shadow-lg flex-shrink-0 mr-4`}
          >
            {icon}
          </div>
          <h3 className="text-lg font-bold text-white flex-shrink-0">{title}</h3>
        </div>

        <p className="text-gray-300 leading-relaxed text-sm flex-1">{description}</p>
      </div>
    </div>
  )
}
