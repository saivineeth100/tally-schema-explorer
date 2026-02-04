import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { BoltIcon, ChevronRightIcon, CodeIcon, DocumentIcon, CalculatorIcon, CalendarIcon, CpuIcon, TypeIcon, DatabaseIcon, XCircleIcon } from './icons';
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
    itemHistory: Record<string, { added?: string; deleted?: string }>;
}

const ItemSidebar: React.FC<ItemSidebarProps> = ({ availableVersions, currentVersion, onVersionChange, filter, onFilterChange, itemsByType, activeType, activeItem, onClose, itemType, basePath, itemHistory }) => {

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

    // Base icons for types
    const baseIcons: Record<ItemType, React.ReactElement> = {
        function: <CodeIcon className="w-5 h-5 mr-3 flex-shrink-0" />,
        definition: <DocumentIcon className="w-5 h-5 mr-3 flex-shrink-0" />,
        action: <BoltIcon className="w-5 h-5 mr-3 flex-shrink-0" />,
    };

    const getCategoryIcon = (category: string) => {
        const lowerCat = category.toLowerCase();
        const iconClass = "w-5 h-5 mr-3 flex-shrink-0 text-gray-500 dark:text-gray-400";

        if (lowerCat.includes('math') || lowerCat.includes('number') || lowerCat.includes('amount')) return <CalculatorIcon className={iconClass} />;
        if (lowerCat.includes('date') || lowerCat.includes('time')) return <CalendarIcon className={iconClass} />;
        if (lowerCat.includes('string')) return <TypeIcon className={iconClass} />;
        if (lowerCat.includes('system') || lowerCat.includes('os') || lowerCat.includes('dll')) return <CpuIcon className={iconClass} />;
        if (lowerCat.includes('db') || lowerCat.includes('data') || lowerCat.includes('odbc') || lowerCat.includes('collection')) return <DatabaseIcon className={iconClass} />;

        // Return cloned base icon to ensure classes don't conflict if we wanted specific colors
        const baseIcon = baseIcons[itemType];
        if (!baseIcon) return <DocumentIcon className={iconClass} />;

        return React.cloneElement(baseIcon, { className: iconClass });
    };

    const itemTypes = Object.keys(itemsByType).sort();

    // Calculate if we have any results at all
    const hasAnyResults = itemTypes.some(type => {
        const items = Object.values(itemsByType[type] || {}) as Item[];
        return items.some(item => item.Name.toLowerCase().includes(filter.toLowerCase()));
    });

    const navLinkClasses = "flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150";
    const activeClassName = "bg-cyan-500 text-white";
    const inactiveClassName = "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white";

    const filterActive = filter.trim().length > 0;
    const currentVerNum = parseFloat(currentVersion.replace(/^v/, ''));

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 space-y-4 border-b border-gray-200 dark:border-gray-700">
                <VersionSelector
                    versions={availableVersions}
                    currentVersion={currentVersion}
                    onChange={onVersionChange}
                />
                <div className="relative">
                    <input
                        type="text"
                        placeholder={placeholders[itemType]}
                        value={filter}
                        onChange={(e) => onFilterChange(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 pr-8"
                        aria-label={`Filter ${itemType}s`}
                    />
                    {filterActive && (
                        <button
                            onClick={() => onFilterChange('')}
                            className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                            aria-label="Clear filter"
                        >
                            <XCircleIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {!hasAnyResults && filterActive ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400 italic text-sm">
                        No results found for "{filter}"
                    </div>
                ) : (
                    itemTypes.map(type => {
                        const items = Object.values(itemsByType[type] || {}) as Item[];
                        const filteredItems = items.filter(item => item.Name.toLowerCase().includes(filter.toLowerCase()));

                        if (filterActive && filteredItems.length === 0) {
                            return null;
                        }

                        const isExpanded = expandedTypes.has(type) || filterActive;

                        return (
                            <div key={type}>
                                <button onClick={() => !filterActive && toggleType(type)} className={`${navLinkClasses} ${activeType === type && !activeItem ? activeClassName : inactiveClassName} justify-between group`}>
                                    <div className="flex items-center">
                                        {getCategoryIcon(type)}
                                        <span className={`font-semibold ${activeType === type && !activeItem ? 'text-white' : 'text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white'}`}>{type}</span>
                                    </div>
                                    {!filterActive && (
                                        <ChevronRightIcon className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''} text-gray-400`} />
                                    )}
                                </button>
                                {isExpanded && (
                                    <ul className="pl-3 mt-1 space-y-0.5 border-l-2 border-gray-200 dark:border-gray-700 ml-[1.125rem]">
                                        {filteredItems.map(item => {
                                            const h = itemHistory[item.Name];
                                            const addedVerNum = h?.added ? parseFloat(h.added.replace(/^v/, '')) : 0;
                                            const deletedVerNum = h?.deleted ? parseFloat(h.deleted.replace(/^v/, '')) : Infinity;
                                            const showAdded = h?.added && addedVerNum <= currentVerNum;
                                            const showDeleted = h?.deleted && deletedVerNum > currentVerNum;

                                            return (
                                                <li key={item.Name}>
                                                    <NavLink
                                                        to={`/${currentVersion}/${TypeUrls[itemType]}/${encodeURIComponent(type)}/${encodeURIComponent(item.Name)}`}
                                                        onClick={onClose}
                                                        className={({ isActive }) => `flex flex-col items-start w-full px-2 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 text-left ${isActive ? activeClassName : inactiveClassName}`}
                                                    >
                                                        <span className="truncate font-mono w-full">{item.Name}</span>
                                                        {(showAdded || showDeleted) && (
                                                            <div className="flex gap-1 mt-0.5 flex-wrap">
                                                                {showAdded && <span className="text-[9px] bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-1 rounded leading-none">+{h.added?.replace(/^v/, '')}</span>}
                                                                {showDeleted && <span className="text-[9px] bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-1 rounded leading-none">Del v{h.deleted?.replace(/^v/, '')}</span>}
                                                            </div>
                                                        )}
                                                    </NavLink>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        );
                    })
                )}
            </nav>
        </div>
    );
};

export default ItemSidebar;