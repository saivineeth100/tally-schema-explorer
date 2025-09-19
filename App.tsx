

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/Header';
import Spinner from './components/Spinner';
import Footer from './components/Footer';

import LandingPage from './pages/landing/LandingPage';
import SchemaPage from './pages/schema/SchemaPage';
import ComparePage from './pages/compare/ComparePage';
import FunctionsPage from './pages/functions/FunctionsPage';
import DefinitionsPage from './pages/definitions/DefinitionsPage';
import ActionsPage from './pages/actions/ActionsPage';

import { SchemaIndex } from './types';
import { VersionProvider, useVersion } from './contexts/VersionContext';

const AppContent: React.FC = () => {
    const [schemaIndex, setSchemaIndex] = useState<SchemaIndex | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { setAvailableVersions, currentVersion } = useVersion();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const schemasRes = await fetch('/schemas/_index.json');
                
                if (!schemasRes.ok) {
                    throw new Error('Failed to fetch main schema index file');
                }
                const schemasData = await schemasRes.json();
                
                setSchemaIndex(schemasData);

                const versions = Object.keys(schemasData).sort((a, b) => Number(b.substring(1)) - Number(a.substring(1)));
                setAvailableVersions(versions);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [setAvailableVersions]);

    if (loading) return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
    if (!schemaIndex) return <div className="p-4 text-center">Could not load application data.</div>;

    const allVersions = Object.keys(schemaIndex).sort((a, b) => Number(b.substring(1)) - Number(a.substring(1)));
    const initialVersion = currentVersion || (allVersions.length > 0 ? allVersions[0] : '');
    
    if (!initialVersion) {
        return <div className="p-4 text-center">No versions found.</div>
    }

    const compareToVersion = allVersions.length > 0 ? allVersions[0] : '';
    const compareFromVersion = allVersions.length > 1 ? allVersions[1] : compareToVersion;

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 w-full">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    
                    <Route path="/schema" element={<Navigate to={`/schema/${initialVersion}`} replace />} />
                    <Route path="/schema/:version" element={<SchemaPage schemaIndex={schemaIndex} />} />
                    <Route path="/schema/:version/schema/:schemaName" element={<SchemaPage schemaIndex={schemaIndex} />} />

                    <Route path="/functions" element={<Navigate to={`/functions/${initialVersion}`} replace />} />
                    <Route path="/functions/:version" element={<FunctionsPage />} />
                    <Route path="/functions/:version/:type" element={<FunctionsPage />} />
                    <Route path="/functions/:version/:type/:itemName" element={<FunctionsPage />} />
                    
                    <Route path="/definitions" element={<Navigate to={`/definitions/${initialVersion}`} replace />} />
                    <Route path="/definitions/:version" element={<DefinitionsPage />} />
                    <Route path="/definitions/:version/:type" element={<DefinitionsPage />} />
                    <Route path="/definitions/:version/:type/:itemName" element={<DefinitionsPage />} />

                    <Route path="/actions" element={<Navigate to={`/actions/${initialVersion}`} replace />} />
                    <Route path="/actions/:version" element={<ActionsPage />} />
                    <Route path="/actions/:version/:type" element={<ActionsPage />} />
                    <Route path="/actions/:version/:type/:itemName" element={<ActionsPage />} />

                    <Route path="/compare" element={<Navigate to={`/compare/${compareFromVersion}/${compareToVersion}`} replace />} />
                    <Route path="/compare/:fromVersion/:toVersion" element={<ComparePage schemaIndex={schemaIndex} />} />
                    <Route path="/compare/:fromVersion/:toVersion/schema/:schemaName" element={<ComparePage schemaIndex={schemaIndex} />} />
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

export default App;