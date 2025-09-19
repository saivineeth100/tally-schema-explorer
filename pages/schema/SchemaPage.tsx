import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SchemaView from '../../components/SchemaView';
import WelcomePage from './WelcomePage';
import SchemaSidebar from '../../components/SchemaSidebar';
import MobileSidebar from '../../components/MobileSidebar';
import { MenuIcon } from '../../components/icons';
import { SchemaIndex } from '../../types';
import { useVersion } from '../../contexts/VersionContext';
import Spinner from '../../components/Spinner';

const SchemaPage: React.FC<{ schemaIndex: SchemaIndex }> = ({ schemaIndex }) => {
    const { version, schemaName } = useParams<{ version: string; schemaName?: string }>();
    const navigate = useNavigate();
    const { availableVersions, currentVersion, setCurrentVersion } = useVersion();
    
    const versionForPage = (version && availableVersions.includes(version)) ? version : (currentVersion || (availableVersions.length > 0 ? availableVersions[0] : ''));
    
    const [filter, setFilter] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (version && availableVersions.includes(version)) {
            setCurrentVersion(version);
        }
    }, [version, availableVersions, setCurrentVersion]);

    useEffect(() => {
        if ((!version || !availableVersions.includes(version)) && availableVersions.length > 0) {
            navigate(`/schema/${currentVersion || availableVersions[0]}`, { replace: true });
        }
    }, [version, availableVersions, navigate, currentVersion]);

    const handleVersionChange = (newVersion: string) => {
        navigate(`/schema/${newVersion}`);
    };

    const schemaNamesForVersion = schemaIndex[versionForPage] || [];
    const filteredSchemaNames = schemaNamesForVersion
        .filter(name => name.toLowerCase().includes(filter.toLowerCase()))
        .sort();

    const sidebarContent = (
        <SchemaSidebar
            availableVersions={availableVersions}
            currentVersion={versionForPage}
            onVersionChange={handleVersionChange}
            filter={filter}
            onFilterChange={setFilter}
            filteredSchemaNames={filteredSchemaNames}
            onClose={() => setSidebarOpen(false)}
        />
    );

    if (!versionForPage) {
        return <Spinner />;
    }
    
    return (
        <div className="flex">
            <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
                {sidebarContent}
            </aside>
            <main className="flex-1 bg-gray-50 dark:bg-gray-900 w-full">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 m-2 fixed bottom-4 right-4 bg-cyan-500 text-white rounded-full shadow-lg z-30">
                    <MenuIcon className="w-6 h-6" />
                </button>
                <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
                    {sidebarContent}
                </MobileSidebar>
                {schemaName ? <SchemaView /> : <WelcomePage version={versionForPage} schemaNames={schemaNamesForVersion} />}
            </main>
        </div>
    );
};

export default SchemaPage;