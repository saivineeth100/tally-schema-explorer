import React from 'react';
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

    if (activeType) {
        const title = `${activeType} ${typeTitles[itemType]}`;

        return (
            <div className="p-4 sm:p-6 md:p-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{title}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                        Showing items for <span className="font-semibold text-cyan-500 dark:text-cyan-400">Version {version}</span>. Select an item to view details.
                    </p>
                </header>

                {items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {items.sort((a, b) => a.Name.localeCompare(b.Name)).map(item => (
                            <Link
                                key={item.Name}
                                to={`/${version}/${TypeUrls[itemType]}/${encodeURIComponent(activeType)}/${encodeURIComponent(item.Name)}`}
                                className="block bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ease-in-out group border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-400"
                            >
                                <div className="flex items-center mb-3">
                                    <div className="p-2 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg mr-4">
                                        <IconComponent className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate font-mono">
                                        {item.Name}
                                    </h2>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.Description}</p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <IconComponent className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Items Found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No items were found for this category and version.</p>
                    </div>
                )}
            </div>
        );
    }

    const categoryTitles: Record<ItemType, string> = {
        Function: "Function Categories",
        definition: "Definition Categories",
        action: "Action Categories",
    };

    const title = categoryTitles[itemType];

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <header className="mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{title}</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400">
                    Core categories for <span className="font-semibold text-cyan-500 dark:text-cyan-400">Version {version}</span>. Select a category to view its items.
                </p>
            </header>

            {types.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {types.sort().map(type => (
                        <Link
                            key={type}
                            to={`/${version}/${TypeUrls[itemType]}/${encodeURIComponent(type)}`}
                            className="block bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ease-in-out group border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-400"
                        >
                            <div className="flex items-center">
                                <div className="p-2 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg mr-4">
                                    <IconComponent className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                    {type}
                                </h2>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <IconComponent className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Categories Found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No categories were found for this item type for this version.</p>
                </div>
            )}
        </div>
    );
};

export default ItemWelcome;
