import React from 'react';

const Header: React.FC = () => (
  <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
    <div className="flex items-center space-x-2">
      <span className="text-black font-medium text-sm">9:30</span>
    </div>
    
    <div className="w-8 h-8 bg-black rounded-full"></div>
    
    <div className="flex items-center space-x-3">
      <img src="/icons/wifi.svg" alt="WiFi" className="w-5 h-5" />
      <img src="/icons/tower.svg" alt="Cell tower" className="w-5 h-5" />
      <img src="/icons/battery.svg" alt="Battery" className="w-5 h-5" />
    </div>
  </div>
);

export default Header; 