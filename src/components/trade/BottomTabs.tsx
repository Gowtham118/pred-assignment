import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTradeManager, type Order, type Position } from '../../hooks';
import type { TabType } from '../../types/trade';

const BottomTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const { orders, positions, cancelOrder, closePosition } = useTradeManager();

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const calculateProgress = (order: Order) => {
    const elapsed = Date.now() - new Date(order.timestamp).getTime();
    const total = 30000; // 30 seconds
    return Math.min(100, (elapsed / total) * 100);
  };

  const handleCancelOrder = async (orderId: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    cancelOrder(orderId);
  };

  const handleClosePosition = async (positionId: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    closePosition(positionId);
  };

  // Keyboard navigation for tabs
  const handleKeyDown = (event: React.KeyboardEvent, tabId: TabType) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setActiveTab(tabId);
        break;
      case 'ArrowRight':
        event.preventDefault();
        const nextTab = tabs.find(tab => tab.id === tabId);
        const nextIndex = (tabs.findIndex(tab => tab.id === tabId) + 1) % tabs.length;
        setActiveTab(tabs[nextIndex].id);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = (tabs.findIndex(tab => tab.id === tabId) - 1 + tabs.length) % tabs.length;
        setActiveTab(tabs[prevIndex].id);
        break;
    }
  };

  const tabs = [
    { id: 'orders' as TabType, label: 'OPEN ORDERS' },
    { id: 'positions' as TabType, label: 'POSITIONS' },
    { id: 'history' as TabType, label: 'TRADE HISTORY' }
  ];

  return (
    <div 
      className="bg-white py-1 border-y mt-6 border-gray-200"
      role="tablist"
      aria-label="Trading interface tabs"
    >
      {/* Tab Headers */}
      <div className="flex justify-start border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={`flex-1 py-2 px-2 font-medium text-xs tracking-wider uppercase transition-colors
              ${activeTab === tab.id
                ? 'text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                : 'text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
            style={{ letterSpacing: '0.08em' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {activeTab === 'orders' && (
              <div 
                className="space-y-3"
                role="tabpanel"
                id="orders-panel"
                aria-labelledby="orders-tab"
              >
                {orders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-700 py-8 font-['IBM_Plex_Sans']"
                    aria-live="polite"
                  >
                    No open orders
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {orders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500"
                        role="article"
                        aria-label={`Order for ${order.symbol} - ${order.type}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-black font-['IBM_Plex_Sans']" aria-label={`Symbol and type: ${order.symbol} - ${order.type}`}>
                              {order.symbol} - {order.type}
                            </div>
                            <div className="text-sm text-gray-700 font-['IBM_Plex_Sans']" aria-label={`Shares and price: ${order.shares} shares at ${order.price.toFixed(0)} cents`}>
                              {order.shares} shares @ {order.price.toFixed(0)}¢
                            </div>
                            <div className="text-xs text-gray-600 font-['IBM_Plex_Sans']" aria-label={`Order time: ${formatTimestamp(order.timestamp)}`}>
                              {formatTimestamp(order.timestamp)}
                            </div>
                          </div>
                          <motion.button
                            onClick={() => handleCancelOrder(order.id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCancelOrder(order.id)}
                            aria-label={`Cancel order for ${order.symbol}`}
                            title={`Cancel order for ${order.symbol}`}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Cancel
                          </motion.button>
                        </div>
                        <div 
                          className="w-full bg-gray-200 rounded-full h-2"
                          role="progressbar"
                          aria-valuenow={calculateProgress(order)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Order progress: ${calculateProgress(order).toFixed(0)}%`}
                        >
                          <motion.div
                            className="bg-blue-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${calculateProgress(order)}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            )}

            {activeTab === 'positions' && (
              <div 
                className="space-y-3"
                role="tabpanel"
                id="positions-panel"
                aria-labelledby="positions-tab"
              >
                {positions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-700 py-8"
                    aria-live="polite"
                  >
                    No positions yet
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {positions.map((position) => (
                      <motion.div
                        key={position.id}
                        initial={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500"
                        role="article"
                        aria-label={`Position for ${position.symbol} - ${position.side}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-black" aria-label={`Symbol and side: ${position.symbol} - ${position.side}`}>
                              {position.symbol} - {position.side}
                            </div>
                            <div className="text-sm text-gray-700" aria-label={`Shares and entry price: ${position.shares} shares at ${position.entryPrice.toFixed(0)} cents`}>
                              {position.shares} shares @ {position.entryPrice.toFixed(0)}¢
                            </div>
                            <div className={`text-sm font-semibold ${
                              position.pnl >= 0 ? 'text-green-700' : 'text-red-700'
                            }`}>
                              P&L: ${position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                            </div>
                          </div>
                          <motion.button
                            onClick={() => handleClosePosition(position.id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleClosePosition(position.id)}
                            aria-label={`Close position for ${position.symbol}`}
                            title={`Close position for ${position.symbol}`}
                            className="px-3 py-1 bg-gray-800 text-white text-sm rounded hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Close
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div
                role="tabpanel"
                id="history-panel"
                aria-labelledby="history-tab"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-700 py-8 font-['IBM_Plex_Sans']"
                  aria-live="polite"
                >
                  Trade history will appear here
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BottomTabs; 