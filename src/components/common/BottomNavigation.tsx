import React from 'react';
import { useTradeManager } from '../../hooks';

const BottomNavigation: React.FC = () => {
  const { availableBalance, totalPnl } = useTradeManager();
  const totalBalance = availableBalance + totalPnl;

  return (
    <div className="flex justify-around items-center py-3 bg-white border-t border-gray-200">
      <div className="flex flex-col items-center space-y-1">
        <img src="public/icons/markets.svg" alt="Markets" className="w-6 h-6" />
        <span className="text-xs text-gray-600 font-['IBM_Plex_Sans'] font-medium">Markets</span>
      </div>
      <div className="flex flex-col items-center space-y-1">
        <img src="public/icons/lightning.svg" alt="Trade" className="w-6 h-6" />
        <span className="text-xs text-black font-semibold">Trade</span>
      </div>
      <div className="flex flex-col items-center space-y-1">
        <img src="public/icons/wallet.svg" alt="Wallet" className="w-6 h-6" />
        <span className={`text-xs font-medium ${
          totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          ${totalBalance.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-col items-center space-y-1">
        <img src="public/icons/menu.svg" alt="More" className="w-6 h-6" />
        <span className="text-xs text-gray-600 font-medium">More</span>
      </div>
    </div>
  );
};

export default BottomNavigation; 