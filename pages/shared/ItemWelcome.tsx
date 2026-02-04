import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BoltIcon, CodeIcon, DocumentIcon } from '../../components/icons';
import { TallyFunction, DefinitionAttribute, TallyAction } from '../../types';

type Item = TallyFunction | DefinitionAttribute | TallyAction;
type ItemType = 'Function' | 'Definition' | 'Action';

interface ItemWelcomeProps {
    version: string;
    itemType: ItemType;
    activeType?: string;
    types: string[];
    items: Item[];
    basePath: string;
}

export const TypeUrls: Record<ItemType, string> = {
    Function: "functions",
    Definition: "definitions",
    Action: "actions",
};

const ItemWelcome: React.FC<ItemWelcomeProps> = ({ version, itemType, activeType, types, items, basePath }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const typeTitles: Record<ItemType, string> = {
        Function: "Functions",
        Definition: "Attributes",
        Action: "Actions",
    };

    const icons: Record<ItemType, React.FC<{ className?: string }>> = {
        Function: CodeIcon,
        Definition: DocumentIcon,
        Action: BoltIcon,
    };
    const IconComponent = icons[itemType];

    const normalize = (str: string) => str.replace(/\s+/g, '').toLowerCase();
    const query = normalize(searchTerm);

    if (activeType) {
        const title = `${activeType} ${typeTitles[itemType]}`;
        const filteredItems = items.filter(item =>
            !query || normalize(item.Name).includes(query) || (item.Description && normalize(item.Description).includes(query))
        ).sort((a, b) => a.Name.localeCompare(b.Name));

        return (
            <div className="min-h-full">
                {/* Sticky Header with Search */}
                <div className="sticky top-16 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="px-6 py-6 sm:px-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/20">
                                    <IconComponent className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                        {title}
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        <span className="font-medium text-cyan-600 dark:text-cyan-400">Version {version}</span> • {filteredItems.length} items
                                    </p>
                                </div>
                            </div>
                            {/* Search input */}
                            <div className="relative w-full sm:w-72">
                                <input
                                    type="text"
                                    placeholder={`Search ${typeTitles[itemType].toLowerCase()}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block pl-10 pr-10 py-2.5"
                                />
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8">
                    {filteredItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredItems.map(item => (
                                <Link
                                    key={item.Name}
                                    to={`/${version}/${TypeUrls[itemType]}/${encodeURIComponent(activeType)}/${encodeURIComponent(item.Name)}`}
                                    className="group relative bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all duration-200 hover:shadow-lg"
                                >
                                    <div className="flex items-start gap-4 mb-3">
                                        <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/30 transition-colors">
                                            <IconComponent className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate font-mono">
                                                {item.Name}
                                            </h2>
                                        </div>
                                        <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 pl-[3.25rem]">{item.Description}</p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <IconComponent className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                {searchTerm ? 'No matching items' : 'No Items Found'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {searchTerm ? `No items match "${searchTerm}"` : 'No items were found for this category and version.'}
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-4 text-cyan-600 dark:text-cyan-400 hover:underline text-sm"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const categoryTitles: Record<ItemType, string> = {
        Function: "Function Categories",
        Definition: "Definition Categories",
        Action: "Action Categories",
    };

    const title = categoryTitles[itemType];
    const filteredTypes = types.filter(type =>
        !query || normalize(type).includes(query)
    ).sort();


    return (
        <div className="min-h-full">
            {/* Sticky Header with Search */}
            <div className="sticky top-16 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="px-6 py-6 sm:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/20">
                                <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                    {title}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    <span className="font-medium text-cyan-600 dark:text-cyan-400">Version {version}</span> • {filteredTypes.length} categories
                                </p>
                            </div>
                        </div>
                        {/* Search input */}
                        <div className="relative w-full sm:w-72">
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block pl-10 pr-10 py-2.5"
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
                {filteredTypes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredTypes.map(type => (
                            <Link
                                key={type}
                                to={`/${version}/${TypeUrls[itemType]}/${encodeURIComponent(type)}`}
                                className="group relative bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all duration-200 hover:shadow-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/30 transition-colors">
                                        <IconComponent className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                                            {type}
                                        </h2>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <IconComponent className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                            {searchTerm ? 'No matching categories' : 'No Categories Found'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {searchTerm ? `No categories match "${searchTerm}"` : 'No categories were found for this item type for this version.'}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-4 text-cyan-600 dark:text-cyan-400 hover:underline text-sm"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItemWelcome;
