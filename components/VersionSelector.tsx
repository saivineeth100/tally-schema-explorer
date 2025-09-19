
import React from 'react';

const VersionSelector: React.FC<{
  id?: string;
  versions: string[];
  currentVersion: string;
  onChange: (version: string) => void;
  className?: string;
}> = ({ id, versions, currentVersion, onChange, className }) => (
  <div className={`relative ${className}`}>
    <select
      id={id}
      value={currentVersion}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 pr-8"
      aria-label="Select schema version"
    >
      {versions.map((v) => (
        <option key={v} value={v}>{`Version ${v}`}</option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M5.516 7.548c.436-.446 1.144-.446 1.58 0L10 10.42l2.904-2.872c.436-.446 1.144-.446 1.58 0 .436.446.436 1.164 0 1.61l-3.72 3.72c-.436.446-1.144.446-1.58 0L5.516 9.158c-.436-.446-.436-1.164 0-1.61z"/>
      </svg>
    </div>
  </div>
);

export default VersionSelector;
