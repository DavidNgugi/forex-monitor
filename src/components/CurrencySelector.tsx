import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';

interface CurrencySelectorProps {
  onSelect: (baseCurrency: string, targetCurrency: string) => void;
  onClose: () => void;
}

const currencies = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪' },
  { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬' },
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
  { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬' },
  { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭' },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽' },
  { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺' },
  { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
];

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ onSelect, onClose }) => {
  const { colors } = useTheme();
  const [baseCurrency, setBaseCurrency] = useState('');
  const [targetCurrency, setTargetCurrency] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCurrencies = currencies.filter(currency =>
    currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (baseCurrency && targetCurrency && baseCurrency !== targetCurrency) {
      onSelect(baseCurrency, targetCurrency);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${colors.background.modal} rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden`}>
        <div className={`flex justify-between items-center p-6 ${colors.border.primary} border-b`}>
          <h2 className={`text-xl font-semibold ${colors.text.primary}`}>Add Currency Pair</h2>
          <button onClick={onClose} className={`${colors.text.muted} hover:${colors.text.secondary}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${colors.text.muted} w-5 h-5`} />
              <input
                type="text"
                placeholder="Search currencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 ${colors.border.secondary} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${colors.background.secondary} ${colors.text.primary}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className={`block text-sm font-medium ${colors.text.secondary} mb-2`}>
                Base Currency
              </label>
              <div className={`space-y-2 max-h-48 overflow-y-auto ${colors.border.primary} border rounded-lg p-2`}>
                {filteredCurrencies.map((currency) => (
                  <button
                    key={`base-${currency.code}`}
                    onClick={() => setBaseCurrency(currency.code)}
                    className={`w-full text-left p-2 rounded-lg flex items-center space-x-2 hover:${colors.background.tertiary} ${
                      baseCurrency === currency.code ? `${colors.background.tertiary} ${colors.border.accent}` : ''
                    }`}
                  >
                    <span className="text-xl">{currency.flag}</span>
                    <div>
                      <div className={`font-medium ${colors.text.primary}`}>{currency.code}</div>
                      <div className={`text-sm ${colors.text.tertiary}`}>{currency.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${colors.text.secondary} mb-2`}>
                Target Currency
              </label>
              <div className={`space-y-2 max-h-48 overflow-y-auto ${colors.border.primary} border rounded-lg p-2`}>
                {filteredCurrencies.map((currency) => (
                  <button
                    key={`target-${currency.code}`}
                    onClick={() => setTargetCurrency(currency.code)}
                    className={`w-full text-left p-2 rounded-lg flex items-center space-x-2 hover:${colors.background.tertiary} ${
                      targetCurrency === currency.code ? `${colors.background.tertiary} ${colors.border.accent}` : ''
                    }`}
                  >
                    <span className="text-xl">{currency.flag}</span>
                    <div>
                      <div className={`font-medium ${colors.text.primary}`}>{currency.code}</div>
                      <div className={`text-sm ${colors.text.tertiary}`}>{currency.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {baseCurrency && targetCurrency && (
            <div className={`mb-6 p-4 ${colors.background.tertiary} rounded-lg`}>
              <div className="text-center">
                <span className="text-2xl">{currencies.find(c => c.code === baseCurrency)?.flag}</span>
                <span className={`mx-2 font-semibold ${colors.text.primary}`}>{baseCurrency}</span>
                <span className={colors.text.muted}>/</span>
                <span className={`mx-2 font-semibold ${colors.text.primary}`}>{targetCurrency}</span>
                <span className="text-2xl">{currencies.find(c => c.code === targetCurrency)?.flag}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 ${colors.border.secondary} border rounded-lg hover:${colors.background.tertiary} transition-colors ${colors.text.secondary}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!baseCurrency || !targetCurrency || baseCurrency === targetCurrency}
              className={`flex-1 px-4 py-2 ${colors.button.primary} rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            >
              Add Pair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencySelector;
