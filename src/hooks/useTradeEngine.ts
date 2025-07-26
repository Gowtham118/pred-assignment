import { useCallback, useEffect } from 'react';
import { useMarketStore } from '../stores/useMarketStore';
import { useOrderbookStore, type Order, type Position } from '../stores/useOrderbookStore';
import { useBalanceStore } from '../stores/useBalanceStore';

const TRADE_FEE_PERCENT = 0.01; // 1% fee

export const useTradeEngine = () => {
    const { currentPrice } = useMarketStore();
    const {
        openOrders,
        positions,
        addOrder,
        updateOrderStatus,
        removeOrder,
        addPosition,
        updatePosition,
        removePosition,
        addTrade,
        setCurrentPrice
    } = useOrderbookStore();
    const { balance, addBalance, subtractBalance, updateTotalPnl } = useBalanceStore();

    // Calculate trade fee
    const calculateFee = useCallback((amount: number) => {
        return amount * TRADE_FEE_PERCENT;
    }, []);

    // Execute market order immediately
    const executeMarketOrder = useCallback((
        orderId: string,
        symbol: string,
        side: 'buy' | 'sell',
        price: number,
        size: number
    ) => {
        console.log('useTradeEngine: Executing market order:', { orderId, symbol, side, price, size });

        // Convert price from cents to dollars for balance calculations
        const priceInDollars = price / 100;
        const totalCost = priceInDollars * size;
        const fee = calculateFee(totalCost);
        const totalWithFee = totalCost + fee;

        console.log('useTradeEngine: Cost calculations:', { priceInDollars, totalCost, fee, totalWithFee, balance });

        if (side === 'buy') {
            // Check if user has enough balance
            if (balance < totalWithFee) {
                console.log('useTradeEngine: Insufficient balance, cancelling order');
                updateOrderStatus(orderId, 'cancelled');
                return false;
            }

            // Deduct balance
            subtractBalance(totalWithFee);
            console.log('useTradeEngine: Balance deducted, new balance:', balance - totalWithFee);

            // Create or update position
            const existingPosition = positions.find(p => p.symbol === symbol && p.side === 'long');

            if (existingPosition) {
                // Update existing position
                const newSize = existingPosition.size + size;
                const newEntryPrice = ((existingPosition.entryPrice * existingPosition.size) + (price * size)) / newSize;

                console.log('useTradeEngine: Updating existing position:', { existingPosition, newSize, newEntryPrice });
                updatePosition(existingPosition.id, {
                    size: newSize,
                    entryPrice: newEntryPrice,
                    currentPrice: price
                });
            } else {
                // Create new position
                console.log('useTradeEngine: Creating new position');
                addPosition({
                    symbol,
                    side: 'long',
                    size,
                    entryPrice: price,
                    currentPrice: price
                });
            }
        } else {
            // Sell order
            const existingPosition = positions.find(p => p.symbol === symbol && p.side === 'long');

            if (!existingPosition || existingPosition.size < size) {
                console.log('useTradeEngine: No position to sell or insufficient size, cancelling order');
                updateOrderStatus(orderId, 'cancelled');
                return false;
            }

            // Add balance (minus fee)
            addBalance(totalCost - fee);
            console.log('useTradeEngine: Balance added from sell, new balance:', balance + totalCost - fee);

            // Update position
            if (existingPosition.size === size) {
                // Close position completely
                console.log('useTradeEngine: Closing position completely');
                removePosition(existingPosition.id);
            } else {
                // Reduce position size
                console.log('useTradeEngine: Reducing position size');
                updatePosition(existingPosition.id, {
                    size: existingPosition.size - size,
                    currentPrice: price
                });
            }
        }

        // Record trade
        console.log('useTradeEngine: Recording trade');
        addTrade({
            orderId,
            symbol,
            side,
            price,
            size,
            timestamp: Date.now(),
            fee
        });

        // Update order status
        updateOrderStatus(orderId, 'filled');
        console.log('useTradeEngine: Order filled successfully');

        return true;
    }, [balance, positions, addPosition, updatePosition, removePosition, addBalance, subtractBalance, addTrade, updateOrderStatus, calculateFee]);

    // Place order function
    const placeOrder = useCallback((
        symbol: string,
        type: 'market' | 'limit',
        side: 'buy' | 'sell',
        price: number,
        size: number
    ) => {
        console.log('useTradeEngine: Placing order:', { symbol, type, side, price, size });

        const orderId = addOrder({
            symbol,
            type,
            side,
            price,
            size
        });

        console.log('useTradeEngine: Order added with ID:', orderId);

        // If market order, execute immediately
        if (type === 'market') {
            console.log('useTradeEngine: Executing market order immediately');
            executeMarketOrder(orderId, symbol, side, price, size);
        }

        return orderId;
    }, [addOrder, executeMarketOrder]);

    // Check for limit order matches
    const checkOrderMatches = useCallback(() => {
        const pendingOrders = openOrders.filter(order => order.status === 'pending' && order.type === 'limit');

        pendingOrders.forEach(order => {
            const shouldExecute =
                (order.side === 'buy' && currentPrice <= order.price) ||
                (order.side === 'sell' && currentPrice >= order.price);

            if (shouldExecute) {
                executeMarketOrder(order.id, order.symbol, order.side, order.price, order.size);
            }
        });
    }, [openOrders, currentPrice, executeMarketOrder]);

    // Cancel order
    const cancelOrder = useCallback((orderId: string) => {
        updateOrderStatus(orderId, 'cancelled');
        removeOrder(orderId);
    }, [updateOrderStatus, removeOrder]);

    // Close position
    const closePosition = useCallback((positionId: string) => {
        const position = positions.find(p => p.id === positionId);
        if (!position) return;

        // Convert price from cents to dollars for balance calculations
        const priceInDollars = currentPrice / 100;
        const totalValue = priceInDollars * position.size;
        const fee = calculateFee(totalValue);
        const netValue = totalValue - fee;

        if (position.side === 'long') {
            addBalance(netValue);
        }

        // Record trade
        addTrade({
            orderId: `close_${positionId}`,
            symbol: position.symbol,
            side: position.side === 'long' ? 'sell' : 'buy',
            price: currentPrice,
            size: position.size,
            timestamp: Date.now(),
            fee
        });

        removePosition(positionId);
    }, [positions, currentPrice, addBalance, removePosition, addTrade, calculateFee]);

    // Update total P&L from all positions
    const updateTotalPnlFromPositions = useCallback(() => {
        const totalPnl = positions.reduce((sum, position) => {
            const currentValue = position.size * currentPrice;
            const entryValue = position.size * position.entryPrice;
            return sum + (position.side === 'long' ? currentValue - entryValue : entryValue - currentValue);
        }, 0);

        updateTotalPnl(totalPnl);
    }, [positions, currentPrice, updateTotalPnl]);

    // Check for order matches when price changes
    useEffect(() => {
        checkOrderMatches();
    }, [currentPrice, checkOrderMatches]);

    // Update orderbook store price when market price changes
    useEffect(() => {
        setCurrentPrice(currentPrice);
    }, [currentPrice, setCurrentPrice]);

    // Update total P&L when positions change
    useEffect(() => {
        updateTotalPnlFromPositions();
    }, [positions, updateTotalPnlFromPositions]);

    return {
        placeOrder,
        cancelOrder,
        closePosition,
        balance,
        openOrders: openOrders.filter(order => order.status === 'pending'),
        positions,
        currentPrice
    };
}; 