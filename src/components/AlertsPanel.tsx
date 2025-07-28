import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Bell, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../lib/ThemeContext';

const AlertsPanel: React.FC = () => {
  const { colors } = useTheme();
  const alerts = useQuery(api.forex.getUserAlerts);
  const deleteAlert = useMutation(api.forex.deleteAlert);

  const handleDeleteAlert = async (alertId: any) => {
    try {
      await deleteAlert({ alertId });
      toast.success('Alert deleted');
    } catch (error) {
      toast.error('Failed to delete alert');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className={`p-4 ${colors.border.primary} border-b`}>
        <div className="flex items-center space-x-2">
          <Bell className={`w-5 h-5 ${colors.status.warning}`} />
          <h3 className={`font-semibold ${colors.text.primary}`}>Price Alerts</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {alerts && alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className={`p-3 rounded-lg border ${
                  alert.triggered 
                    ? `${colors.status.error}/50 ${colors.status.error}/200 border-${colors.status.error}/200` 
                    : `${colors.background.tertiary} ${colors.border.primary} border-${colors.border.primary}`
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className={`font-medium text-sm ${colors.text.primary}`}>
                      {alert.baseCurrency}/{alert.targetCurrency}
                    </div>
                    <div className={`text-xs ${colors.text.secondary}`}>
                      {alert.condition} {alert.targetRate.toFixed(4)}
                    </div>
                    {alert.triggered && (
                      <div className={`text-xs ${colors.status.error} font-medium`}>
                        TRIGGERED
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => void handleDeleteAlert(alert._id)}
                    className={`${colors.text.muted} hover:${colors.status.error} transition-colors`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center ${colors.text.tertiary} py-8`}>
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No alerts set</p>
            <p className="text-xs">Create alerts from currency pair cards</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
