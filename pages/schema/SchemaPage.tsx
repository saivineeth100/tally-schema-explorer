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
import { SCHEMALOCATION } from '@/constants';
import { useItemHistory } from '../../hooks/useItemHistory';

const SchemaPage: React.FC<{ schemaIndex: SchemaIndex }> = ({ }) => {
    const [schemaIndex, setSchemaIndex] = useState<string[]>([]);
    const { version, schemaName } = useParams<{ version: string; schemaName?: string }>();
    const navigate = useNavigate();
    const { availableVersions, currentVersion, setCurrentVersion } = useVersion();
    const { history: itemHistory } = useItemHistory('Schema');

    const versionForPage = (version && availableVersions.includes(version)) ? version : (currentVersion || (availableVersions.length > 0 ? availableVersions[0] : ''));

    const [filter, setFilter] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (version && availableVersions.includes(version)) {
            setCurrentVersion(version);
        }
        const loadSchemaIndex = async () => {
            const resp = await fetch(`${SCHEMALOCATION.replace("{version}", version)}/index.json`)
            const schemaNames = await resp.json() as string[]
            setSchemaIndex(schemaNames)
        }
        if (version) {
            loadSchemaIndex()
        }

    }, [version, availableVersions, setCurrentVersion]);



    const handleVersionChange = (newVersion: string) => {
        if (schemaName) {
            navigate(`/${newVersion}/schema/${encodeURIComponent(schemaName)}`);
        } else {
            navigate(`/${newVersion}/schema/`);
        }
    };

    const normalizeString = (str: string) => str.replace(/\s+/g, '').toLowerCase();

    const filteredSchemaNames = schemaIndex
        .filter(name => normalizeString(name).includes(normalizeString(filter)))
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
            itemHistory={itemHistory}
        />
    );

    if (!versionForPage) {
        return <Spinner />;
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-r border-gray-200 dark:border-gray-800">
                {sidebarContent}
            </aside>

            {/* Main content */}
            <main className="flex-1 bg-gray-50 dark:bg-gray-900">
                {/* Mobile menu button */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden fixed bottom-6 right-6 p-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-lg shadow-cyan-500/30 z-30 transition-colors"
                    aria-label="Open menu"
                >
                    <MenuIcon className="w-6 h-6" />
                </button>

                {/* Mobile sidebar */}
                <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
                    {sidebarContent}
                </MobileSidebar>

                {/* Page content */}
                {schemaName ? <SchemaView /> : <WelcomePage version={versionForPage} />}
            </main>
        </div>
    );
};

export default SchemaPage;