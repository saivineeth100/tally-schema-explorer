import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { BoltIcon, ChevronRightIcon, CodeIcon, DocumentIcon } from './icons';
import VersionSelector from './VersionSelector';
import { TypeUrls } from '@/pages/shared/ItemWelcome';

type Item = { Name: string };
type ItemsByType = Record<string, Record<string, Item>>;
type ItemType = 'function' | 'definition' | 'action';

interface ItemSidebarProps {
    availableVersions: string[];
    currentVersion: string;
    onVersionChange: (newVersion: string) => void;
    filter: string;
    onFilterChange: (newFilter: string) => void;
    itemsByType: ItemsByType;
    activeType?: string;
    activeItem?: string;
    onClose: () => void;
    itemType: ItemType;
    basePath: string;
}

const ItemSidebar: React.FC<ItemSidebarProps> = ({ availableVersions, currentVersion, onVersionChange, filter, onFilterChange, itemsByType, activeType, activeItem, onClose, itemType, basePath }) => {

    const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (activeType) {
            setExpandedTypes(prev => new Set(prev).add(activeType));
        }
    }, [activeType]);

    const toggleType = (typeName: string) => {
        setExpandedTypes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(typeName)) {
                newSet.delete(typeName);
            } else {
                newSet.add(typeName);
            }
            return newSet;
        });
    };

    const placeholders: Record<ItemType, string> = {
        function: "Filter functions...",
        definition: "Filter attributes...",
        action: "Filter actions...",
    };
    const icons: Record<ItemType, React.ReactElement> = {
        function: <CodeIcon className="w-5 h-5 mr-3 flex-shrink-0" />,
        definition: <DocumentIcon className="w-5 h-5 mr-3 flex-shrink-0" />,
        action: <BoltIcon className="w-5 h-5 mr-3 flex-shrink-0" />,
    };

    const itemTypes = Object.keys(itemsByType).sort();

    const navLinkClasses = "flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150";
    const activeClassName = "bg-cyan-500 text-white";
    const inactiveClassName = "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white";

    const filterActive = filter.trim().length > 0;

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
                    placeholder={placeholders[itemType]}
                    value={filter}
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
                    aria-label={`Filter ${itemType}s`}
                />
            </div>
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {itemTypes.map(type => {
                    const items = Object.values(itemsByType[type] || {}).sort((a, b) => a.Name.localeCompare(b.Name));
                    const filteredItems = items.filter(item => item.Name.toLowerCase().includes(filter.toLowerCase()));

                    if (filterActive && filteredItems.length === 0) {
                        return null;
                    }

                    const isExpanded = expandedTypes.has(type) || filterActive;

                    return (
                        <div key={type}>
                            <button onClick={() => !filterActive && toggleType(type)} className={`${navLinkClasses} ${activeType === type && !activeItem ? activeClassName : inactiveClassName} justify-between`}>
                                <div className="flex items-center">
                                    {icons[itemType]}
                                    <span className="font-semibold">{type}</span>
                                </div>
                                {!filterActive && (
                                    <ChevronRightIcon className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                )}
                            </button>
                            {isExpanded && (
                                <ul className="pl-6 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-600 ml-3">
                                    {filteredItems.map(item => (
                                        <li key={item.Name}>
                                            <NavLink
                                                to={`/${currentVersion}/${TypeUrls[itemType]}/${encodeURIComponent(type)}/${encodeURIComponent(item.Name)}`}
                                                onClick={onClose}
                                                className={({ isActive }) => `${navLinkClasses} text-xs ${isActive ? activeClassName : inactiveClassName}`}
                                            >
                                                <span className="truncate font-mono">{item.Name}</span>
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </nav>
        </div>
    );
};

export default ItemSidebar;