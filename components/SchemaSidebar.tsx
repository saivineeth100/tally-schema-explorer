import React from 'react';
import { NavLink } from 'react-router-dom';
import VersionSelector from './VersionSelector';
import { DocumentIcon } from './icons';

const SchemaSidebar: React.FC<{
    availableVersions: string[];
    currentVersion: string;
    onVersionChange: (newVersion: string) => void;
    filter: string;
    onFilterChange: (newFilter: string) => void;
    filteredSchemaNames: string[];
    onClose: () => void;
    itemHistory: Record<string, { added?: string; deleted?: string }>;
}> = ({ availableVersions, currentVersion, onVersionChange, filter, onFilterChange, filteredSchemaNames, onClose, itemHistory }) => {
    const navLinkClasses = "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150";
    const activeClassName = "bg-cyan-500 text-white";
    const inactiveClassName = "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white";

    const currentVerNum = parseFloat(currentVersion.replace(/^v/, ''));

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Sticky header with version and search - no 'sticky' class needed as flex parent handles layout */}
            <div className="flex-shrink-0 p-4 space-y-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
                <VersionSelector
                    versions={availableVersions}
                    currentVersion={currentVersion}
                    onChange={onVersionChange}
                />
                {/* Search input with clear button */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Filter schemas..."
                        value={filter}
                        onChange={(e) => onFilterChange(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 pr-10"
                        aria-label="Filter schemas"
                    />
                    {filter && (
                        <button
                            onClick={() => onFilterChange('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            aria-label="Clear filter"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {filteredSchemaNames.map(name => {
                    const h = itemHistory[name];
                    const addedVerNum = h?.added ? parseFloat(h.added.replace(/^v/, '')) : 0;
                    const deletedVerNum = h?.deleted ? parseFloat(h.deleted.replace(/^v/, '')) : Infinity;

                    const showAdded = h?.added && addedVerNum <= currentVerNum;
                    const showDeleted = h?.deleted && deletedVerNum > currentVerNum;

                    return (
                        <NavLink
                            key={name}
                            to={`/${currentVersion}/schema/${name}`}
                            onClick={onClose}
                            className={({ isActive }) => `${navLinkClasses} ${isActive ? activeClassName : inactiveClassName}`}
                        >
                            <div className="flex flex-col w-full">
                                <div className="flex items-center">
                                    <DocumentIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                                    <span>{name}</span>
                                </div>
                                {(showAdded || showDeleted) && (
                                    <div className="flex gap-1 ml-8 mt-1 flex-wrap">
                                        {showAdded && <span className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-1 py-0.5 rounded leading-none">+{h.added?.replace(/^v/, '')}</span>}
                                        {showDeleted && <span className="text-[10px] bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-1 py-0.5 rounded leading-none">Del v{h.deleted?.replace(/^v/, '')}</span>}
                                    </div>
                                )}
                            </div>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
};

export default SchemaSidebar;