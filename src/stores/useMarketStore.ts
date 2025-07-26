import { create } from 'zustand';

interface MarketState {
    currentPrice: number;
    symbol: string;
    priceHistory: Array<{ price: number; timestamp: number }>;
    isSimulating: boolean;
    setCurrentPrice: (price: number) => void;
    setSymbol: (symbol: string) => void;
    startPriceSimulation: () => void;
    stopPriceSimulation: () => void;
    simulatePriceFeed: () => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
    currentPrice: 34,
    symbol: 'CSK',
    priceHistory: [],
    isSimulating: false,

    setCurrentPrice: (price: number) => {
        set((state) => ({
            currentPrice: price,
            priceHistory: [
                ...state.priceHistory,
                { price, timestamp: Date.now() }
            ].slice(-100) // Keep last 100 price points
        }));
    },

    setSymbol: (symbol: string) => {
        set({ symbol });
    },

    startPriceSimulation: () => {
        const { isSimulating } = get();
        if (isSimulating) return;

        set({ isSimulating: true });

        const interval = setInterval(() => {
            get().simulatePriceFeed();
        }, 2000);

        // Store interval ID for cleanup
        (window as any).__priceSimulationInterval = interval;
    },

    stopPriceSimulation: () => {
        set({ isSimulating: false });
        if ((window as any).__priceSimulationInterval) {
            clearInterval((window as any).__priceSimulationInterval);
        }
    },

    simulatePriceFeed: () => {
        const { currentPrice } = get();

        // Generate random price movement (-2% to +2%)
        const changePercent = (Math.random() - 0.5) * 0.04;
        const newPrice = Math.max(1, currentPrice * (1 + changePercent));

        get().setCurrentPrice(Math.round(newPrice * 100) / 100);
    }
})); 