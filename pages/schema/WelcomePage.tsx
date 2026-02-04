import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../../components/Spinner';
import { DocumentIcon } from '../../components/icons';

interface PrimarySchema {
    sdfId: string;
    name: string;
}

const WelcomePage: React.FC<{ version: string }> = ({ version }) => {
    const [primarySchemas, setPrimarySchemas] = useState<PrimarySchema[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!version) {
            setLoading(false);
            setPrimarySchemas([]);
            return;
        }

        const fetchPrimarySchemas = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/Data/${version}/Schema/AllSchemas.json`);
                if (!response.ok) throw new Error('Failed to fetch schemas');
                const data = await response.json() as Record<string, string>;

                // Convert to array and sort by name
                const schemas = Object.entries(data)
                    .map(([sdfId, name]) => ({ sdfId, name }))
                    .sort((a, b) => a.name.localeCompare(b.name));

                setPrimarySchemas(schemas);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchPrimarySchemas();
    }, [version]);

    const filteredSchemas = useMemo(() => {
        if (!searchQuery.trim()) return primarySchemas;

        const normalize = (str: string) => str.replace(/\s+/g, '').toLowerCase();
        const query = normalize(searchQuery);

        return primarySchemas.filter(
            schema => normalize(schema.name).includes(query) || normalize(schema.sdfId).includes(query)
        );
    }, [primarySchemas, searchQuery]);

    if (loading) return <Spinner />;
    if (error) return <div className="p-8 text-red-600 dark:text-red-400 text-center">{error}</div>;

    return (
        <div className="min-h-full">
            {/* Sticky Header with Search */}
            <div className="sticky top-16 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="px-6 py-6 sm:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/20">
                                <DocumentIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                    Primary Schemas
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    <span className="font-medium text-cyan-600 dark:text-cyan-400">Version {version}</span> • {filteredSchemas.length} of {primarySchemas.length} schemas
                                </p>
                            </div>
                        </div>
                        {/* Search input */}
                        <div className="relative w-full sm:w-72">
                            <input
                                type="text"
                                placeholder="Search schemas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block pl-10 pr-10 py-2.5"
                                aria-label="Search schemas"
                            />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    aria-label="Clear search"
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
                {filteredSchemas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredSchemas.map(schema => (
                            <Link
                                key={schema.name}
                                to={`/${version}/schema/${schema.name}`}
                                className="group relative bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all duration-200 hover:shadow-lg"
                            >
                                {/* Card content */}
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-cyan-50 dark:group-hover:bg-cyan-900/30 transition-colors">
                                        <DocumentIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                                            {schema.name}
                                        </h2>
                                        <div className="mt-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-400 dark:text-gray-500">SDF Id:</span>
                                                <span className="font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{schema.sdfId}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Arrow indicator */}
                                    <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>

                                {/* Primary badge */}
                                <div className="absolute top-3 right-3">
                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300">
                                        Primary
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                            <DocumentIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {searchQuery ? 'No matching schemas' : 'No Primary Schemas'}
                        </h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                            {searchQuery ? `No schemas match "${searchQuery}"` : 'No schemas available for this version.'}
                        </p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
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

export default WelcomePage;