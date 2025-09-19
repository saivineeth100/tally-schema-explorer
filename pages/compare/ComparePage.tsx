import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChangesSummary from '../../components/ChangesSummary';
import SchemaDiffView from '../../components/SchemaDiffView';
import VersionSelector from '../../components/VersionSelector';
import CompareInstructions from './CompareInstructions';
import { SchemaIndex } from '../../types';
import MobileSidebar from '../../components/MobileSidebar';
import { MenuIcon } from '../../components/icons';

const CompareSidebar: React.FC<{
    allVersions: string[];
    fromVersion: string;
    toVersion: string;
    onFromChange: (v: string) => void;
    onToChange: (v: string) => void;
}> = ({ allVersions, fromVersion, toVersion, onFromChange, onToChange }) => (
    <div className="p-4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Compare Versions</h3>
        <div className="space-y-4">
             <div>
                <label htmlFor="from-version" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From</label>
                <VersionSelector
                    id="from-version"
                    versions={allVersions.filter(v => v !== toVersion)}
                    currentVersion={fromVersion}
                    onChange={onFromChange}
                />
            </div>
            <div>
                <label htmlFor="to-version" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
                <VersionSelector
                    id="to-version"
                    versions={allVersions.filter(v => v !== fromVersion)}
                    currentVersion={toVersion}
                    onChange={onToChange}
                />
            </div>
        </div>
    </div>
);


const ComparePage: React.FC<{ schemaIndex: SchemaIndex }> = ({ schemaIndex }) => {
    const { fromVersion, toVersion, schemaName } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const allVersions = Object.keys(schemaIndex).sort((a, b) => Number(b.substring(1)) - Number(a.substring(1)));

    const handleFromChange = (newFrom: string) => {
        if(toVersion) {
            navigate(`/compare/${newFrom}/${toVersion}`);
        }
        setSidebarOpen(false);
    };

    const handleToChange = (newTo: string) => {
        if (fromVersion) {
            navigate(`/compare/${fromVersion}/${newTo}`);
        }
        setSidebarOpen(false);
    };
    
    const isValidSelection = fromVersion && toVersion && fromVersion !== toVersion && allVersions.includes(fromVersion) && allVersions.includes(toVersion);
    
    const sidebarContent = (
        <CompareSidebar 
            allVersions={allVersions}
            fromVersion={fromVersion || (allVersions.length > 1 ? allVersions[1] : '')}
            toVersion={toVersion || (allVersions.length > 0 ? allVersions[0] : '')}
            onFromChange={handleFromChange}
            onToChange={handleToChange}
        />
    );

    const mainContent = !isValidSelection ? <CompareInstructions /> : (
        schemaName 
            ? <SchemaDiffView key={`${fromVersion}-${toVersion}-${schemaName}`} /> 
            : <ChangesSummary key={`${fromVersion}-${toVersion}`} schemaIndex={schemaIndex} />
    );

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