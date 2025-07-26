import TradeScreen from './components/TradeScreen';
import { useLocalStorageSync } from './hooks/useLocalStorageSync';
import './App.css';

function App() {
  // Initialize trading system with localStorage sync
  useLocalStorageSync();

  return (
    <div className="App">
      <TradeScreen />
    </div>
  );
}

export default App;
