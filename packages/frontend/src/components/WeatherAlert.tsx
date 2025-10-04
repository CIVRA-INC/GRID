'use client'; 

import React, { useState, useEffect } from 'react';
import { useFtsoData } from '@/hooks/useFtsoData';


const WEATHER_SYMBOL = 'FIL'; 

const ALERT_THRESHOLD = 4.0;

export const WeatherAlert = () => {
  const { data: ftsoData, error } = useFtsoData(WEATHER_SYMBOL);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    
    if (ftsoData && ftsoData.price < ALERT_THRESHOLD) {
      
      setIsVisible(true);
    }
  }, [ftsoData]); 

  const handleDismiss = () => {
    setIsVisible(false);
  };

  
  if (!isVisible || error || !ftsoData) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white shadow-lg animate-fade-in-down">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl mr-3">❄️</span>
          <p>
            <span className="font-bold">Weather Alert:</span> Possible freezing conditions detected in the area. Please exercise caution.
            <span className="text-sm opacity-80 ml-2">(Data Point: {ftsoData.price.toFixed(4)})</span>
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-1 px-3 rounded-full transition-colors"
          aria-label="Dismiss alert"
        >
          &times;
        </button>
      </div>
    </div>
  );
};



@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-down {
  animation: fade-in-down 0.5s ease-out forwards;
}
