import React from 'react';

const PredHeader: React.FC = () => (
  <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
    <div className="flex items-center space-x-2">
      <img src="public/logos/pred-name.svg" alt="Back" className="w-22 h-12" />
    </div>
    
    <div className="flex items-center space-x-2">
      {/* Empty center space */}
    </div>
    
    <div className="flex items-center space-x-3">
      <img src="public/icons/star.svg" alt="Star" className="w-5 h-5" />
      <img src="public/icons/bell.svg" alt="Notifications" className="w-5 h-5" />
    </div>
  </div>
);

export default PredHeader; 