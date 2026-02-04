import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { TallySchema, TallyProperty, SchemaDiff } from '../types';
import Spinner from './Spinner';
import MetadataView from './MetadataView';
import CopyLinkButton from './CopyLinkButton';
import { useVersion } from '../contexts/VersionContext';
import { SCHEMALOCATION } from '@/constants';

const SchemaView: React.FC = () => {
  const { version, schemaName } = useParams<{ version: string; schemaName: string }>();
  const [schema, setSchema] = useState<TallySchema | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const propertiesContainerRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    if (!version || !schemaName) return;

    const fetchSchema = async () => {
      setLoading(true);
      setError(null);
      setSchema(null);
      try {
        const response = await fetch(`${SCHEMALOCATION.replace("{version}", version)}/${schemaName}.json`);
        if (!response.ok) {
          throw new Error(`Schema not found: ${schemaName} (Version: ${version})`);
        }
        const data: TallySchema = await response.json();
        setSchema(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
    setSearchTerm('');
  }, [version, schemaName]);

  useEffect(() => {
    if (loading || !schema) return;

    const params = new URLSearchParams(location.search);
    const activeProperty = params.get('activeproperty');

    if (activeProperty && propertiesContainerRef.current) {
      const targetRow = propertiesContainerRef.current.querySelector(`tr[data-property-name="${activeProperty}"]`) as HTMLTableRowElement;

      if (targetRow) {
        targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetRow.classList.add('bg-cyan-500/20');

        const timer = setTimeout(() => {
          targetRow.classList.remove('bg-cyan-500/20');
        }, 2500);

        return () => clearTimeout(timer);
      }
    }
  }, [location.search, loading, schema]);

  const { availableVersions } = useVersion();
  const [propertyHistory, setPropertyHistory] = useState<Record<string, { added?: string; deleted?: string }>>({});

  useEffect(() => {
    if (!schema || availableVersions.length === 0) return;

    const fetchHistory = async () => {
      const encodedName = encodeURIComponent(schema.Name);
      const history: Record<string, { added?: string; deleted?: string }> = {};

      // Sort versions ascending
      const sortedVersions = [...availableVersions].sort((a, b) => {
        const vA = parseFloat(a.replace(/^v/, ''));
        const vB = parseFloat(b.replace(/^v/, ''));
        return vA - vB;
      });

      // Fetch all changelogs
      const promises = sortedVersions.map(v =>
        fetch(`/Data/${v}/ChangeLog/Schema/${encodedName}.json`)
          .then(async res => {
            const contentType = res.headers.get("content-type");
            if (!res.ok || contentType?.includes("text/html")) return null;
            return { ver: v, diff: await res.json() as SchemaDiff };
          })
      );

      const results = await Promise.all(promises);

      for (const res of results) {
        if (!res) continue;
        const { ver, diff } = res;

        // Added
        Object.keys(diff.AddedProperties).forEach(prop => {
          if (!history[prop]) history[prop] = {};
          // The FIRST time we see it added is the origin.
          // But wait, if it was deleted then re-added?
          // We'll simplisticly assume last 'Added' before current or just 'Added' in general.
          // Usually properties tend to be stable.
          // Let's record the version.
          history[prop].added = ver;
        });

        // Deleted
        Object.keys(diff.DeletedProperties).forEach(prop => {
          if (!history[prop]) history[prop] = {};
          history[prop].deleted = ver;
        });
      }
      setPropertyHistory(history);
    };

    fetchHistory();
  }, [schema, availableVersions]);

  const [searchTerm, setSearchTerm] = useState('');

  if (loading) return <Spinner />;
  if (error) return <div className="p-8 text-red-600 dark:text-red-400 text-center">{error}</div>;
  if (!schema) return <div className="p-8 text-center">Select a schema to view its details.</div>;

  const filteredProperties: [string, TallyProperty][] = (Object.entries(schema.Properties) as [string, TallyProperty][]).filter(([propName]) =>
    propName.toLowerCase().replace(/\s+/g, '').includes(searchTerm.toLowerCase().replace(/\s+/g, ''))
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 text-gray-700 dark:text-gray-300">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{schema.Name}</h1>
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">Detailed object schema reference.</p>
      </header>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-cyan-500 dark:text-cyan-400 border-b-2 border-gray-200 dark:border-gray-700 pb-2 mb-4">Metadata</h2>
        <MetadataView meta={schema.Meta} />
      </section>

      <section>
        <div className="sticky top-0 md:top-16 z-30 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 pt-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
          <h2 className="text-2xl font-bold text-cyan-500 dark:text-cyan-400">Properties</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full sm:w-64"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-white uppercase tracking-wider">Property Name</th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-white uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-sm font-semibold text-gray-600 dark:text-white uppercase tracking-wider">Repeats</th>
                </tr>
              </thead>
              <tbody ref={propertiesContainerRef} className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No properties found.</td>
                  </tr>
                ) : (
                  filteredProperties.map(([propName, propDetails]) => {
                    const history = propertyHistory[propName] || {};
                    const addedVerNum = history.added ? parseFloat(history.added.replace(/^v/, '')) : 0;
                    const deletedVerNum = history.deleted ? parseFloat(history.deleted.replace(/^v/, '')) : Infinity;
                    const currentVerNum = parseFloat((version || '0').replace(/^v/, ''));

                    // Show "Added vX" if added in a version <= current, AND it's not the base version (assuming base is small?)
                    // Actually, just show what we found.
                    const showAdded = history.added && addedVerNum <= currentVerNum;
                    // Show "Deleted vY" if deleted in a version > current
                    const showDeleted = history.deleted && deletedVerNum > currentVerNum;

                    return (
                      <tr
                        key={propName}
                        data-property-name={propDetails.Name}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-900 dark:text-white">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span>{propDetails.Name}</span>
                              <CopyLinkButton url={`${window.location.href.split('?')[0]}?activeproperty=${encodeURIComponent(propDetails.Name)}`} />
                            </div>
                            <div className="flex gap-2">
                              {showAdded && <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-1.5 py-0.5 rounded">Added in v{history.added?.replace(/^v/, '')}</span>}
                              {showDeleted && <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-1.5 py-0.5 rounded">Deleted in v{history.deleted?.replace(/^v/, '')}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono">
                          {(() => {
                            const objectName = propDetails.Meta['Object Name'];
                            if (propDetails.IsComplex && objectName) {
                              return (
                                <Link
                                  to={`/${version}/schema/${objectName}`}
                                  className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 hover:underline"
                                >
                                  {objectName}
                                </Link>
                              );
                            }
                            return <span className="text-gray-700 dark:text-gray-300">{propDetails.Meta.Datatype || 'N/A'}</span>;
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${propDetails.Meta['Is Repeated'] === 'Yes' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'}`}>
                            {propDetails.Meta['Is Repeated'] || 'No'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SchemaView;
