# Pred Sports Trader

A React-based trading application for sports prediction markets, built with TypeScript, Tailwind CSS, and IBM Plex Sans font.

## 🎯 Features

- **Modern Trading Interface**: Clean, professional trading screen with real-time data
- **Market Cards**: Display market information, prices, and volume
- **Trade Controls**: Buy/Sell toggles, order types, price/shares inputs
- **Order Book**: Real-time order book with buy/sell visualization
- **Bottom Tabs**: Open orders, positions, and trade history
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **TypeScript**: Full type safety throughout the application

## 🏗️ Project Structure

```
src/
├── components/
│   ├── common/                 # Shared components
│   │   ├── Header.tsx         # App header with status icons
│   │   ├── BottomNavigation.tsx # Bottom navigation bar
│   │   └── index.ts           # Export file
│   ├── trade/                 # Trading-specific components
│   │   ├── MarketCard.tsx     # Market information display
│   │   ├── TradeControls.tsx  # Trading form controls
│   │   ├── OrderBook.tsx      # Order book visualization
│   │   ├── BottomTabs.tsx     # Bottom tab navigation
│   │   └── index.ts           # Export file
│   └── TradeScreen.tsx        # Main trading screen
├── types/
│   └── trade.ts               # TypeScript interfaces
├── hooks/                     # Custom React hooks (future)
└── assets/                    # Static assets
```

## 🎨 Design System

### Typography
- **Font Family**: IBM Plex Sans
- **Font Weights**: 
  - Thin (100)
  - ExtraLight (200)
  - Light (300)
  - Regular (400)
  - Medium (500)
  - SemiBold (600)
  - Bold (700)

### Color Scheme
- **Primary**: Gray scale (50-800)
- **Success**: Green (600)
- **Error**: Red (600)
- **Accent**: Purple (600)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pred-sports-trader
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🛠️ Technology Stack

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and dev server
- **IBM Plex Sans**: Professional typography

## 📱 Component Details

### TradeScreen
The main trading interface that orchestrates all trading components.

### MarketCard
Displays market information including:
- Market name and symbol
- Current price and percentage change
- Trading volume
- Market logo/branding

### TradeControls
Interactive trading form with:
- Buy/Long vs Sell/Short toggle
- Order type selection (Limit/Market)
- Price and shares input fields
- Percentage slider for position sizing
- Order summary and submit button

### OrderBook
Real-time order book visualization:
- Sell orders (red background)
- Buy orders (green background)
- Mid-price indicator
- Spread information

### BottomTabs
Tabbed interface for:
- Open Orders: Current pending orders
- Positions: Current holdings
- Trade History: Past trades

## 🎯 Future Enhancements

- [ ] Real-time data integration
- [ ] WebSocket connections
- [ ] Advanced charting
- [ ] Portfolio management
- [ ] User authentication
- [ ] Mobile app (React Native)

## 📄 License

This project is licensed under the MIT License.
