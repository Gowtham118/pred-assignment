import { create } from 'zustand';

interface BalanceState {
    balance: number;
    totalPnl: number;

    // Actions
    setBalance: (balance: number) => void;
    addBalance: (amount: number) => void;
    subtractBalance: (amount: number) => void;
    updateTotalPnl: (pnl: number) => void;
    resetAccount: () => void;
}

export const useBalanceStore = create<BalanceState>((set) => ({
    balance: 1000, // Starting balance
    totalPnl: 0,

    setBalance: (balance: number) => {
        set({ balance: Math.max(0, balance) });
    },

    addBalance: (amount: number) => {
        set((state) => ({
            balance: state.balance + amount
        }));
    },

    subtractBalance: (amount: number) => {
        set((state) => ({
            balance: Math.max(0, state.balance - amount)
        }));
    },

    updateTotalPnl: (pnl: number) => {
        set({ totalPnl: pnl });
    },

    resetAccount: () => {
        set({ balance: 1000, totalPnl: 0 });
    }
})); 