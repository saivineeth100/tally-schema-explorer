import React from 'react';

interface MetadataViewProps {
  meta: Record<string, any>;
}

const MetadataView: React.FC<MetadataViewProps> = ({ meta }) => {
  const entries = Object.entries(meta).filter(([, value]) => value && value.toString().trim() !== '');
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map(([key, value]) => (
        <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{key}</p>
          <p className="text-base font-medium text-gray-900 dark:text-white break-words">{value.toString()}</p>
        </div>
      ))}
    </div>
  );
};

export default MetadataView;
