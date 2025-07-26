import { useCallback } from 'react';
import { useMarketStore } from '../stores/useMarketStore';
import { useOrderbookStore, type Order, type Position } from '../stores/useOrderbookStore';
import { useBalanceStore } from '../stores/useBalanceStore';
import { useTradeEngine } from './useTradeEngine';
import type { TradeType, OrderType } from '../types/trade';

// Legacy interface for backward compatibility
export interface LegacyOrder {
  id: string;
  symbol: string;
  type: string;
  shares: number;
  price: number;
  timestamp: string;
}

export interface LegacyPosition {
  id: string;
  symbol: string;
  side: string;
  shares: number;
  entryPrice: number;
  pnl: number;
}

export const useTradeManager = () => {
  const { currentPrice } = useMarketStore();
  const { openOrders, positions } = useOrderbookStore();
  const { balance, totalPnl } = useBalanceStore();
  const { placeOrder, cancelOrder, closePosition } = useTradeEngine();

  // Legacy function to get current price for a symbol
  const getCurrentPrice = useCallback((symbol: string) => {
    return currentPrice;
  }, [currentPrice]);

  // Legacy function to place order (maintains old interface)
  const placeOrderLegacy = useCallback((
    market: string,
    symbol: string,
    orderType: OrderType,
    tradeType: TradeType,
    shares: number,
    price: number
  ) => {
    // Convert legacy types to new types
    const newOrderType = orderType === 'Limit' ? 'limit' : 'market';
    const newTradeType = tradeType === 'buy' ? 'buy' : 'sell';

    return placeOrder(symbol, newOrderType, newTradeType, price, shares);
  }, [placeOrder]);

  // Convert new orders to legacy format
  const legacyOrders: LegacyOrder[] = openOrders.map(order => ({
    id: order.id,
    symbol: order.symbol,
    type: order.type === 'limit' ? 'Limit' : 'Market',
    shares: order.size,
    price: order.price,
    timestamp: new Date(order.timestamp).toISOString()
  }));

  // Convert new positions to legacy format
  const legacyPositions: LegacyPosition[] = positions.map(position => ({
    id: position.id,
    symbol: position.symbol,
    side: position.side,
    shares: position.size,
    entryPrice: position.entryPrice,
    pnl: position.pnl
  }));

  return {
    // Legacy interface
    availableBalance: balance,
    totalPnl,
    orders: legacyOrders,
    positions: legacyPositions,
    getCurrentPrice,
    placeOrder: placeOrderLegacy,
    cancelOrder,
    closePosition
  };
}; 