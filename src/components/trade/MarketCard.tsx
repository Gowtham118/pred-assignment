import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MarketData } from '../../types/trade';
import { useTradeEngine } from '../../hooks';

interface MarketCardProps {
  market?: MarketData;
}

const MarketCard: React.FC<MarketCardProps> = ({ 
  market = {
    name: 'Chennai Super Kings',
    symbol: 'CSK',
    price: 34,
    change: 0.84,
    changePercent: 0.84,
    volume: '$65.2M Vol.',
    logo: 'CSK'
  }
}) => {
  const { currentPrice } = useTradeEngine();
  
  // Memoize price change calculation to prevent unnecessary re-renders
  const { priceChangePercent } = useMemo(() => {
    const priceChange = currentPrice - market.price;
    const changePercent = market.price > 0 ? (priceChange / market.price) * 100 : 0;
    return { priceChangePercent: changePercent };
  }, [currentPrice, market.price]);

  return (
    <motion.div 
      className="bg-white p-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/icons/csk.svg" alt="CSK" className="w-12 h-12" />
          <div className='flex flex-col items-start'>
            <h2 className="text-lg font-bold text-black font-semibold whitespace-nowrap">{market.name}</h2>
            <p className="text-xs text-[#8F8F8F] font-[500]">{market.volume}</p>
          </div>
        </div>
        <div className="text-right">
          <div className='flex justify-between align-middle items-center space-x-2'>
            <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPrice}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xl font-semibold text-black"
            >
              {currentPrice.toFixed(0)}¢
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center space-x-1">
            <AnimatePresence mode="wait">
              <motion.span
                key={priceChangePercent}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`text-xs font-medium ${
                  priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </motion.span>
            </AnimatePresence>
          </div>
          </div>
            <motion.img 
              src="/icons/chart-bar.svg" 
              alt="Chart" 
              className="w-9 h-9"
              whileHover={{ scale: 1.2, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketCard; 