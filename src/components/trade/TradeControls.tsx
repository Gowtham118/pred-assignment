import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TradeType, OrderType } from '../../types/trade';
import { useTradeManager } from '../../hooks';

interface TradeControlsProps {
  market: string;
  symbol: string;
}

const TradeControls: React.FC<TradeControlsProps> = ({ market, symbol }) => {
  const [tradeType, setTradeType] = useState<TradeType>('buy');
  const [orderType, setOrderType] = useState<OrderType>('Limit');
  const [price, setPrice] = useState('34.5');
  const [shares, setShares] = useState('0');
  const [percentage, setPercentage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    placeOrder,
    availableBalance,
    getCurrentPrice,
  } = useTradeManager();

  const currentPrice = getCurrentPrice(symbol);

  // Update price when current price changes
  React.useEffect(() => {
    if (currentPrice > 0) {
      setPrice(currentPrice.toFixed(0));
    }
  }, [currentPrice]);

  // Calculate order total
  const orderTotal = parseFloat(price) * parseFloat(shares || '0');

  // Calculate max shares possible with available balance at current price
  const maxShares = availableBalance / parseFloat(price || '1');
  const percentageShares = (percentage / 100) * maxShares;

  // Handle percentage slider change (no effect on shares)
  const handlePercentageChange = (newPercentage: number) => {
    setPercentage(newPercentage);
    // Calculate shares based on percentage of available balance
    const newShares = (newPercentage / 100) * maxShares;
    setShares(newShares.toFixed(2));
  };

  // Input validation helpers
  const isValidNumber = (val: string) => /^\d*\.?\d*$/.test(val) && val !== '' && !isNaN(Number(val));
  const isPositiveNumber = (val: string) => isValidNumber(val) && parseFloat(val) > 0;

  // Handle shares input change (numbers only)
  const handleSharesChange = (newShares: string) => {
    if (newShares === '' || isValidNumber(newShares)) {
      setShares(newShares);
      // Update percentage based on shares input
      const sharesNum = parseFloat(newShares || '0');
      const newPercentage = maxShares > 0 ? (sharesNum / maxShares) * 100 : 0;
      setPercentage(Math.min(100, Math.max(0, newPercentage)));
    }
  };

  // Handle price input change (numbers only)
  const handlePriceChange = (newPrice: string) => {
    if (newPrice === '' || isValidNumber(newPrice)) {
      setPrice(newPrice);
      // Recalculate shares when price changes
      const newMaxShares = availableBalance / parseFloat(newPrice || '1');
      const newShares = (percentage / 100) * newMaxShares;
      setShares(newShares.toFixed(2));
    }
  };

  // Handle order submission with animation
  const handleSubmit = async () => {
    const sharesNum = parseFloat(shares);
    const priceNum = parseFloat(price);

    if (isPositiveNumber(shares) && isPositiveNumber(price)) {
      setIsSubmitting(true);
      
      // Add a small delay to show the animation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      placeOrder(market, symbol, orderType, tradeType, sharesNum, priceNum);
      
      // Reset form
      setShares('0');
      setPercentage(0);
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="bg-white space-y-2 min-w-[214px] "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Buy/Sell Toggle */}
      <div className="flex bg-gray-100 rounded-[4px] p-1">
        <motion.button
          onClick={() => setTradeType('buy')}
          className={`flex-1 py-2 px-4 rounded-[2px] text-xs font-semibold transition-colors ${
            tradeType === 'buy'
              ? 'bg-gray-800 text-white font-semibold'
              : 'text-gray-600 hover:text-gray-800 font-medium'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          BUY/LONG
        </motion.button>
        <motion.button
          onClick={() => setTradeType('sell')}
          className={`flex-1 py-2 px-4 rounded-xs text-xs font-semibold transition-colors ${
            tradeType === 'sell'
              ? 'bg-gray-800 text-white font-semibold'
              : 'text-gray-600 hover:text-gray-800 font-medium'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          SELL/SHORT
        </motion.button>
      </div>

      {/* Order Type Selector */}
      <motion.div 
        className="flex items-center bg-gray h-6 rounded-[4px] p-2 border border-[#E9E9E9]"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <img src="public/icons/info.svg" alt="Info" className="w-4 h-4 mr-2" />
        <span className="text-black text-xs font-medium">{orderType}</span>
        <img src="public/icons/chevron-down.svg" alt="Dropdown" className="w-4 h-4 ml-auto" />
      </motion.div>

      <div className='text-sm font-medium text-black flex justify-between'>
        <p className='underline'>Available to trade</p>
        <p>{availableBalance.toFixed(2)} USDC</p>
      </div>

      {/* Price Input */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className={`w-full h-9 py-3 px-1 border border-gray-300 rounded-[4px] bg-gray-50 text-black font-bold flex items-center justify-between ${!isPositiveNumber(price) && price !== '' ? 'border-red-400' : ''}`}>
          <span className="text-sm text-gray-500 font-medium">Price (USD)</span>
          <input
            type="text"
            value={price}
            onChange={(e) => handlePriceChange(e.target.value)}
            className="flex-1 min-w-0 text-sm text-black font-bold bg-transparent border-none outline-none px-2"
            style={{ textAlign: 'right' }}
          />
          <span className="text-sm text-black font-medium underline">Mid</span>
        </div>
      </motion.div>

      {/* Shares Input */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className={`w-full h-9 py-3 px-1 border border-gray-300 rounded-[4px] bg-gray-50 text-black font-medium flex items-center justify-between gap-2 ${!isPositiveNumber(shares) && shares !== '' ? 'border-red-400' : ''}`}>
          <span className="text-sm text-gray-500 font-medium">Shares</span>
          <input
            type="text"
            value={shares}
            placeholder='0'
            onChange={(e) => handleSharesChange(e.target.value)}
            className="flex-1 min-w-0 text-sm text-black font-medium bg-transparent border-none outline-none px-2"
            style={{ textAlign: 'right' }}
          />
        </div>
      </motion.div>

      {/* Percentage Slider */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            {/* Slider Track */}
            <div className="h-[1px] bg-[#D9D9D9] relative">
              {/* Tick Marks */}
              <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center">
                <div className="w-[1px] h-[7px] bg-[#D9D9D9]"></div>
                <div className="w-[1px] h-[7px] bg-[#D9D9D9]"></div>
                <div className="w-[1px] h-[7px] bg-[#D9D9D9]"></div>
                <div className="w-[1px] h-[7px] bg-[#D9D9D9]"></div>
                <div className="w-[1px] h-[7px] bg-[#D9D9D9]"></div>
              </div>
              
              {/* Slider Input */}
              <input
                type="range"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => handlePercentageChange(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {/* Custom Slider Thumb */}
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ left: `calc(${percentage}% - 8px)` }}
              >
                <div className="w-4 h-4 bg-[#D9D9D9] rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#404040] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Percentage Display Box */}
          <div className="w-12 h-9 bg-[#F5F5F5] border border-[#E9E9E9] rounded-[4px] flex items-center justify-center">
            <span className="text-sm text-black opacity-40 font-medium">
              {percentage.toFixed(0)} %
            </span>
          </div>
        </div>
      </motion.div>

      <div className='h-1 bg-[#ECECEC]'/>

      {/* Order Summary */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-between text-sm">
          <span className="text-black font-['IBM_Plex_Sans'] font-medium">Order Total</span>
          <span className="text-black font-['IBM_Plex_Sans'] font-medium">${orderTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-black font-['IBM_Plex_Sans'] font-medium">To Win 💵</span>
          <span className="text-black font-['IBM_Plex_Sans'] font-medium">${orderTotal.toFixed(2)}</span>
        </div>
      </motion.div>

      {/* Submit Button with Bounce Animation */}
      <AnimatePresence>
        <motion.button 
          onClick={handleSubmit}
          disabled={!isPositiveNumber(shares) || !isPositiveNumber(price) || orderTotal > availableBalance || isSubmitting}
          className="w-full h-9 bg-gray-700 text-white font-semibold rounded-[4px] border border-gray-300 shadow-sm hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed disabled:border-gray-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          animate={isSubmitting ? { 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={isSubmitting ? {
            duration: 0.3,
            repeat: 1,
            repeatType: "reverse"
          } : {
            type: "spring",
            stiffness: 400,
            damping: 10
          }}
        >
          {isSubmitting ? 'Processing...' : `${tradeType.toUpperCase() === 'BUY' ? 'BUY/LONG' : 'SELL/SHORT'} ${symbol}`}
        </motion.button>
      </AnimatePresence>
    </motion.div>
  );
};

export default TradeControls; 