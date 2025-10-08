

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import Header from './components/Header';
import Spinner from './components/Spinner';
import Footer from './components/Footer';

import LandingPage from './pages/landing/LandingPage';
import SchemaPage from './pages/schema/SchemaPage';
import ComparePage from './pages/compare/ComparePage';
import FunctionsPage from './pages/functions/FunctionsPage';
import DefinitionsPage from './pages/definitions/DefinitionsPage';
import ActionsPage from './pages/actions/ActionsPage';

import { VersionProvider, useVersion } from './contexts/VersionContext';

const AppContent: React.FC = () => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { setAvailableVersions, currentVersion, availableVersions } = useVersion();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const versionsResp = await fetch("/Data/versions.json");
                // const schemasRes = await fetch('/schemas/_index.json');

                if (!versionsResp.ok) {
                    throw new Error('Failed to fetch versions index file');
                }
                // const schemasData = await schemasRes.json();

                // setSchemaIndex(schemasData);
                const versions = await versionsResp.json();
                // const versions = Object.keys(schemasData).sort((a, b) => Number(b.substring(1)) - Number(a.substring(1)));
                setAvailableVersions(versions as unknown as string[]);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [setAvailableVersions]);

    if (loading) return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
    // if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
    // if (!schemaIndex) return <div className="p-4 text-center">Could not load application data.</div>;

    const initialVersion = currentVersion || (availableVersions.length > 0 ? availableVersions[availableVersions.length - 1] : '');

    // if (!initialVersion) {
    //     return <div className="p-4 text-center">No versions found.</div>
    // }

    const compareToVersion = availableVersions.length > 0 ? availableVersions[0] : '';
    const compareFromVersion = availableVersions.length > 1 ? availableVersions[1] : compareToVersion;

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 w-full">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    {initialVersion ? (
                        <>
                            <Route path="/schema" element={<Navigate to={`/${initialVersion}/schema`} replace />} />
                            <Route path="/functions" element={<Navigate to={`/${initialVersion}/functions`} replace />} />
                            <Route path="/definitions" element={<Navigate to={`/${initialVersion}/definitions`} replace />} />
                            <Route path="/actions" element={<Navigate to={`/${initialVersion}/actions`} replace />} />


                            <Route path="/compare" element={<Navigate to={`/${compareFromVersion}/compare/${compareToVersion}`} replace />} />
                        </>
                    ) :
                        (<></>)
                    }
                    <Route path="/:version" element={<VersionLayout />}>
                        <Route
                            path="schema/:schemaName?"
                            element={<SchemaPage />}
                        />
                        <Route
                            path="functions/:type?/:itemName?"
                            element={<FunctionsPage />}
                        />
                        <Route
                            path="definitions/:type?/:itemName?"
                            element={<DefinitionsPage />}
                        />
                        <Route
                            path="actions/:type?/:itemName?"
                            element={<ActionsPage />}
                        />
                    </Route>
                    {/* 
               
                   
                    <Route path="/compare" element={<Navigate to={`/compare/${compareFromVersion}/${compareToVersion}`} replace />} />
                    <Route path="/compare/:fromVersion/:toVersion" element={<ComparePage schemaIndex={schemaIndex} />} />
                    <Route path="/compare/:fromVersion/:toVersion/schema/:schemaName" element={<ComparePage schemaIndex={schemaIndex} />} />
                 */}
                </Routes>
            </main>
            <Footer />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <VersionProvider>
            <AppContent />
        </VersionProvider>
    )
}
const VersionLayout = () => { return <><Outlet /></> }
export default App;