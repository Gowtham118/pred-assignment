import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTradeEngine } from '../../hooks/useTradeEngine';
import { useMarketStore } from '../../stores/useMarketStore';

interface TradeControlsProps {
  symbol: string;
}

const TradeControls: React.FC<TradeControlsProps> = ({ symbol }) => {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [price, setPrice] = useState('');
  const [shares, setShares] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOrderTypeDropdown, setShowOrderTypeDropdown] = useState(false);

  const { placeOrder, balance } = useTradeEngine();

  const { currentPrice: marketPrice } = useMarketStore();

  // Set initial price to current market price when component mounts
  useEffect(() => {
    if (marketPrice > 0) {
      setPrice(marketPrice.toFixed(0));
    }
  }, [marketPrice]);

  // Calculate order total (price is in cents, convert to dollars)
  const orderTotal = useMemo(() => {
    const priceNum = parseFloat(price || '0');
    const sharesNum = parseFloat(shares || '0');
    return (priceNum / 100) * sharesNum;
  }, [price, shares]);

  // Calculate potential profit (To Win)
  const toWin = useMemo(() => {
    const priceNum = parseFloat(price || '0');
    const sharesNum = parseFloat(shares || '0');

    if (priceNum <= 0 || sharesNum <= 0) return 0;

    // For buy orders: potential profit if price goes up 10%
    // For sell orders: potential profit if price goes down 10%
    if (tradeType === 'buy') {
      const potentialSellPrice = priceNum * 1.1; // 10% increase
      const profit = (potentialSellPrice - priceNum) / 100 * sharesNum;
      return Math.max(0, profit);
    } else {
      const potentialBuyPrice = priceNum * 0.9; // 10% decrease
      const profit = (priceNum - potentialBuyPrice) / 100 * sharesNum;
      return Math.max(0, profit);
    }
  }, [price, shares, tradeType]);

  // Handle percentage slider change
  const handlePercentageChange = (newPercentage: number) => {
    setPercentage(newPercentage);
    // Calculate shares based on percentage of available balance
    const priceNum = parseFloat(price || '1');
    if (priceNum > 0) {
      const newShares = (newPercentage / 100) * balance / (priceNum / 100);
      setShares(newShares.toFixed(2));
    }
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
      const priceNum = parseFloat(price || '1');
      if (priceNum > 0 && balance > 0) {
        const newPercentage = (sharesNum * (priceNum / 100) / balance) * 100;
        setPercentage(Math.min(100, Math.max(0, newPercentage)));
      }
    }
  };

  // Handle price input change (numbers only)
  const handlePriceChange = (newPrice: string) => {
    if (newPrice === '' || isValidNumber(newPrice)) {
      setPrice(newPrice);
      // Recalculate shares when price changes
      const priceNum = parseFloat(newPrice || '1');
      if (priceNum > 0 && balance > 0) {
        const newShares = (percentage / 100) * balance / (priceNum / 100);
        setShares(newShares.toFixed(2));
      }
    }
  };

  // Handle order type change
  const handleOrderTypeChange = (newOrderType: 'market' | 'limit') => {
    setOrderType(newOrderType);
    setShowOrderTypeDropdown(false);

    // For market orders, set price to current market price
    if (newOrderType === 'market') {
      setPrice(marketPrice.toFixed(0));
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.order-type-dropdown')) {
        setShowOrderTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle order submission with animation
  const handleSubmit = async () => {
    const sharesNum = parseFloat(shares);
    const priceNum = parseFloat(price);

    console.log('Submitting order:', {
      symbol,
      orderType,
      tradeType,
      sharesNum,
      priceNum,
      marketPrice,
      balance
    });

    // For market orders, we don't need to validate price input
    if (orderType === 'market') {
      if (isPositiveNumber(shares)) {
        setIsSubmitting(true);

        // Add a small delay to show the animation
        await new Promise(resolve => setTimeout(resolve, 300));

        // Use current market price for market orders
        const orderId = placeOrder(symbol, orderType, tradeType, marketPrice, sharesNum);
        console.log('Market order placed with ID:', orderId);

        // Reset form
        setShares('');
        setPercentage(0);
        setIsSubmitting(false);
      }
    } else {
    // For limit orders, validate both price and shares
      if (isPositiveNumber(shares) && isPositiveNumber(price)) {
        setIsSubmitting(true);

        // Add a small delay to show the animation
        await new Promise(resolve => setTimeout(resolve, 300));

        const orderId = placeOrder(symbol, orderType, tradeType, priceNum, sharesNum);
        console.log('Limit order placed with ID:', orderId);

        // Reset form
        setShares('');
        setPercentage(0);
        setIsSubmitting(false);
      }
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
        className="relative order-type-dropdown"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <button
          onClick={() => setShowOrderTypeDropdown(!showOrderTypeDropdown)}
          className="w-full flex items-center bg-gray-100 h-6 rounded-[4px] p-2 border border-[#E9E9E9] hover:bg-gray-200 transition-colors"
        >
          <img src="/icons/info.svg" alt="Info" className="w-4 h-4 mr-2" />
          <span className="text-black text-xs font-medium capitalize">{orderType}</span>
          <img
            src="/icons/chevron-down.svg"
            alt="Dropdown"
            className={`w-4 h-4 ml-auto transition-transform ${showOrderTypeDropdown ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showOrderTypeDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-[4px] shadow-lg z-10"
            >
              <button
                onClick={() => handleOrderTypeChange('market')}
                className={`w-full px-3 py-2 text-left text-xs font-medium hover:bg-gray-50 transition-colors ${orderType === 'market' ? 'bg-gray-100 text-black' : 'text-gray-700'
                  }`}
              >
                Market
              </button>
              <button
                onClick={() => handleOrderTypeChange('limit')}
                className={`w-full px-3 py-2 text-left text-xs font-medium hover:bg-gray-50 transition-colors ${orderType === 'limit' ? 'bg-gray-100 text-black' : 'text-gray-700'
                  }`}
              >
                Limit
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className='text-sm font-medium text-black flex justify-between'>
        <p className='underline'>Available to trade</p>
        <p>{balance.toFixed(2)} USDC</p>
      </div>

      {/* Price Input */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className={`w-full h-9 py-3 px-1 border border-gray-300 rounded-[4px] bg-gray-50 text-black font-bold flex items-center justify-between ${!isPositiveNumber(price) && price !== '' && orderType === 'limit' ? 'border-red-400' : ''}`}>
          <span className="text-sm text-gray-500 font-medium">Price (USD)</span>
          {orderType === 'market' ? (
            <span className="flex-1 min-w-0 text-sm text-black font-bold bg-transparent px-2 text-right">
              {marketPrice.toFixed(0)}¢
            </span>
          ) : (
              <input
                type="text"
                value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="flex-1 min-w-0 text-sm text-black font-bold bg-transparent border-none outline-none px-2"
                style={{ textAlign: 'right' }}
                placeholder="Enter price"
              />
          )}
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
          <span className="text-black font-['IBM_Plex_Sans'] font-medium">${toWin.toFixed(2)}</span>
        </div>
      </motion.div>

      {/* Submit Button with Bounce Animation */}
      <AnimatePresence>
        <motion.button 
          onClick={handleSubmit}
          disabled={
            !isPositiveNumber(shares) ||
            (orderType === 'limit' && !isPositiveNumber(price)) ||
            orderTotal > balance ||
            isSubmitting
          }
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