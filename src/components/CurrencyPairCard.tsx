"use client"

import type React from "react"
import { useState } from "react"
import { useQuery, useAction } from "convex/react"
import { api } from "../../convex/_generated/api"
import { TrendingUp, TrendingDown, Minus, X, BarChart3, Bell, RefreshCw, ArrowRight } from "lucide-react"
import AlertModal from "./AlertModal"
import ChartModal from "./ChartModal"
import { useTheme } from "../lib/ThemeContext"

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

  const exchangeRates = useQuery(api.forex.getExchangeRates, {
    baseCurrency: pair.baseCurrency,
  })

  const trendData = useQuery(api.forex.getTrendData, {
    baseCurrency: pair.baseCurrency,
    targetCurrency: pair.targetCurrency,
  })

  const fetchRates = useAction(api.forex.fetchExchangeRatesAndCheckAlerts)

  const currentRate = exchangeRates?.rates?.[pair.targetCurrency]
  const lastUpdate = exchangeRates?.timestamp

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchRates({ baseCurrency: pair.baseCurrency })
    } catch (error) {
      console.error("Failed to refresh rates:", error)
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
    if (!trendData) return <Minus className={`w-3 h-3 ${colors.text.muted}`} />
    if (trendData.trend === "up") return <TrendingUp className={`w-3 h-3 ${colors.chart.up}`} />
    if (trendData.trend === "down") return <TrendingDown className={`w-3 h-3 ${colors.chart.down}`} />
    return <Minus className={`w-3 h-3 ${colors.text.muted}`} />
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

  const isStale = lastUpdate && Date.now() - lastUpdate > 60000

  return (
    <>
      <div className="group relative">
        {/* Main Card */}
        <div className={`relative bg-gradient-to-br from-${colors.background.primary} to-${colors.background.secondary} backdrop-blur-xl ${colors.border.primary} border rounded-2xl p-4 hover:${colors.border.accent} transition-all duration-300  cursor-default`}>
          {/* Glow Effect */}
          <div className={`absolute inset-0 bg-gradient-to-r from-${colors.status.info}/5 to-${colors.status.accent}/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <span className="text-lg">{getFlagEmoji(pair.baseCurrency)}</span>
                <span className={`text-sm font-bold ${colors.text.primary}`}>{pair.baseCurrency}</span>
              </div>
              <ArrowRight className={`w-3 h-3 ${colors.text.muted}`} />
              <div className="flex items-center space-x-1">
                <span className="text-lg">{getFlagEmoji(pair.targetCurrency)}</span>
                <span className={`text-sm font-bold ${colors.text.primary}`}>{pair.targetCurrency}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => void handleRefresh()}
                disabled={isRefreshing}
                className={`p-1.5 rounded-lg ${colors.background.tertiary} hover:${colors.background.secondary} ${colors.text.secondary} hover:${colors.status.info} transition-all duration-200 disabled:opacity-50 cursor-pointer`}
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={onRemove}
                className={`p-1.5 rounded-lg ${colors.background.tertiary} hover:${colors.status.error}/20 ${colors.text.secondary} hover:${colors.status.error} transition-all duration-200 cursor-pointer`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Rate Display */}
          <div className="relative mb-4">
            <div className="flex items-end space-x-2">
              <span className={`text-2xl font-bold ${colors.text.primary} tracking-tight`}>{formatRate(currentRate)}</span>
              {currentRate && (
                <div className="flex items-center space-x-1 mb-1">
                  {getTrendIcon()}
                  {trendData && Math.abs(trendData.change) > 0.0001 && (
                    <span className={`text-xs font-medium ${getTrendColor()}`}>
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
                  className={`px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                    trendData.trend === "up"
                      ? `${colors.chart.up}/20 ${colors.chart.up} border ${colors.chart.up}/30`
                      : `${colors.chart.down}/20 ${colors.chart.down} border ${colors.chart.down}/30`
                  }`}
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
                <span className={`${colors.chart.up} font-medium`}>
                  {trendData.high24h ? formatRate(trendData.high24h) : "-"}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className={colors.text.muted}>L:</span>
                <span className={`${colors.chart.down} font-medium`}>
                  {trendData.low24h ? formatRate(trendData.low24h) : "-"}
                </span>
              </div>
            </div>
          )}

          {/* Status Bar */}
          <div className={`flex items-center justify-between text-xs ${colors.text.muted} mb-3`}>
            <span className={isStale ? colors.status.warning : ""}>
              {lastUpdate ? (
                <>
                  {new Date(lastUpdate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isStale && " ⚠"}
                </>
              ) : (
                "No data"
              )}
            </span>
            <div className="flex items-center space-x-1">
              <div className={`w-1.5 h-1.5 rounded-full ${currentRate ? colors.status.success : colors.text.muted}`} />
              <span>{currentRate ? "Live" : "Offline"}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => {
                console.log("Chart button clicked for pair:", pair)
                setShowChartModal(true)
              }}
              disabled={!currentRate}
              className={`flex-1 bg-gradient-to-r from-${colors.status.info}/10 to-${colors.status.info}/10 hover:from-${colors.status.info}/20 hover:to-${colors.status.info}/20 border border-${colors.status.info}/20 ${colors.status.info} px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium cursor-pointer`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Chart</span>
            </button>
            <button
              onClick={() => setShowAlertModal(true)}
              disabled={!currentRate}
              className={`flex-1 bg-gradient-to-r from-${colors.status.warning}/10 to-${colors.status.warning}/10 hover:from-${colors.status.warning}/20 hover:to-${colors.status.warning}/20 border border-${colors.status.warning}/20 ${colors.status.warning} px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium cursor-pointer`}
            >
              <Bell className="w-3 h-3" />
              <span>Alert</span>
            </button>
          </div>
        </div>
      </div>

      {showAlertModal && currentRate && (
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
