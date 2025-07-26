import React from 'react';
import { PredHeader, BottomNavigation } from './common';
import { MarketCard, TradeControls, OrderBook, BottomTabs } from './trade';

const TradeScreen: React.FC = () => {
  const marketData = {
    name: 'Chennai Super Kings',
    symbol: 'CSK',
    price: 34,
    change: 0.84,
    changePercent: 0.84,
    volume: '$65.2M Vol.',
    logo: 'CSK'
  };

  return (
    <div className="w-full font-['IBM_Plex_Sans'] flex justify-center">
      <div className="w-[412px] bg-white font-['IBM_Plex_Sans']">
        <PredHeader />
        <MarketCard market={marketData} />
        
        {/* Trade Section - Horizontal Layout */}
        <div className="flex justify-around">
          <div className="w-[214px]">
            <TradeControls symbol="CSK" />
          </div>
          <div className="w-[135px]">
            <OrderBook symbol={marketData.symbol} />
          </div>
        </div>
        
        <BottomTabs />
        <BottomNavigation />
      </div>
    </div>
  );
};

export default TradeScreen;
