import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { OrderType, TradeType } from '../types/trade';

// Extended types for trade management
export interface Position {
  id: string;
  market: string;
  symbol: string;
  side: 'long' | 'short';
  shares: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  timestamp: string;
}

export interface Order {
  id: string;
  market: string;
  symbol: string;
  type: OrderType;
  side: TradeType;
  shares: number;
  price: number;
  status: 'pending' | 'filled' | 'cancelled' | 'partial';
  filledShares: number;
  timestamp: string;
  expiresAt?: string;
}

export interface TradeState {
  positions: Position[];
  orders: Order[];
  availableBalance: number;
  totalPnl: number;
}

const INITIAL_TRADE_STATE: TradeState = {
  positions: [],
  orders: [],
  availableBalance: 1000, // Starting with $1000 USDC
  totalPnl: 0,
};

// Dummy price data for simulation
const DUMMY_PRICES: Record<string, { price: number; volatility: number }> = {
  CSK: { price: 34, volatility: 0.5 },
  MI: { price: 28, volatility: 0.4 },
  RCB: { price: 32, volatility: 0.6 },
  KKR: { price: 30, volatility: 0.3 },
};

export function useTradeManager() {
  const [tradeState, setTradeState] = useLocalStorage<TradeState>('tradeState', INITIAL_TRADE_STATE);
  const [currentPrices, setCurrentPrices] = useLocalStorage<Record<string, number>>('currentPrices', {
    CSK: 34,
    MI: 28,
    RCB: 32,
    KKR: 30,
  });

  const intervalRef = useRef<number | null>(null);

  // Generate a unique ID
  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  // Simulate price movements
  const simulatePriceMovement = useCallback(() => {
    setCurrentPrices(prevPrices => {
      const newPrices: Record<string, number> = {};
      
      Object.entries(prevPrices).forEach(([symbol, currentPrice]) => {
        const config = DUMMY_PRICES[symbol];
        if (config) {
          // Random price movement based on volatility
          const change = (Math.random() - 0.5) * config.volatility;
          const newPrice = Math.max(0.01, currentPrice + change);
          newPrices[symbol] = parseFloat(newPrice.toFixed(2));
        }
      });
      
      return newPrices;
    });
  }, [setCurrentPrices]);

  // Update positions with current prices and calculate PnL
  const updatePositions = useCallback(() => {
    setTradeState(prevState => {
      const updatedPositions = prevState.positions.map(position => {
        const currentPrice = currentPrices[position.symbol] || position.currentPrice;
        const priceDiff = currentPrice - position.entryPrice;
        const pnl = position.side === 'long' ? priceDiff * position.shares : -priceDiff * position.shares;
        const pnlPercent = (pnl / (position.entryPrice * position.shares)) * 100;
        
        return {
          ...position,
          currentPrice,
          pnl: parseFloat(pnl.toFixed(2)),
          pnlPercent: parseFloat(pnlPercent.toFixed(2)),
        };
      });

      const totalPnl = updatedPositions.reduce((sum, pos) => sum + pos.pnl, 0);

      return {
        ...prevState,
        positions: updatedPositions,
        totalPnl: parseFloat(totalPnl.toFixed(2)),
      };
    });
  }, [currentPrices, setTradeState]);

  // Check and execute pending orders
  const checkOrderExecution = useCallback(() => {
    setTradeState(prevState => {
      const updatedOrders = [...prevState.orders];
      const newPositions = [...prevState.positions];
      let balanceChange = 0;

      updatedOrders.forEach((order, index) => {
        if (order.status !== 'pending') return;

        const currentPrice = currentPrices[order.symbol];
        if (!currentPrice) return;

        let shouldExecute = false;

        if (order.type === 'Market') {
          shouldExecute = true;
        } else if (order.type === 'Limit') {
          if (order.side === 'buy' && currentPrice <= order.price) {
            shouldExecute = true;
          } else if (order.side === 'sell' && currentPrice >= order.price) {
            shouldExecute = true;
          }
        }

        if (shouldExecute) {
          // Execute the order
          const executionPrice = order.type === 'Market' ? currentPrice : order.price;
          const cost = executionPrice * order.shares;
          
          if (order.side === 'buy') {
            // Check if we have enough balance
            if (prevState.availableBalance >= cost) {
              // Create or update position
              const existingPositionIndex = newPositions.findIndex(pos => pos.symbol === order.symbol && pos.side === 'long');
              
              if (existingPositionIndex >= 0) {
                // Update existing position
                const existingPosition = newPositions[existingPositionIndex];
                const totalShares = existingPosition.shares + order.shares;
                const averagePrice = ((existingPosition.entryPrice * existingPosition.shares) + (executionPrice * order.shares)) / totalShares;
                
                newPositions[existingPositionIndex] = {
                  ...existingPosition,
                  shares: totalShares,
                  entryPrice: parseFloat(averagePrice.toFixed(2)),
                };
              } else {
                // Create new position
                newPositions.push({
                  id: generateId(),
                  market: order.market,
                  symbol: order.symbol,
                  side: 'long',
                  shares: order.shares,
                  entryPrice: executionPrice,
                  currentPrice: executionPrice,
                  pnl: 0,
                  pnlPercent: 0,
                  timestamp: new Date().toISOString(),
                });
              }
              
              balanceChange -= cost;
              updatedOrders[index] = { ...order, status: 'filled', filledShares: order.shares };
            }
          } else {
            // Sell order - create short position or close long position
            const existingLongPositionIndex = newPositions.findIndex(pos => pos.symbol === order.symbol && pos.side === 'long');
            
            if (existingLongPositionIndex >= 0) {
              // Close or reduce long position
              const existingPosition = newPositions[existingLongPositionIndex];
              const sharesToClose = Math.min(existingPosition.shares, order.shares);
              const revenue = executionPrice * sharesToClose;
              
              if (sharesToClose >= existingPosition.shares) {
                // Close entire position
                newPositions.splice(existingLongPositionIndex, 1);
              } else {
                // Reduce position
                newPositions[existingLongPositionIndex] = {
                  ...existingPosition,
                  shares: existingPosition.shares - sharesToClose,
                };
              }
              
              balanceChange += revenue;
            } else {
              // Create short position
              newPositions.push({
                id: generateId(),
                market: order.market,
                symbol: order.symbol,
                side: 'short',
                shares: order.shares,
                entryPrice: executionPrice,
                currentPrice: executionPrice,
                pnl: 0,
                pnlPercent: 0,
                timestamp: new Date().toISOString(),
              });
              
              balanceChange += cost;
            }
            
            updatedOrders[index] = { ...order, status: 'filled', filledShares: order.shares };
          }
        }
      });

      return {
        ...prevState,
        orders: updatedOrders,
        positions: newPositions,
        availableBalance: parseFloat((prevState.availableBalance + balanceChange).toFixed(2)),
      };
    });
  }, [currentPrices, setTradeState, generateId]);

  // Start price simulation
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      simulatePriceMovement();
    }, 3000); // Update every 3 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [simulatePriceMovement]);

  // Update positions when prices change - optimized to prevent infinite loops
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updatePositions();
      checkOrderExecution();
    }, 100); // Small delay to batch updates

    return () => clearTimeout(timeoutId);
  }, [currentPrices]); // Only depend on currentPrices, not the functions

  // Place a new order
  const placeOrder = useCallback((
    market: string,
    symbol: string,
    type: OrderType,
    side: TradeType,
    shares: number,
    price: number
  ) => {
    const order: Order = {
      id: generateId(),
      market,
      symbol,
      type,
      side,
      shares,
      price,
      status: 'pending',
      filledShares: 0,
      timestamp: new Date().toISOString(),
    };

    setTradeState(prevState => ({
      ...prevState,
      orders: [...prevState.orders, order],
    }));

    return order.id;
  }, [generateId, setTradeState]);

  // Cancel an order
  const cancelOrder = useCallback((orderId: string) => {
    setTradeState(prevState => ({
      ...prevState,
      orders: prevState.orders.map(order =>
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      ),
    }));
  }, [setTradeState]);

  // Close a position
  const closePosition = useCallback((positionId: string, shares?: number) => {
    setTradeState(prevState => {
      const position = prevState.positions.find(pos => pos.id === positionId);
      if (!position) return prevState;

      const sharesToClose = shares || position.shares;
      const currentPrice = currentPrices[position.symbol] || position.currentPrice;
      const revenue = currentPrice * sharesToClose;

      if (sharesToClose >= position.shares) {
        // Close entire position
        return {
          ...prevState,
          positions: prevState.positions.filter(pos => pos.id !== positionId),
          availableBalance: parseFloat((prevState.availableBalance + revenue).toFixed(2)),
        };
      } else {
        // Partial close
        return {
          ...prevState,
          positions: prevState.positions.map(pos =>
            pos.id === positionId
              ? { ...pos, shares: pos.shares - sharesToClose }
              : pos
          ),
          availableBalance: parseFloat((prevState.availableBalance + revenue).toFixed(2)),
        };
      }
    });
  }, [setTradeState, currentPrices]);

  // Get current price for a symbol
  const getCurrentPrice = useCallback((symbol: string) => {
    return currentPrices[symbol] || 0;
  }, [currentPrices]);

  // Get positions for a specific symbol
  const getPositions = useCallback((symbol?: string) => {
    if (symbol) {
      return tradeState.positions.filter(pos => pos.symbol === symbol);
    }
    return tradeState.positions;
  }, [tradeState.positions]);

  // Get orders for a specific symbol
  const getOrders = useCallback((symbol?: string) => {
    if (symbol) {
      return tradeState.orders.filter(order => order.symbol === symbol);
    }
    return tradeState.orders;
  }, [tradeState.orders]);

  return {
    // State
    positions: tradeState.positions,
    orders: tradeState.orders,
    availableBalance: tradeState.availableBalance,
    totalPnl: tradeState.totalPnl,
    currentPrices,
    
    // Actions
    placeOrder,
    cancelOrder,
    closePosition,
    getCurrentPrice,
    getPositions,
    getOrders,
    
    // Utilities
    generateId,
  };
} 