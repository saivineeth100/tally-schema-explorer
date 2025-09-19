
import React from 'react';

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center h-full p-8">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400"></div>
  </div>
);

export default Spinner;
