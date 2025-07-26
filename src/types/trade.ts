export interface OrderBookRow {
  price: number;
  shares: number;
  type: 'buy' | 'sell';
}

export interface OpenOrder {
  id: string;
  market: string;
  type: 'Limit' | 'Market';
  side: 'Buy' | 'Sell';
  timestamp: string;
  filled: number;
  amount: number;
  price: number;
  progress: number;
}

export interface MarketData {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  logo: string;
}

export type TradeType = 'buy' | 'sell';
export type OrderType = 'Limit' | 'Market';
export type TabType = 'orders' | 'positions' | 'history'; 