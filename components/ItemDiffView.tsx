import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ItemDiff, PropertyChange } from '../types';
import Spinner from './Spinner';
import { useVersion } from '../contexts/VersionContext';

const DiffSection: React.FC<{ title: string; children: React.ReactNode; color: 'green' | 'red' | 'cyan' }> = ({ title, children, color }) => {
    if (!React.Children.count(children)) return null;

    const colors = {
        green: 'border-green-500/50 text-green-800 dark:text-green-300',
        red: 'border-red-500/50 text-red-800 dark:text-red-300',
        cyan: 'border-cyan-500/50 text-cyan-800 dark:text-cyan-300',
    }

    const titleColors = {
        green: 'text-green-600 dark:text-green-400',
        red: 'text-red-600 dark:text-red-400',
        cyan: 'text-cyan-600 dark:text-cyan-400',
    }

    return (
        <div className={`mb-8 border-l-4 ${colors[color]} pl-4`}>
            <h3 className={`text-xl font-semibold mb-3 ${titleColors[color]}`}>{title}</h3>
            {children}
        </div>
    );
};

const MetaList: React.FC<{ meta: [string, string][] }> = ({ meta }) => {
    if (meta.length === 0) return null;
    return (
        <ul className="list-disc list-inside bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
            {meta.map(([key, value]) => (
                <li key={key}><span className="font-semibold">{key}:</span> {value}</li>
            ))}
        </ul>
    );
}

const ModifiedMeta: React.FC<{ meta: [string, PropertyChange<string>][] }> = ({ meta }) => {
    if (meta.length === 0) return null;
    return (
        <ul className="list-disc list-inside bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
            {meta.map(([key, { OldValue, NewValue }]) => (
                <li key={key}>
                    <span className="font-semibold">{key}:</span>
                    <span className="text-red-500 dark:text-red-400 line-through mx-1">{OldValue}</span>
                    &rarr;
                    <span className="text-green-500 dark:text-green-400 mx-1">{NewValue}</span>
                </li>
            ))}
        </ul>
    );
};

const ModifiedParameters: React.FC<{ params: [string, any][] }> = ({ params }) => {
    if (params.length === 0) return null;

    const renderParamChange = (key: string, val: any) => {
        if (val && typeof val === 'object') {
            if (val.hasOwnProperty('OldValue') && val.hasOwnProperty('NewValue')) {
                // Simple PropertyChange
                const oldValue = typeof val.OldValue === 'object' ? JSON.stringify(val.OldValue) : String(val.OldValue);
                const newValue = typeof val.NewValue === 'object' ? JSON.stringify(val.NewValue) : String(val.NewValue);
                return (
                    <li key={key} className="break-all">
                        <span className="font-semibold">{key}:</span>
                        <span className="text-red-500 dark:text-red-400 line-through mx-1">{oldValue}</span>
                        &rarr;
                        <span className="text-green-500 dark:text-green-400 mx-1">{newValue}</span>
                    </li>
                );
            } else if (val.Modified) {
                // Nested diff (e.g. parameters with internal changes)
                return Object.entries(val.Modified).map(([subKey, subVal]: [string, any]) => {
                    const subOldValue = typeof subVal.OldValue === 'object' ? JSON.stringify(subVal.OldValue) : String(subVal.OldValue);
                    const subNewValue = typeof subVal.NewValue === 'object' ? JSON.stringify(subVal.NewValue) : String(subVal.NewValue);
                    return (
                        <li key={`${key}.${subKey}`} className="break-all">
                            <span className="font-semibold">{key}.{subKey}:</span>
                            <span className="text-red-500 dark:text-red-400 line-through mx-1">{subOldValue}</span>
                            &rarr;
                            <span className="text-green-500 dark:text-green-400 mx-1">{subNewValue}</span>
                        </li>
                    );
                });
            }
        }
        return null; // Should not happen if data is well-formed
    };

    return (
        <ul className="list-disc list-inside bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
            {params.map(([key, val]) => renderParamChange(key, val))}
        </ul>
    );
};

const ItemDiffView: React.FC = () => {
    const { fromVersion, toVersion, type, itemName } = useParams<{ fromVersion: string; toVersion: string; type: string; itemName: string }>();
    const [diffs, setDiffs] = useState<{ ver: string; diff: ItemDiff }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getVerNum = (v: string | undefined) => parseFloat((v || '').replace(/^v/, ''));
    const isInverse = getVerNum(fromVersion) > getVerNum(toVersion);

    const effectiveFromVer = isInverse ? toVersion : fromVersion;
    const effectiveToVer = isInverse ? fromVersion : toVersion;

    const { availableVersions } = useVersion();

    useEffect(() => {
        if (!fromVersion || !toVersion || !type || !itemName || availableVersions.length === 0) return;

        // Sort versions to ensure we can find intermediates
        const sortedVersions = [...availableVersions].sort((a, b) => {
            const vA = parseFloat(a.replace(/^v/, ''));
            const vB = parseFloat(b.replace(/^v/, ''));
            return vA - vB;
        });

        const fetchDiff = async () => {
            setLoading(true);
            setError(null);
            setDiffs([]);
            try {
                // Determine version path: effectiveFrom -> effectiveTo
                const fromVal = parseFloat(effectiveFromVer.replace(/^v/, ''));
                const toVal = parseFloat(effectiveToVer.replace(/^v/, ''));

                const intermediateVersions = sortedVersions.filter(v => {
                    const val = parseFloat(v.replace(/^v/, ''));
                    return val > fromVal && val <= toVal;
                });

                if (intermediateVersions.length === 0) {
                    // Should not happen if versions are valid
                    throw new Error(`No versions found between ${effectiveFromVer} and ${effectiveToVer}`);
                }

                // Fetch ALL changelogs
                const promises = intermediateVersions.map(v =>
                    fetch(`/Data/${v}/ChangeLog/${type}/${itemName}.json`)
                        .then(async res => {
                            // Check if valid JSON (not HTML error page)
                            const contentType = res.headers.get("content-type");
                            if (!res.ok || contentType?.includes("text/html")) return null;
                            try {
                                return { ver: v, diff: await res.json() as ItemDiff };
                            } catch {
                                return null;
                            }
                        })
                );

                const results = await Promise.all(promises);
                const validDiffs = results.filter(r => r !== null && r.diff.HasChanges) as { ver: string, diff: ItemDiff }[];

                setDiffs(validDiffs);

            } catch (err) {
                console.error("Diff failed", err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchDiff();
    }, [fromVersion, toVersion, type, itemName, availableVersions]);

    if (loading) return <Spinner />;
    if (error) return <div className="p-8 text-red-600 dark:text-red-400 text-center">{error}</div>;
    if (diffs.length === 0) return <div className="p-8 text-center text-lg">No changes found for <strong>{itemName}</strong> between v{fromVersion?.replace(/^v/, '')} and v{toVersion?.replace(/^v/, '')}.</div>;

    return (
        <div className="p-4 sm:p-6 md:p-8 text-gray-700 dark:text-gray-300">
            <header className="mb-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{type} Changes: {itemName}</h1>
                <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
                    Showing differences from <span className="font-semibold text-cyan-500 dark:text-cyan-400">v{fromVersion?.replace(/^v/, '')}</span> to <span className="font-semibold text-cyan-500 dark:text-cyan-400">v{toVersion?.replace(/^v/, '')}</span>
                </p>
                <Link to={`/compare/${fromVersion}/${toVersion}`} className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline mt-2 inline-block">&larr; Back to Summary</Link>
            </header>

            {diffs.map(({ ver, diff }) => {
                const addedMeta = Object.entries(diff.AddedMeta || {});
                const deletedMeta = Object.entries(diff.DeletedMeta || {});
                const modifiedMeta = Object.entries(diff.ModifiedMeta || {});
                const addedParams = Object.entries(diff.AddedParameters || {});
                const deletedParams = Object.entries(diff.DeletedParameters || {});
                const modifiedParams = Object.entries(diff.ModifiedParameters || {});

                return (
                    <div key={ver} className="mb-12 border-b border-gray-200 dark:border-gray-700 pb-8 last:border-0">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">v{ver}</span>
                            Changes
                        </h2>

                        {diff.DescriptionChanged && (
                            <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-r">
                                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Description Changed</h3>
                                <div className="font-mono text-sm">
                                    <div className="mb-1"><span className="font-semibold text-red-600 dark:text-red-400">Old:</span> {diff.Description?.OldValue || '(none)'}</div>
                                    <div><span className="font-semibold text-green-600 dark:text-green-400">New:</span> {diff.Description?.NewValue}</div>
                                </div>
                            </div>
                        )}

                        {addedMeta.length > 0 && (
                            <DiffSection title="Added Metadata" color="green">
                                <MetaList meta={addedMeta} />
                            </DiffSection>
                        )}

                        {deletedMeta.length > 0 && (
                            <DiffSection title="Deleted Metadata" color="red">
                                <MetaList meta={deletedMeta} />
                            </DiffSection>
                        )}

                        {modifiedMeta.length > 0 && (
                            <DiffSection title="Modified Metadata" color="cyan">
                                <ModifiedMeta meta={modifiedMeta} />
                            </DiffSection>
                        )}

                        {addedParams.length > 0 && (
                            <DiffSection title="Added Parameters" color="green">
                                <ul className="list-disc list-inside bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
                                    {addedParams.map(([key, value]) => (
                                        <li key={key} className="break-all">
                                            <span className="font-semibold">{key}:</span> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                        </li>
                                    ))}
                                </ul>
                            </DiffSection>
                        )}

                        {deletedParams.length > 0 && (
                            <DiffSection title="Deleted Parameters" color="red">
                                <ul className="list-disc list-inside bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
                                    {deletedParams.map(([key, value]) => (
                                        <li key={key} className="break-all">
                                            <span className="font-semibold">{key}:</span> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                        </li>
                                    ))}
                                </ul>
                            </DiffSection>
                        )}

                        {modifiedParams.length > 0 && (
                            <DiffSection title="Modified Parameters" color="cyan">
                                <ModifiedParameters params={modifiedParams} />
                            </DiffSection>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ItemDiffView;
