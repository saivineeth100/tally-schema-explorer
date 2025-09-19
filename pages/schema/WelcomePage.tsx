import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TallySchema } from '../../types';
import Spinner from '../../components/Spinner';
import { DocumentIcon } from '../../components/icons';
import { SCHEMALOCATION } from '@/constants';

const WelcomePage: React.FC<{ version: string; schemaNames: string[] }> = ({ version, schemaNames }) => {
    const [primarySchemas, setPrimarySchemas] = useState<TallySchema[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!version || schemaNames.length === 0) {
            setLoading(false);
            setPrimarySchemas([]);
            return;
        }

        const fetchAllSchemas = async () => {
            setLoading(true);
            setError(null);
            try {
                const schemaPromises = schemaNames.map(name =>
                    fetch(`${SCHEMALOCATION.replace("{version}", version)}/${name}.json`).then(res => {
                        if (!res.ok) throw new Error(`Failed to fetch ${name}`);
                        return res.json();
                    })
                );

                const allSchemasResults = await Promise.allSettled(schemaPromises);

                const successfullyFetchedSchemas = allSchemasResults
                    .filter(result => result.status === 'fulfilled')
                    .map(result => (result as PromiseFulfilledResult<TallySchema>).value);

                const primary = successfullyFetchedSchemas
                    .filter(s => s.Meta['Is Primary'] === 'Yes');

                setPrimarySchemas(primary.sort((a, b) => a.Name.localeCompare(b.Name)));

            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllSchemas();
    }, [version, schemaNames]);

    if (loading) return <Spinner />;
    if (error) return <div className="p-8 text-red-600 dark:text-red-400 text-center">{error}</div>;

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <header className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Primary Schemas</h1>
                <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
                    Core objects for <span className="font-semibold text-cyan-500 dark:text-cyan-400">Version {version}</span>. Select a schema to view details.
                </p>
            </header>

            {primarySchemas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {primarySchemas.map(schema => (
                        <Link
                            key={schema.Name}
                            to={`/${version}/schema/${schema.Name}`}
                            className="block bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ease-in-out group border border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-400"
                        >
                            <div className="flex items-center mb-4">
                                <div className="p-2 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg mr-4">
                                    <DocumentIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                    {schema.Name}
                                </h2>
                            </div>
                            <div className="space-y-2">
                                {Object.entries(schema.Meta).slice(0, 2).map(([key, value]) => (
                                    <div key={key} className="flex text-sm">
                                        <span className="font-semibold text-gray-500 dark:text-gray-400 w-24 flex-shrink-0">{key}:</span>
                                        <span className="text-gray-700 dark:text-gray-300 truncate">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Primary Schemas</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No schemas were marked as "primary" for this version.</p>
                </div>
            )}
        </div>
    );
};

export default WelcomePage;