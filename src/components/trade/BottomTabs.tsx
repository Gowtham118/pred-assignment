import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTradeEngine } from '../../hooks/useTradeEngine';
import { useOrderbookStore } from '../../stores/useOrderbookStore';
import type { TabType } from '../../types/trade';

const BottomTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const { cancelOrder, closePosition } = useTradeEngine();
  const { openOrders, positions, tradeHistory } = useOrderbookStore();

  // Debug logging
  React.useEffect(() => {
    console.log('BottomTabs Data:', {
      openOrders: openOrders.length,
      positions: positions.length,
      tradeHistory: tradeHistory.length,
      openOrdersData: openOrders,
      positionsData: positions,
      tradeHistoryData: tradeHistory
    });
  }, [openOrders, positions, tradeHistory]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(',', '');
  };

  const calculateProgress = (order: any) => {
    const elapsed = Date.now() - new Date(order.timestamp).getTime();
    const total = 30000; // 30 seconds
    return Math.min(100, (elapsed / total) * 100);
  };

  const handleCancelOrder = async (orderId: string) => {
    // Add a small delay for the animation
    await new Promise(resolve => setTimeout(resolve, 200));
    cancelOrder(orderId);
  };

  const handleClosePosition = async (positionId: string) => {
    // Add a small delay for the animation
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
            className={`p-2 ml-3 font-medium text-xs uppercase transition-colors
              ${activeTab === tab.id
                ? 'text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                : 'text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
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
            className="max-h-[300px] overflow-y-auto"
          >
            {activeTab === 'orders' && (
              <div
                className="space-y-3 p-2"
                role="tabpanel"
                id="orders-panel"
                aria-labelledby="orders-tab"
              >
                {openOrders.length === 0 ? (
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
                      {openOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{ duration: 0.3 }}
                          className="px-6 py-3 focus-within:ring-2 focus-within:ring-blue-500"
                        role="article"
                        aria-label={`Order for ${order.symbol} - ${order.type}`}
                      >
                          <div className="flex justify-between items-start mb-[2px]">
                          <div>
                              <div className="flex flex-col items-start text-sm font-medium text-black" aria-label={`Symbol and type: ${order.symbol} - ${order.type}`}>
                                <span>{order.symbol} / IPL Winner</span>
                                <div className="flex justify-between items-center text-[10px] space-x-1 font-light text-gray-600" aria-label={`Order time: ${formatTimestamp(new Date(order.timestamp).getTime())}`}>
                                  <span className={`${order.side === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                                    {order.type.charAt(0).toUpperCase() + order.type.slice(1)}/{order.side.charAt(0).toUpperCase() + order.side.slice(1)}
                                  </span>
                                  <span>{formatTimestamp(new Date(order.timestamp).getTime())}</span>
                                </div>
                            </div>

                            </div>
                            <div className="flex items-end justify-between gap-x-2">
                              <div className="flex flex-col items-center">
                                <div className="text-[10px] text-gray-600">
                                  {calculateProgress(order).toFixed(0)}%
                                </div>
                                <div
                                  className="w-[45px] bg-gray-200 rounded-full h-2"
                                  role="progressbar"
                                  aria-valuenow={calculateProgress(order)}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                  aria-label={`Order progress: ${calculateProgress(order).toFixed(0)}%`}
                                >
                                  <motion.div
                                    className="bg-gray-600 h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${calculateProgress(order)}%` }}
                                    transition={{ duration: 0.5 }}
                                  />
                                </div>
                              </div>

                              <motion.button
                                onClick={() => handleCancelOrder(order.id)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCancelOrder(order.id)}
                                aria-label={`Cancel order for ${order.symbol}`}
                                title={`Cancel order for ${order.symbol}`}
                                className="px-3 py-1 bg-[#EAEAEA] text-black text-sm rounded hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Cancel
                              </motion.button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-[10px] space-x-1 font-light text-gray-600" aria-label={`Order time: ${formatTimestamp(new Date(order.timestamp).getTime())}`}>
                            <span>Filled / Amount</span>
                            <span>{Math.round((calculateProgress(order) / 100) * order.size)} / {order.size}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] space-x-1 font-light text-gray-600" aria-label={`Order time: ${formatTimestamp(new Date(order.timestamp).getTime())}`}>
                            <span>Price</span>
                            <span>{order.price.toFixed(0)}¢</span>
                          </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            )}

            {activeTab === 'positions' && (
              <div
                className="space-y-3 p-2"
                role="tabpanel"
                id="positions-panel"
                aria-labelledby="positions-tab"
              >
                {positions.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-700 py-8 font-['IBM_Plex_Sans']"
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
                        className="px-6 py-3 focus-within:ring-2 focus-within:ring-blue-500"
                        role="article"
                        aria-label={`Position for ${position.symbol} - ${position.side}`}
                      >
                        <div className="flex justify-between items-start mb-[2px]">
                          <div>
                            <div className="flex flex-col items-start text-sm font-medium text-black" aria-label={`Symbol and side: ${position.symbol} - ${position.side}`}>
                              <span>{position.symbol} / IPL Winner</span>
                              <div className="flex justify-between items-center text-[10px] space-x-1 font-light text-gray-600">
                                <span className={`${position.side === 'long' ? 'text-green-600' : 'text-red-600'}`}>
                                  {position.side.charAt(0).toUpperCase() + position.side.slice(1)}
                                </span>
                                <span>{formatTimestamp(position.entryTimestamp)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-end justify-between gap-x-2">
                            <div className="flex flex-col items-center">
                              <div className="text-[10px] text-gray-600">
                                P&L
                              </div>
                              <div className={`text-[10px] font-medium ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                              </div>
                            </div>
                            <motion.button
                              onClick={() => handleClosePosition(position.id)}
                              onKeyDown={(e) => e.key === 'Enter' && handleClosePosition(position.id)}
                              aria-label={`Close position for ${position.symbol}`}
                              title={`Close position for ${position.symbol}`}
                              className="px-3 py-1 bg-[#EAEAEA] text-black text-sm rounded hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Close
                            </motion.button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] space-x-1 font-light text-gray-600">
                          <span>Size</span>
                          <span>{position.size} shares</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] space-x-1 font-light text-gray-600">
                          <span>Entry Price</span>
                          <span>{position.entryPrice.toFixed(0)}¢</span>
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
                className="p-2"
              >
                {tradeHistory.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-700 py-8 font-['IBM_Plex_Sans']"
                    aria-live="polite"
                  >
                    No trade history yet
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {tradeHistory.slice().reverse().map((trade) => (
                        <motion.div
                          key={trade.id}
                          initial={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="px-6 py-3 focus-within:ring-2 focus-within:ring-blue-500"
                          role="article"
                          aria-label={`Trade for ${trade.symbol} - ${trade.side}`}
                        >
                          <div className="flex justify-between items-start mb-[2px]">
                            <div>
                              <div className="flex flex-col items-start text-sm font-medium text-black" aria-label={`Symbol and side: ${trade.symbol} - ${trade.side}`}>
                                <span>{trade.symbol} / IPL Winner</span>
                                <div className="flex justify-between items-center text-[10px] space-x-1 font-light text-gray-600">
                                  <span className={`${trade.side === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                                    {trade.side.charAt(0).toUpperCase() + trade.side.slice(1)}
                                  </span>
                                  <span>{formatTimestamp(trade.timestamp)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-end justify-between gap-x-2">
                              <div className="flex flex-col items-center">
                                <div className="text-[10px] text-gray-600">
                                  Amount
                                </div>
                                <div className="text-[10px] font-medium text-black">
                                  ${(trade.price * trade.size / 100).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-[10px] space-x-1 font-light text-gray-600">
                            <span>Size</span>
                            <span>{trade.size} shares</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] space-x-1 font-light text-gray-600">
                            <span>Price</span>
                            <span>{trade.price.toFixed(0)}¢</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] space-x-1 font-light text-gray-600">
                            <span>Fee</span>
                            <span>${trade.fee.toFixed(2)}</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BottomTabs; 
