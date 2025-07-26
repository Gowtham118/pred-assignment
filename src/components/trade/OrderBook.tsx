import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { OrderBookRow } from '../../types/trade';
import { useMarketStore } from '../../stores/useMarketStore';

interface OrderBookProps {
  symbol: string;
}

const OrderBook: React.FC<OrderBookProps> = ({ symbol }) => {
  const { currentPrice } = useMarketStore();

  // Generate order book based on current price with memoization to prevent flickering
  const orderBook = useMemo(() => {
    const sellOrders = [];
    const buyOrders = [];
    
    // Generate sell orders (higher prices)
    for (let i = 0; i < 5; i++) {
      const price = currentPrice + (i + 1) * 0.5;
      // Vary the quantity realistically (100-2000 shares)
      const shares = Math.floor(Math.random() * 1900) + 100;
      sellOrders.push({ price, shares });
    }
    
    // Generate buy orders (lower prices)
    for (let i = 0; i < 5; i++) {
      const price = currentPrice - (i + 1) * 0.5;
      // Vary the quantity realistically (100-2000 shares)
      const shares = Math.floor(Math.random() * 1900) + 100;
      buyOrders.push({ price, shares });
    }
    
    return {
      sellOrders: sellOrders.sort((a, b) => b.price - a.price), // Highest first
      buyOrders: buyOrders.sort((a, b) => a.price - b.price)   // Lowest first
    };
  }, [currentPrice]);

  return (
    <motion.div 
      className="bg-white"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div 
        className="flex justify-between mb-2 text-sm text-gray-600"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span className="text-xs font-medium">Price</span>
        <span className="whitespace-nowrap text-xs font-medium">Shares ({symbol})</span>
      </motion.div>

      {/* Sell Orders */}
      <AnimatePresence>
        {orderBook.sellOrders.map((order, index) => (
          <motion.div
            key={`sell-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
            className="py-[1px] text-sm hover:bg-red-100 transition-colors"
            whileHover={{ scale: 1.01 }}
          >
            <div className='flex justify-between py-[1px] bg-[#A900221A]'>
            <span className=" font-medium">{order.price.toFixed(0)}¢</span>
            <span className="text-black font-medium">{order.shares.toFixed(2)}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Mid Price */}
      <motion.div 
        className="flex items-center justify-center py-2"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPrice}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-[135px] flex items-center justify-between text-sm font-bold text-black"
            >
            <span>{currentPrice.toFixed(0)}¢</span>
            <span className="text-[10px] text-black font-medium">(Spread 1%)</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Buy Orders */}
      <AnimatePresence>
        {orderBook.buyOrders.map((order, index) => (
          <motion.div
            key={`buy-${index}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: index * 0.05 }}
            className="py-[1px] text-sm hover:bg-green-100 transition-colors"
            whileHover={{ scale: 1.01 }}
          >
            <div className='flex justify-between py-[1px] bg-[#06A9001A]'>
            <span className=" font-medium">{order.price.toFixed(0)}¢</span>
            <span className="text-black font-medium">{order.shares.toFixed(2)}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrderBook; 