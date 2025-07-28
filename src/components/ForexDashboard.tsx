import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import CurrencyPairCard from './CurrencyPairCard';
import CurrencySelector from './CurrencySelector';
import AlertsPanel from './AlertsPanel';
import NewsPanel from './NewsPanel';
import YouTubePanel from './YouTubePanel';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { useTheme } from '../lib/ThemeContext';

interface WatchedPair {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  order: number;
}

const ForexDashboard: React.FC = () => {
  const { colors } = useTheme();
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [watchedPairs, setWatchedPairs] = useState<WatchedPair[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newsCountry, setNewsCountry] = useState('US');
  
  const userPreferences = useQuery(api.forex.getUserPreferences);
  const updatePreferences = useMutation(api.forex.updateUserPreferences);
  const initializeDefaults = useMutation(api.forex.initializeDefaultPairs);
  const fetchRates = useAction(api.forex.fetchExchangeRatesAndCheckAlerts);

  // Initialize default pairs if user has no preferences
  useEffect(() => {
    if (userPreferences === null) {
      // User is not authenticated, do nothing
      return;
    }
    
    if (userPreferences && userPreferences.watchedPairs.length === 0) {
      // User has no pairs, initialize defaults
      const initializeDefaultPairs = async () => {
        try {
          const defaultPairs = await initializeDefaults();
          setWatchedPairs(defaultPairs);
          toast.success('Default currency pairs initialized');
        } catch (error) {
          console.error('Failed to initialize default pairs:', error);
          toast.error('Failed to initialize default pairs');
        }
      };
      
      void initializeDefaultPairs();
    } else if (userPreferences?.watchedPairs) {
      setWatchedPairs(userPreferences.watchedPairs);
    }
  }, [userPreferences, initializeDefaults]);

  // Initial fetch when pairs are loaded
  useEffect(() => {
    if (watchedPairs.length > 0) {
      const fetchInitialRates = async () => {
        setIsLoading(true);
        const uniqueBaseCurrencies = [...new Set(watchedPairs.map(pair => pair.baseCurrency))];
        
        try {
          await Promise.all(
            uniqueBaseCurrencies.map(baseCurrency => 
              fetchRates({ baseCurrency }).catch(error => {
                console.error(`Failed to fetch rates for ${baseCurrency}:`, error);
                toast.error(`Failed to fetch rates for ${baseCurrency}`);
                return null;
              })
            )
          );
        } finally {
          setIsLoading(false);
        }
      };

      void fetchInitialRates();
    }
  }, [watchedPairs.length > 0 ? watchedPairs.map(p => p.baseCurrency).join(',') : '', fetchRates]);

  // Auto-refresh rates every 30 seconds
  useEffect(() => {
    if (watchedPairs.length === 0) return;

    const interval = setInterval(() => {
      const refreshRates = async () => {
        const uniqueBaseCurrencies = [...new Set(watchedPairs.map(pair => pair.baseCurrency))];
        
        try {
          await Promise.all(
            uniqueBaseCurrencies.map(baseCurrency => 
              fetchRates({ baseCurrency }).catch(error => {
                console.error(`Failed to refresh rates for ${baseCurrency}:`, error);
                return null;
              })
            )
          );
        } catch (error) {
          console.error('Failed to refresh rates:', error);
        }
      };

      void refreshRates();
    }, 30000);

    return () => clearInterval(interval);
  }, [watchedPairs, fetchRates]);

  const handleAddPair = async (baseCurrency: string, targetCurrency: string) => {
    const newPair: WatchedPair = {
      id: `${baseCurrency}-${targetCurrency}`,
      baseCurrency,
      targetCurrency,
      order: watchedPairs.length,
    };

    const updatedPairs = [...watchedPairs, newPair];
    setWatchedPairs(updatedPairs);
    
    try {
      await updatePreferences({ watchedPairs: updatedPairs });
      
      // Fetch initial rates for the new pair
      await fetchRates({ baseCurrency });
      toast.success(`Added ${baseCurrency}/${targetCurrency} pair`);
    } catch (error) {
      console.error('Failed to add pair:', error);
      toast.error('Failed to add currency pair');
      // Revert the change
      setWatchedPairs(watchedPairs);
    }
    
    setShowCurrencySelector(false);
  };

  const handleRemovePair = async (pairId: string) => {
    const updatedPairs = watchedPairs.filter(pair => pair.id !== pairId);
    setWatchedPairs(updatedPairs);
    
    try {
      await updatePreferences({ watchedPairs: updatedPairs });
      toast.success('Currency pair removed');
    } catch (error) {
      console.error('Failed to remove pair:', error);
      toast.error('Failed to remove currency pair');
      // Revert the change
      setWatchedPairs(watchedPairs);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(watchedPairs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedPairs = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setWatchedPairs(updatedPairs);
    
    try {
      await updatePreferences({ watchedPairs: updatedPairs });
    } catch (error) {
      console.error('Failed to update pair order:', error);
      toast.error('Failed to update pair order');
      // Revert the change
      setWatchedPairs(watchedPairs);
    }
  };

  return (
    <div className={`min-h-screen ${colors.background.primary}`}>
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className={`text-3xl font-bold ${colors.text.primary}`}>Forex Dashboard</h1>
          <button
            onClick={() => setShowCurrencySelector(true)}
            disabled={isLoading}
            className={`${colors.button.primary} px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Loading...' : 'Add Pair'}
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Currency Pairs Section */}
          <div className="xl:col-span-2">
            <div className={`${colors.background.card} rounded-lg shadow-sm ${colors.border.primary} border p-6`}>
              <h2 className={`text-2xl font-bold ${colors.text.primary} mb-6`}>Currency Pairs</h2>

              {isLoading && watchedPairs.length === 0 ? (
                <div className="flex justify-center items-center h-32">
                  <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${colors.status.info}`}></div>
                  <span className={`ml-2 ${colors.text.secondary}`}>Loading exchange rates...</span>
                </div>
              ) : (
                <DragDropContext onDragEnd={(result) => void handleDragEnd(result)}>
                  <Droppable droppableId="currency-pairs">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                      >
                        {watchedPairs.map((pair, index) => (
                          <Draggable key={pair.id} draggableId={pair.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`${
                                  snapshot.isDragging ? 'opacity-75' : ''
                                }`}
                              >
                                <CurrencyPairCard
                                  pair={pair}
                                  onRemove={() => void handleRemovePair(pair.id)}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}

              {watchedPairs.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className={`${colors.text.tertiary} text-lg mb-4`}>No currency pairs added yet</p>
                  <button
                    onClick={() => setShowCurrencySelector(true)}
                    className={`${colors.button.primary} px-6 py-3 rounded-lg transition-colors`}
                  >
                    Add Your First Pair
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Alerts Panel */}
            <div className={`${colors.background.card} rounded-lg shadow-sm ${colors.border.primary} border`}>
              <div className={`p-4 ${colors.border.primary} border-b`}>
                <h3 className={`text-lg font-semibold ${colors.text.primary}`}>Alerts</h3>
              </div>
              <div className="p-4 max-h-80 overflow-y-auto">
                <AlertsPanel />
              </div>
            </div>

            {/* News Panel */}
            <div className={`${colors.background.card} rounded-lg shadow-sm ${colors.border.primary} border`}>
              <div className={`p-4 ${colors.border.primary} border-b`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${colors.text.primary}`}>News</h3>
                  <div className="flex items-center space-x-2">
                    <select
                      className={`text-xs p-1 ${colors.border.secondary} border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent ${colors.background.secondary} ${colors.text.primary}`}
                      value={newsCountry}
                      onChange={(e) => setNewsCountry(e.target.value)}
                    >
                      <option value="US">🇺🇸 US</option>
                      <option value="GB">🇬🇧 UK</option>
                      <option value="EU">🇪🇺 EU</option>
                      <option value="KE">🇰🇪 Kenya</option>
                      <option value="NG">🇳🇬 Nigeria</option>
                      <option value="ZA">🇿🇦 South Africa</option>
                    </select>
                    <button
                      className={`p-1 hover:${colors.background.tertiary} rounded transition-colors`}
                      title="Refresh news"
                      onClick={() => {
                        // Trigger refresh in NewsPanel
                        const event = new CustomEvent('refreshNews');
                        window.dispatchEvent(event);
                      }}
                    >
                      <svg className={`w-4 h-4 ${colors.text.muted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 max-h-80 overflow-y-auto">
                <NewsPanel selectedCountry={newsCountry} />
              </div>
              {/* News ticker - always visible at bottom */}
              <div className={`${colors.border.primary} border-t ${colors.background.tertiary} p-2`}>
                <div className="relative overflow-hidden h-6">
                  <div className={`animate-scroll whitespace-nowrap text-xs ${colors.text.accent} font-medium`}>
                    <span className="inline-block px-2">
                      {newsCountry === 'US' && '📈 USD/EUR up 0.5% • 📉 GBP/USD down 0.3% • 🔥 Fed announces policy review • 📊 USD/JPY gains • 💰 Gold prices rise • 🏦 Treasury yields update'}
                      {newsCountry === 'GB' && '📈 GBP/EUR stable • 📉 GBP/USD down 0.3% • 🔥 BOE policy update • 📊 GBP/JPY gains • 💰 Sterling strength • 🏦 UK inflation data'}
                      {newsCountry === 'EU' && '📈 EUR/USD up 0.5% • 📉 EUR/GBP stable • 🔥 ECB policy review • 📊 EUR/JPY gains • 💰 Euro strength • 🏦 Eurozone inflation'}
                      {newsCountry === 'KE' && '📈 KES/USD stable • 📉 KES/EUR down 0.2% • 🔥 CBK policy update • 📊 KES/GBP gains • 💰 Shilling strength • 🏦 Kenya inflation data'}
                      {newsCountry === 'NG' && '📈 NGN/USD stable • 📉 NGN/EUR down 0.1% • 🔥 CBN policy update • 📊 NGN/GBP gains • 💰 Naira strength • 🏦 Nigeria inflation data'}
                      {newsCountry === 'ZA' && '📈 ZAR/USD up 0.3% • 📉 ZAR/EUR stable • 🔥 SARB policy update • 📊 ZAR/GBP gains • 💰 Rand strength • 🏦 South Africa inflation data'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* YouTube Panel */}
            <div className={`${colors.background.card} rounded-lg shadow-sm ${colors.border.primary} border`}>
              <div className={`p-4 ${colors.border.primary} border-b`}>
                <h3 className={`text-lg font-semibold ${colors.text.primary}`}>YouTube</h3>
              </div>
              <div className="p-4 max-h-80 overflow-y-auto">
                <YouTubePanel />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Currency Selector Modal */}
      {showCurrencySelector && (
        <CurrencySelector
          onSelect={(base, target) => void handleAddPair(base, target)}
          onClose={() => setShowCurrencySelector(false)}
        />
      )}
    </div>
  );
};

export default ForexDashboard;
