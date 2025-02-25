import React from 'react';
import ZoomZoomyDemo from './Zoom-Zoomy-Demo.tsx';

function App() {
  return (
    <div className="app relative">
      <img 
        src="/ZoomZoomy/FFCC-Logo.png" 
        alt="FFCC Logo" 
        className="absolute top-1 right-8 w-[130px] h-auto"
      />
      <ZoomZoomyDemo />
    </div>
  );
}

export default App;
