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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      {entries.map(([key, value]) => (
        <div key={key}>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{key}</p>
          <p className="text-lg text-gray-900 dark:text-white">{value.toString()}</p>
        </div>
      ))}
    </div>
  );
};

export default MetadataView;
