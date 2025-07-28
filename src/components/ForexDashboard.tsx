import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import CurrencyPairCard from './CurrencyPairCard';
import CurrencySelector from './CurrencySelector';
import AlertsPanel from './AlertsPanel';
import NewsPanel from './NewsPanel';
import YouTubePanel from './YouTubePanel';
import { useTheme } from '../lib/ThemeContext';
import { cn } from '../lib/utils';

interface WatchedPair {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  order: number;
}

const ForexDashboard: React.FC = () => {
  const { colors } = useTheme();
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userPreferences = useQuery(api.forex.getUserPreferences);
  const updatePreferences = useMutation(api.forex.updateUserPreferences);
  const initializeDefaults = useMutation(api.forex.initializeDefaultPairs);
  const refreshAllRates = useAction(api.forex.refreshWatchedPairsRates);

  const watchedPairs = userPreferences?.watchedPairs || [];

  // Initialize default pairs if user has no preferences
  useEffect(() => {
    if (userPreferences === null && !isLoading) {
      void initializeDefaults();
    }
  }, [userPreferences, initializeDefaults, isLoading]);

  // Refresh all rates when component mounts or pairs change
  useEffect(() => {
    if (watchedPairs.length > 0 && !isRefreshing) {
      void handleRefreshAllRates();
    }
  }, [watchedPairs.length]);

  const handleRefreshAllRates = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refreshAllRates();
      toast.success('Rates refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh rates');
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddPair = async (baseCurrency: string, targetCurrency: string) => {
    try {
      setIsLoading(true);
      
      const newPair: WatchedPair = {
        id: `${baseCurrency}-${targetCurrency}`,
        baseCurrency,
        targetCurrency,
        order: watchedPairs.length,
      };

      const updatedPairs = [...watchedPairs, newPair];
      
      await updatePreferences({ watchedPairs: updatedPairs });
      setShowCurrencySelector(false);
      toast.success('Currency pair added successfully!');
    } catch (error) {
      toast.error('Failed to add currency pair');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePair = async (pairId: string) => {
    try {
      const updatedPairs = watchedPairs.filter(pair => pair.id !== pairId);
      await updatePreferences({ watchedPairs: updatedPairs });
      toast.success('Currency pair removed successfully!');
    } catch (error) {
      toast.error('Failed to remove currency pair');
      console.error(error);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(watchedPairs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedPairs = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    try {
      await updatePreferences({ watchedPairs: updatedPairs });
    } catch (error) {
      toast.error('Failed to reorder pairs');
      console.error(error);
    }
  };

  const [newsCountry, setNewsCountry] = useState('US');

  // Listen for news refresh events
  useEffect(() => {
    const handleRefreshNews = () => {
      // This will trigger a refresh in NewsPanel
      console.log('Refreshing news...');
    };

    window.addEventListener('refreshNews', handleRefreshNews);
    return () => window.removeEventListener('refreshNews', handleRefreshNews);
  }, []);

  return (
    <div className={cn("min-h-screen", colors.background.primary)}>
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className={cn("text-3xl font-bold", colors.text.primary)}>Forex Dashboard</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => void handleRefreshAllRates()}
              disabled={isRefreshing}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                colors.button.secondary
              )}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh All'}
            </button>
            <button
              onClick={() => setShowCurrencySelector(true)}
              disabled={isLoading}
              className={cn(
                "px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                colors.button.primary
              )}
            >
              {isLoading ? 'Loading...' : 'Add Pair'}
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Currency Pairs Section */}
          <div className="xl:col-span-3">
            <div className={cn("rounded-lg shadow-sm", colors.background.card, colors.border.primary, "border")}>
              <div className={cn("p-4", colors.border.primary, "border-b")}>
                <h2 className={cn("text-xl font-semibold", colors.text.primary)}>Currency Pairs</h2>
              </div>
              
              <div className="p-4">
                {watchedPairs.length > 0 && (
                  <DragDropContext onDragEnd={(result) => void handleDragEnd(result)}>
                    <Droppable droppableId="currency-pairs">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                          {watchedPairs.map((pair, index) => (
                            <Draggable key={pair.id} draggableId={pair.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
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
                    <p className={cn("text-lg mb-4", colors.text.tertiary)}>No currency pairs added yet</p>
                    <button
                      onClick={() => setShowCurrencySelector(true)}
                      className={cn("px-6 py-3 rounded-lg transition-colors", colors.button.primary)}
                    >
                      Add Your First Pair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Alerts Panel */}
            <div className={cn("rounded-lg shadow-sm", colors.background.card, colors.border.primary, "border")}>
              <div className={cn("p-4", colors.border.primary, "border-b")}>
                <h3 className={cn("text-lg font-semibold", colors.text.primary)}>Alerts</h3>
              </div>
              <div className="p-4 max-h-80 overflow-y-auto">
                <AlertsPanel />
              </div>
            </div>

            {/* News Panel */}
            <div className={cn("rounded-lg shadow-sm", colors.background.card, colors.border.primary, "border")}>
              <div className={cn("p-4", colors.border.primary, "border-b")}>
                <div className="flex items-center justify-between">
                  <h3 className={cn("text-lg font-semibold", colors.text.primary)}>News</h3>
                  <div className="flex items-center space-x-2">
                    <select
                      className={cn(
                        "text-xs p-1 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent",
                        colors.border.secondary,
                        colors.background.secondary,
                        colors.text.primary,
                        "border"
                      )}
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
                      className={cn(
                        "p-1 rounded transition-colors",
                        "hover:bg-gray-200"
                      )}
                      title="Refresh news"
                      onClick={() => {
                        // Trigger refresh in NewsPanel
                        const event = new CustomEvent('refreshNews');
                        window.dispatchEvent(event);
                      }}
                    >
                      <svg className={cn("w-4 h-4", colors.text.muted)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 max-h-80 overflow-y-auto">
                <NewsPanel selectedCountry={newsCountry} />
              </div>
            </div>

            {/* YouTube Panel */}
            <div className={cn("rounded-lg shadow-sm", colors.background.card, colors.border.primary, "border")}>
              <div className="h-80">
                <YouTubePanel />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCurrencySelector && (
        <CurrencySelector
          onClose={() => setShowCurrencySelector(false)}
          onSelect={(baseCurrency, targetCurrency) => void handleAddPair(baseCurrency, targetCurrency)}
        />
      )}
    </div>
  );
};

export default ForexDashboard;
