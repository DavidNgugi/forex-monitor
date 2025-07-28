"use client"

import type React from "react"
import { useState } from "react"
import { useQuery, useAction } from "convex/react"
import { api } from "../../convex/_generated/api"
import { TrendingUp, TrendingDown, Minus, X, BarChart3, Bell, RefreshCw, ArrowRight } from "lucide-react"
import AlertModal from "./AlertModal"
import ChartModal from "./ChartModal"
import { useTheme } from "../lib/ThemeContext"
import { cn } from "../lib/utils"

interface CurrencyPairCardProps {
  pair: {
    id: string
    baseCurrency: string
    targetCurrency: string
  }
  onRemove: () => void
}

const CurrencyPairCard: React.FC<CurrencyPairCardProps> = ({ pair, onRemove }) => {
  const { colors } = useTheme();
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [showChartModal, setShowChartModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Get rate for this specific pair
  const currentRate = useQuery(api.forex.getExchangeRate, {
    baseCurrency: pair.baseCurrency,
    targetCurrency: pair.targetCurrency,
  })

  const trendData = useQuery(api.forex.getTrendData, {
    baseCurrency: pair.baseCurrency,
    targetCurrency: pair.targetCurrency,
  })

  const fetchRate = useAction(api.forex.fetchExchangeRate)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchRate({ 
        baseCurrency: pair.baseCurrency,
        targetCurrency: pair.targetCurrency,
      })
    } catch (error) {
      console.error("Failed to refresh rate:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const getFlagEmoji = (currency: string) => {
    const flagMap: { [key: string]: string } = {
      USD: "🇺🇸",
      EUR: "🇪🇺",
      GBP: "🇬🇧",
      JPY: "🇯🇵",
      CHF: "🇨🇭",
      CAD: "🇨🇦",
      AUD: "🇦🇺",
      NZD: "🇳🇿",
      CNY: "🇨🇳",
      INR: "🇮🇳",
      KES: "🇰🇪",
      NGN: "🇳🇬",
      ZAR: "🇿🇦",
      EGP: "🇪🇬",
      GHS: "🇬🇭",
      BRL: "🇧🇷",
      MXN: "🇲🇽",
      RUB: "🇷🇺",
      KRW: "🇰🇷",
      SGD: "🇸🇬",
    }
    return flagMap[currency] || "🏳️"
  }

  const getTrendIcon = () => {
    if (!trendData) return <Minus className={cn("w-3 h-3", colors.text.muted)} />
    if (trendData.trend === "up") return <TrendingUp className={cn("w-3 h-3", colors.chart.up)} />
    if (trendData.trend === "down") return <TrendingDown className={cn("w-3 h-3", colors.chart.down)} />
    return <Minus className={cn("w-3 h-3", colors.text.muted)} />
  }

  const getTrendColor = () => {
    if (!trendData) return colors.text.muted
    if (trendData.trend === "up") return colors.chart.up
    if (trendData.trend === "down") return colors.chart.down
    return colors.text.muted
  }

  const formatRate = (rate: number | undefined) => {
    if (!rate) return "-.----"
    if (rate < 0.01) return rate.toFixed(6)
    if (rate < 1) return rate.toFixed(4)
    return rate.toFixed(4)
  }

  // Check if rate needs refresh (older than 5 minutes)
  const needsRefresh = !currentRate || (Date.now() - (currentRate as any)?.timestamp) > 5 * 60 * 1000

  return (
    <>
      <div className="group relative">
        {/* Main Card */}
        <div className={cn(
          "relative backdrop-blur-xl border rounded-2xl p-4 transition-all duration-300 cursor-default",
          colors.background.primary,
          colors.background.secondary,
          colors.border.primary,
          "hover:border-blue-200"
        )}>
          {/* Glow Effect */}
          <div className={cn(
            "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            "bg-gradient-to-r from-blue-500/5 to-blue-600/5"
          )} />

          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <span className="text-lg">{getFlagEmoji(pair.baseCurrency)}</span>
                <span className={cn("text-sm font-bold", colors.text.primary)}>{pair.baseCurrency}</span>
              </div>
              <ArrowRight className={cn("w-3 h-3", colors.text.muted)} />
              <div className="flex items-center space-x-1">
                <span className="text-lg">{getFlagEmoji(pair.targetCurrency)}</span>
                <span className={cn("text-sm font-bold", colors.text.primary)}>{pair.targetCurrency}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  void handleRefresh();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={isRefreshing}
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer",
                  colors.background.tertiary,
                  colors.text.secondary,
                  "hover:bg-gray-200 hover:text-blue-600"
                )}
              >
                <RefreshCw className={cn("w-3 h-3", isRefreshing ? "animate-spin" : "")} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                  colors.background.tertiary,
                  colors.text.secondary,
                  "hover:bg-red-100 hover:text-red-600"
                )}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Rate Display */}
          <div className="relative mb-4">
            <div className="flex items-end space-x-2">
              <span className={cn("text-2xl font-bold tracking-tight", colors.text.primary)}>{formatRate(currentRate || undefined)}</span>
              {currentRate && (
                <div className="flex items-center space-x-1 mb-1">
                  {getTrendIcon()}
                  {trendData && Math.abs(trendData.change) > 0.0001 && (
                    <span className={cn("text-xs font-medium", getTrendColor())}>
                      {trendData.changePercent > 0 ? "+" : ""}
                      {trendData.changePercent.toFixed(2)}%
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Floating Rate Change */}
            {trendData && Math.abs(trendData.change) > 0.0001 && (
              <div className="absolute -top-1 -right-1">
                <div
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm",
                    trendData.trend === "up"
                      ? "bg-green-500/20 text-green-500 border border-green-500/30"
                      : "bg-red-500/20 text-red-500 border border-red-500/30"
                  )}
                >
                  {trendData.change > 0 ? "+" : ""}
                  {trendData.change.toFixed(6)}
                </div>
              </div>
            )}
          </div>

          {/* 24h High/Low - Compact */}
          {trendData && (
            <div className="flex justify-between text-xs mb-3">
              <div className="flex items-center space-x-1">
                <span className={colors.text.muted}>H:</span>
                <span className={cn(colors.chart.up, "font-medium")}>
                  {trendData.high24h ? formatRate(trendData.high24h) : "-"}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className={colors.text.muted}>L:</span>
                <span className={cn(colors.chart.down, "font-medium")}>
                  {trendData.low24h ? formatRate(trendData.low24h) : "-"}
                </span>
              </div>
            </div>
          )}

          {/* Status Bar */}
          <div className={cn("flex items-center justify-between text-xs mb-3", colors.text.muted)}>
            <span className={needsRefresh ? colors.status.warning : ""}>
              {currentRate ? (
                <>
                  {needsRefresh && "⚠ "}
                  Live
                </>
              ) : (
                "No data"
              )}
            </span>
            <div className="flex items-center space-x-1">
              <div className={cn("w-1.5 h-1.5 rounded-full", currentRate ? colors.status.success : colors.text.muted)} />
              <span>{currentRate ? "Live" : "Offline"}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log("Chart button clicked for pair:", pair);
                setShowChartModal(true);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={!currentRate}
              className={cn(
                "flex-1 px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium cursor-pointer",
                "bg-gradient-to-r from-blue-500/10 to-blue-500/10",
                "hover:from-blue-500/20 hover:to-blue-500/20",
                "border border-blue-500/20",
                "text-blue-600"
              )}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Chart</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAlertModal(true);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={!currentRate}
              className={cn(
                "flex-1 px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium cursor-pointer",
                "bg-gradient-to-r from-yellow-500/10 to-yellow-500/10",
                "hover:from-yellow-500/20 hover:to-yellow-500/20",
                "border border-yellow-500/20",
                "text-yellow-600"
              )}
            >
              <Bell className="w-3 h-3" />
              <span>Alert</span>
            </button>
          </div>
        </div>
      </div>

      {showAlertModal && currentRate && typeof currentRate === 'number' && (
        <AlertModal pair={pair} currentRate={currentRate} onClose={() => setShowAlertModal(false)} />
      )}

      {showChartModal && (
        <ChartModal
          pair={pair}
          onClose={() => {
            console.log("Closing chart modal for pair:", pair)
            setShowChartModal(false)
          }}
        />
      )}
    </>
  )
}

export default CurrencyPairCard
