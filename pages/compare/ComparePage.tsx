import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChangesSummary from '../../components/ChangesSummary';
import SchemaDiffView from '../../components/SchemaDiffView';
import ItemDiffView from '../../components/ItemDiffView';
import VersionSelector from '../../components/VersionSelector';
import CompareInstructions from './CompareInstructions';
import { SchemaIndex } from '../../types';
import MobileSidebar from '../../components/MobileSidebar';
import { MenuIcon } from '../../components/icons';
import { useVersion } from '../../contexts/VersionContext';

const CompareSidebar: React.FC<{
    allVersions: string[];
    fromVersion: string;
    toVersion: string;
    onFromChange: (v: string) => void;
    onToChange: (v: string) => void;
}> = ({ allVersions, fromVersion, toVersion, onFromChange, onToChange }) => {

    const getVerNum = (v: string) => parseFloat(v.replace(/^v/, ''));

    // Filter Logic:
    // From Version Selector: Should show versions LESS THAN selected To Version
    // To Version Selector: Should show versions GREATER THAN selected From Version

    const fromOptions = allVersions.filter(v => {
        if (!toVersion) return true;
        return getVerNum(v) < getVerNum(toVersion);
    });

    const toOptions = allVersions.filter(v => {
        if (!fromVersion) return true;
        return getVerNum(v) > getVerNum(fromVersion);
    });

    return (
        <div className="p-4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Compare Versions</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="from-version" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From</label>
                    <VersionSelector
                        id="from-version"
                        versions={fromOptions}
                        currentVersion={fromVersion}
                        onChange={onFromChange}
                    />
                </div>
                <div>
                    <label htmlFor="to-version" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
                    <VersionSelector
                        id="to-version"
                        versions={toOptions}
                        currentVersion={toVersion}
                        onChange={onToChange}
                    />
                </div>
            </div>
        </div>
    );
};


const ComparePage: React.FC<{ schemaIndex: SchemaIndex }> = ({ schemaIndex }) => {
    const { fromVersion, toVersion, type, itemName } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { availableVersions } = useVersion();

    const getVerNum = (v: string) => parseFloat(v.replace(/^v/, ''));
    const allVersions = [...availableVersions].sort((a, b) => getVerNum(b) - getVerNum(a));

    // Defaults: To = Latest, From = Previous (or nothing/latest-1)
    // If we have at least 2 versions:
    // defaultTo = allVersions[0] (Latest)
    // defaultFrom = allVersions.length > 1 ? allVersions[1] : '';
    const defaultTo = allVersions.length > 0 ? allVersions[0] : '';
    const defaultFrom = allVersions.length > 1 ? allVersions[1] : '';

    const currentFrom = fromVersion || defaultFrom;
    const currentTo = toVersion || defaultTo;

    const handleFromChange = (newFrom: string) => {
        // When changing From, keep current To and preserve type/itemName if present
        const basePath = `/compare/${newFrom}/${currentTo}`;
        const fullPath = type && itemName ? `${basePath}/${type}/${itemName}` : basePath;
        navigate(fullPath);
        setSidebarOpen(false);
    };

    const handleToChange = (newTo: string) => {
        // When changing To, keep current From and preserve type/itemName if present
        const basePath = `/compare/${currentFrom}/${newTo}`;
        const fullPath = type && itemName ? `${basePath}/${type}/${itemName}` : basePath;
        navigate(fullPath);
        setSidebarOpen(false);
    };

    const isValidSelection = fromVersion && toVersion && fromVersion !== toVersion && allVersions.includes(fromVersion) && allVersions.includes(toVersion);

    const isInverse = getVerNum(currentFrom) > getVerNum(currentTo);

    // Effective versions for sidebar display (swap if inverse)
    const effectiveFrom = isInverse ? currentTo : currentFrom;
    const effectiveTo = isInverse ? currentFrom : currentTo;

    const sidebarContent = (
        <CompareSidebar
            allVersions={allVersions}
            fromVersion={effectiveFrom}
            toVersion={effectiveTo}
            onFromChange={handleFromChange}
            onToChange={handleToChange}
        />
    );

    let mainContent;
    if (!isValidSelection) {
        mainContent = <CompareInstructions />;
    } else if (itemName && type) {
        if (type.toLowerCase() === 'schema') {
            mainContent = <SchemaDiffView key={`${fromVersion}-${toVersion}-${itemName}`} />;
        } else {
            mainContent = <ItemDiffView key={`${fromVersion}-${toVersion}-${type}-${itemName}`} />;
        }
    } else {
        mainContent = <ChangesSummary key={`${fromVersion}-${toVersion}`} schemaIndex={schemaIndex} />;
    }

    return (
        <div className="flex">
            <aside className="w-64 flex-shrink-0 hidden lg:block sticky top-16 h-[calc(100vh-4rem)]">
                {sidebarContent}
            </aside>
            <main className="flex-1 bg-gray-50 dark:bg-gray-900 w-full">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 m-2 fixed bottom-4 right-4 bg-cyan-500 text-white rounded-full shadow-lg z-30">
                    <MenuIcon className="w-6 h-6" />
                </button>
                <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
                    {sidebarContent}
                </MobileSidebar>
                {mainContent}
            </main>
        </div>
    );
};

export default ComparePage;