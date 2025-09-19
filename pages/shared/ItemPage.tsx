import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ItemView from '../../components/ItemView';
import ItemSidebar from '../../components/ItemSidebar';
import MobileSidebar from '../../components/MobileSidebar';
import Spinner from '../../components/Spinner';
import { MenuIcon } from '../../components/icons';
import { TallyFunction, DefinitionAttribute, TallyAction } from '../../types';
import { useVersion } from '../../contexts/VersionContext';
import ItemWelcome from '../ItemWelcome';

type ItemType = 'function' | 'definition' | 'action';
type ItemIndex = Record<string, string[]>;
type ItemData = TallyFunction | DefinitionAttribute | TallyAction;
type ItemsByType = Record<string, Record<string, ItemData>>;

interface ItemPageProps {
    itemType: ItemType;
}

const ItemPage: React.FC<ItemPageProps> = ({ itemType }) => {
    const params = useParams<{ version: string; type?: string; itemName?: string }>();
    const { version, type: itemCategory, itemName } = params;
    
    const navigate = useNavigate();
    const { availableVersions, currentVersion, setCurrentVersion } = useVersion();
    
    const basePath = `/${itemType}s`;
    const versionForPage = (version && availableVersions.includes(version)) ? version : (currentVersion || (availableVersions.length > 0 ? availableVersions[0] : ''));

    const [itemIndex, setItemIndex] = useState<ItemIndex | null>(null);
    const [indexLoading, setIndexLoading] = useState(true);
    const [indexError, setIndexError] = useState<string | null>(null);

    const [allItems, setAllItems] = useState<ItemsByType>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchItemIndex = async () => {
            setIndexLoading(true);
            setIndexError(null);
            try {
                const response = await fetch(`${basePath}/_index.json`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${itemType} index file`);
                }
                const data = await response.json();
                setItemIndex(data);
            } catch (err) {
                setIndexError(err instanceof Error ? err.message : `An unknown error occurred while fetching ${itemType} index.`);
            } finally {
                setIndexLoading(false);
            }
        };
        fetchItemIndex();
    }, [basePath, itemType]);

    useEffect(() => {
        if (version && availableVersions.includes(version)) {
            setCurrentVersion(version);
        }
    }, [version, availableVersions, setCurrentVersion]);

    useEffect(() => {
        if ((!version || !availableVersions.includes(version)) && availableVersions.length > 0) {
            navigate(`${basePath}/${currentVersion || availableVersions[0]}`, { replace: true });
        }
    }, [version, availableVersions, navigate, currentVersion, basePath]);

    useEffect(() => {
        const fetchAllItemsForVersion = async () => {
            if (!versionForPage || !itemIndex) return;

            setLoading(true);
            setError(null);
            setAllItems({});
            
            try {
                const typesToFetch = itemIndex[versionForPage] || [];
                const itemsPromises = typesToFetch.map(async (type) => {
                    const response = await fetch(`${basePath}/${versionForPage}/${encodeURIComponent(type)}.json`);
                    if (!response.ok) {
                        console.warn(`Could not load ${itemType}s for ${type} (version ${versionForPage}). File might not exist.`);
                        return { type, data: {} };
                    }
                    const data: Record<string, ItemData> = await response.json();
                    return { type, data };
                });
                
                const results = await Promise.all(itemsPromises);
                const itemsMap = results.reduce((acc, { type, data }) => {
                    acc[type] = data;
                    return acc;
                }, {} as ItemsByType);

                setAllItems(itemsMap);
            } catch (err) {
                 setError(err instanceof Error ? err.message : `An unknown error occurred while fetching ${itemType}s.`);
            } finally {
                setLoading(false);
            }
        };

        fetchAllItemsForVersion();
    }, [versionForPage, itemIndex, basePath, itemType]);

    const handleVersionChange = (newVersion: string) => {
        if (!itemIndex) return;
        const firstTypeForNewVersion = itemIndex[newVersion]?.[0];
        if (itemCategory && itemIndex[newVersion]?.includes(itemCategory)) {
             navigate(`${basePath}/${newVersion}/${encodeURIComponent(itemCategory)}`);
        } else if (firstTypeForNewVersion) {
            navigate(`${basePath}/${newVersion}/${encodeURIComponent(firstTypeForNewVersion)}`);
        } else {
            navigate(`${basePath}/${newVersion}`);
        }
    };

    const itemData = itemCategory && itemName && allItems[itemCategory] ? allItems[itemCategory][itemName] : null;
    
    if (indexLoading || (!versionForPage && availableVersions.length > 0)) {
        return <div className="flex items-center justify-center h-full"><Spinner /></div>;
    }
    
    if (indexError) {
        return <div className="p-8 text-red-600 dark:text-red-400 text-center">{indexError}</div>;
    }

    if (!itemIndex) {
        return <div className="p-8 text-center">Could not load item index.</div>;
    }

    const sidebarContent = (
        <ItemSidebar
            itemType={itemType}
            basePath={basePath}
            availableVersions={availableVersions}
            currentVersion={versionForPage}
            onVersionChange={handleVersionChange}
            filter={filter}
            onFilterChange={setFilter}
            itemsByType={allItems}
            activeType={itemCategory}
            activeItem={itemName}
            onClose={() => setSidebarOpen(false)}
        />
    );

    return (
         <div className="flex">
            <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
                {sidebarContent}
            </aside>
            <main className="flex-1 bg-gray-50 dark:bg-gray-900 w-full">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 m-2 fixed bottom-4 right-4 bg-cyan-500 text-white rounded-full shadow-lg z-30">
                    <MenuIcon className="w-6 h-6" />
                </button>
                <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
                    {sidebarContent}
                </MobileSidebar>
                {loading && <Spinner />}
                {error && <div className="p-8 text-red-600 dark:text-red-400 text-center">{error}</div>}
                {!loading && !error && (
                    (() => {
                        if (itemData) {
                            return <ItemView item={itemData} itemType={itemType} />;
                        }
                        const itemsForCategory = itemCategory ? Object.values(allItems[itemCategory] || {}) : [];
                        return <ItemWelcome 
                                    version={versionForPage} 
                                    itemType={itemType} 
                                    activeType={itemCategory} 
                                    types={itemIndex[versionForPage] || []}
                                    items={itemsForCategory}
                                    basePath={basePath}
                                />;
                    })()
                )}
            </main>
        </div>
    );
};

export default ItemPage;