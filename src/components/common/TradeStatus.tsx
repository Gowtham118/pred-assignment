import React from 'react';
import { useTradeManager } from '../../hooks';

const TradeStatus: React.FC = () => {
  const { availableBalance, totalPnl, positions, orders } = useTradeManager();

  return (
    <div className="bg-white p-4 border-b border-gray-200">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-500 font-['IBM_Plex_Sans'] font-medium">Available Balance</div>
          <div className="text-black font-['IBM_Plex_Sans'] font-semibold">${availableBalance.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500 font-['IBM_Plex_Sans'] font-medium">Total P&L</div>
          <div className={`font-['IBM_Plex_Sans'] font-semibold ${
            totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-gray-500 font-['IBM_Plex_Sans'] font-medium">Open Positions</div>
          <div className="text-black font-['IBM_Plex_Sans'] font-semibold">{positions.length}</div>
        </div>
        <div>
          <div className="text-gray-500 font-['IBM_Plex_Sans'] font-medium">Pending Orders</div>
          <div className="text-black font-['IBM_Plex_Sans'] font-semibold">
            {orders.filter(o => o.status === 'pending').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeStatus; 