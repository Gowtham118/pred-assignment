import { create } from 'zustand';

export interface Order {
    id: string;
    type: 'market' | 'limit';
    side: 'buy' | 'sell';
    price: number;
    size: number;
    timestamp: number;
    status: 'pending' | 'filled' | 'cancelled';
    symbol: string;
}

export interface Position {
    id: string;
    symbol: string;
    side: 'long' | 'short';
    size: number;
    entryPrice: number;
    entryTimestamp: number;
    pnl: number;
    currentPrice: number;
}

interface OrderbookState {
    openOrders: Order[];
    positions: Position[];
    currentPrice: number;
    tradeHistory: Array<{
        id: string;
        orderId: string;
        symbol: string;
        side: 'buy' | 'sell';
        price: number;
        size: number;
        timestamp: number;
        fee: number;
    }>;

    // Actions
    addOrder: (order: Omit<Order, 'id' | 'timestamp' | 'status'>) => string;
    updateOrderStatus: (orderId: string, status: Order['status']) => void;
    removeOrder: (orderId: string) => void;
    addPosition: (position: Omit<Position, 'id' | 'entryTimestamp' | 'pnl'>) => string;
    updatePosition: (positionId: string, updates: Partial<Position>) => void;
    removePosition: (positionId: string) => void;
    addTrade: (trade: Omit<OrderbookState['tradeHistory'][0], 'id'>) => void;
    setCurrentPrice: (price: number) => void;
    getOrdersBySymbol: (symbol: string) => Order[];
    getPositionsBySymbol: (symbol: string) => Position[];

    // Restoration functions for localStorage
    restoreOrder: (order: Order) => void;
    restorePosition: (position: Position) => void;
    restoreTrade: (trade: OrderbookState['tradeHistory'][0]) => void;
    clearAllData: () => void;
}

export const useOrderbookStore = create<OrderbookState>((set, get) => ({
    openOrders: [],
    positions: [],
    currentPrice: 34,
    tradeHistory: [],

    addOrder: (orderData) => {
        const order: Order = {
            ...orderData,
            id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            status: 'pending'
        };

        set((state) => ({
            openOrders: [...state.openOrders, order]
        }));

        return order.id;
    },

    updateOrderStatus: (orderId, status) => {
        set((state) => ({
            openOrders: state.openOrders.map(order =>
                order.id === orderId ? { ...order, status } : order
            )
        }));
    },

    removeOrder: (orderId) => {
        set((state) => ({
            openOrders: state.openOrders.filter(order => order.id !== orderId)
        }));
    },

    addPosition: (positionData) => {
        const { currentPrice } = get();
        const position: Position = {
            ...positionData,
            id: `position_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            entryTimestamp: Date.now(),
            pnl: 0,
            currentPrice
        };

        set((state) => ({
            positions: [...state.positions, position]
        }));

        return position.id;
    },

    updatePosition: (positionId, updates) => {
        set((state) => ({
            positions: state.positions.map(position => {
                if (position.id === positionId) {
                    const updatedPosition = { ...position, ...updates };
                    // Calculate P&L if currentPrice is provided (convert cents to dollars)
                    if (updates.currentPrice !== undefined) {
                        const priceDiffInCents = updates.currentPrice - position.entryPrice;
                        const pnlInDollars = (priceDiffInCents / 100) * position.size;
                        updatedPosition.pnl = pnlInDollars;
                    }
                    return updatedPosition;
                }
                return position;
            })
        }));
    },

    removePosition: (positionId) => {
        set((state) => ({
            positions: state.positions.filter(position => position.id !== positionId)
        }));
    },

    addTrade: (tradeData) => {
        const trade = {
            ...tradeData,
            id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        set((state) => ({
            tradeHistory: [...state.tradeHistory, trade]
        }));
    },

    setCurrentPrice: (price) => {
        set((state) => ({
            currentPrice: price,
            positions: state.positions.map(position => {
                const priceDiffInCents = price - position.entryPrice;
                const pnlInDollars = (priceDiffInCents / 100) * position.size;
                return {
                    ...position,
                    currentPrice: price,
                    pnl: pnlInDollars
                };
            })
        }));
    },

    getOrdersBySymbol: (symbol) => {
        return get().openOrders.filter(order => order.symbol === symbol);
    },

    getPositionsBySymbol: (symbol) => {
        return get().positions.filter(position => position.symbol === symbol);
    },

    // Restoration functions for localStorage
    restoreOrder: (order) => {
        set((state) => ({
            openOrders: [...state.openOrders, order]
        }));
    },
    restorePosition: (position) => {
        set((state) => ({
            positions: [...state.positions, position]
        }));
    },
    restoreTrade: (trade) => {
        set((state) => ({
            tradeHistory: [...state.tradeHistory, trade]
        }));
    },
    clearAllData: () => {
        set(() => ({
            openOrders: [],
            positions: [],
            tradeHistory: [],
            currentPrice: 34 // Reset to a default value
        }));
    }
})); 