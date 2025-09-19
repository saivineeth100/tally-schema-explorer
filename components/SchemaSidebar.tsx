

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
}> = ({ availableVersions, currentVersion, onVersionChange, filter, onFilterChange, filteredSchemaNames, onClose }) => {
    const navLinkClasses = "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150";
    const activeClassName = "bg-cyan-500 text-white";
    const inactiveClassName = "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white";

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 space-y-4 border-b border-gray-200 dark:border-gray-700">
                <VersionSelector
                    versions={availableVersions}
                    currentVersion={currentVersion}
                    onChange={onVersionChange}
                />
                <input
                    type="text"
                    placeholder="Filter schemas..."
                    value={filter}
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
                    aria-label="Filter schemas"
                />
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {filteredSchemaNames.map(name => (
                    <NavLink
                        key={name}
                        to={`/${currentVersion}/schema/${name}`}
                        onClick={onClose}
                        className={({ isActive }) => `${navLinkClasses} ${isActive ? activeClassName : inactiveClassName}`}
                    >
                        <DocumentIcon className="w-5 h-5 mr-3" />
                        <span>{name}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default SchemaSidebar;