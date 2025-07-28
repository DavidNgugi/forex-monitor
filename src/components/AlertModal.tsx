import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface AlertModalProps {
  pair: {
    id: string;
    baseCurrency: string;
    targetCurrency: string;
  };
  currentRate: number;
  onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ pair, currentRate, onClose }) => {
  const [targetRate, setTargetRate] = useState(currentRate.toString());
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  
  const createAlert = useMutation(api.forex.createAlert);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createAlert({
        pairId: pair.id,
        baseCurrency: pair.baseCurrency,
        targetCurrency: pair.targetCurrency,
        targetRate: parseFloat(targetRate),
        condition,
      });
      
      toast.success('Alert created successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to create alert');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Create Alert</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency Pair
            </label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="font-semibold">{pair.baseCurrency}/{pair.targetCurrency}</span>
              <span className="text-gray-500 ml-2">Current: {currentRate.toFixed(4)}</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Rate
            </label>
            <input
              type="number"
              step="0.0001"
              value={targetRate}
              onChange={(e) => setTargetRate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertModal;
