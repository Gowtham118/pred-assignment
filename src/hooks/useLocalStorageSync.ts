import { useEffect } from 'react';
import { useMarketStore } from '../stores/useMarketStore';
import { useBalanceStore } from '../stores/useBalanceStore';
import { useOrderbookStore } from '../stores/useOrderbookStore';
import React from 'react';

const STORAGE_KEYS = {
    MARKET: 'pred_trading_market',
    ORDERBOOK: 'pred_trading_orderbook',
    BALANCE: 'pred_trading_balance'
} as const;

export const useLocalStorageSync = () => {
    const { currentPrice, symbol, priceHistory, setCurrentPrice, setSymbol } = useMarketStore();
    const { balance, totalPnl, setBalance, updateTotalPnl } = useBalanceStore();
    const {
        openOrders,
        positions,
        tradeHistory,
        addOrder,
        addPosition,
        addTrade,
        restoreOrder,
        restorePosition,
        restoreTrade,
        clearAllData
    } = useOrderbookStore();

    // Flag to track if initial data load is complete
    const [isInitialLoadComplete, setIsInitialLoadComplete] = React.useState(false);

    // Load data from localStorage on mount
    useEffect(() => {
        try {
            // Load market data
            const marketData = localStorage.getItem(STORAGE_KEYS.MARKET);
            if (marketData) {
                const parsed = JSON.parse(marketData);
                if (parsed.currentPrice) setCurrentPrice(parsed.currentPrice);
                if (parsed.symbol) setSymbol(parsed.symbol);
            }

            // Load balance data
            const balanceData = localStorage.getItem(STORAGE_KEYS.BALANCE);
            if (balanceData) {
                const parsed = JSON.parse(balanceData);
                if (parsed.balance) setBalance(parsed.balance);
                if (parsed.totalPnl) updateTotalPnl(parsed.totalPnl);
            }

            // Load orderbook data
            const orderbookData = localStorage.getItem(STORAGE_KEYS.ORDERBOOK);
            if (orderbookData) {
                const parsed = JSON.parse(orderbookData);
                console.log('Loading orderbook data from localStorage:', parsed);

                // Clear existing data first
                clearAllData();

                // Restore orders, positions, and trade history with their original IDs and timestamps
                if (parsed.openOrders && Array.isArray(parsed.openOrders)) {
                    parsed.openOrders.forEach((order: any) => {
                        // Only restore pending orders (not filled or cancelled)
                        if (order.status === 'pending') {
                            restoreOrder(order);
                        }
                    });
                }

                if (parsed.positions && Array.isArray(parsed.positions)) {
                    parsed.positions.forEach((position: any) => {
                        restorePosition(position);
                    });
                }

                if (parsed.tradeHistory && Array.isArray(parsed.tradeHistory)) {
                    parsed.tradeHistory.forEach((trade: any) => {
                        restoreTrade(trade);
                    });
                }

                console.log('Orderbook data restored successfully');
            } else {
                // Add sample data only if no existing data
                console.log('No orderbook data found, adding sample data for testing');

                // Add a sample order
                const sampleOrderId = addOrder({
                    symbol: 'CSK',
                    type: 'limit',
                    side: 'buy',
                    price: 35,
                    size: 100
                });

                // Add a sample position
                const samplePositionId = addPosition({
                    symbol: 'CSK',
                    side: 'long',
                    size: 50,
                    entryPrice: 34,
                    currentPrice: 35
                });

                // Add a sample trade
                addTrade({
                    orderId: sampleOrderId,
                    symbol: 'CSK',
                    side: 'buy',
                    price: 34,
                    size: 50,
                    timestamp: Date.now() - 60000, // 1 minute ago
                    fee: 0.17
                });

                console.log('Sample data added:', { sampleOrderId, samplePositionId });
            }
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
        }

        // Mark initial load as complete
        setIsInitialLoadComplete(true);
    }, []); // Empty dependency array to run only once

    // Save market data to localStorage (only after initial load)
    useEffect(() => {
        if (!isInitialLoadComplete) return;

        const marketData = {
            currentPrice,
            symbol,
            priceHistory
        };
        localStorage.setItem(STORAGE_KEYS.MARKET, JSON.stringify(marketData));
    }, [currentPrice, symbol, priceHistory, isInitialLoadComplete]);

    // Save orderbook data to localStorage (only after initial load)
    useEffect(() => {
        const orderbookData = {
            openOrders,
            positions,
            tradeHistory
        };
        localStorage.setItem(STORAGE_KEYS.ORDERBOOK, JSON.stringify(orderbookData));
        console.log('Saving orderbook data to localStorage:', orderbookData);
    }, [openOrders, positions, tradeHistory]);

    // Save balance data to localStorage
    useEffect(() => {
        const balanceData = {
            balance,
            totalPnl
        };
        localStorage.setItem(STORAGE_KEYS.BALANCE, JSON.stringify(balanceData));
    }, [balance, totalPnl]);

    // Start price simulation on mount
    useEffect(() => {
        const { startPriceSimulation, stopPriceSimulation } = useMarketStore.getState();
        startPriceSimulation();

        // Cleanup on unmount
        return () => {
            stopPriceSimulation();
        };
    }, []);

    // Function to clear all data (useful for debugging or reset)
    const clearAllLocalStorage = () => {
        localStorage.removeItem(STORAGE_KEYS.MARKET);
        localStorage.removeItem(STORAGE_KEYS.ORDERBOOK);
        localStorage.removeItem(STORAGE_KEYS.BALANCE);
        console.log('All localStorage data cleared');
    };

    // Expose the clear function for debugging
    React.useEffect(() => {
        (window as any).clearTradingData = clearAllLocalStorage;
        console.log('Debug function available: window.clearTradingData() to reset all data');
    }, []);

    return {
        clearAllLocalStorage
    };
}; 