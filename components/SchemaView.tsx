import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { TallySchema, TallyProperty } from '../types';
import Spinner from './Spinner';
import MetadataView from './MetadataView';
import CopyLinkButton from './CopyLinkButton';
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

  if (loading) return <Spinner />;
  if (error) return <div className="p-8 text-red-600 dark:text-red-400 text-center">{error}</div>;
  if (!schema) return <div className="p-8 text-center">Select a schema to view its details.</div>;

  const properties: [string, TallyProperty][] = Object.entries(schema.Properties);

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
        <h2 className="text-2xl font-bold text-cyan-500 dark:text-cyan-400 border-b-2 border-gray-200 dark:border-gray-700 pb-2 mb-4">Properties</h2>
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
                {properties.map(([propName, propDetails]) => (
                  <tr
                    key={propName}
                    data-property-name={propDetails.Name}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{propDetails.Name}</span>
                        <CopyLinkButton url={`${window.location.href.split('?')[0]}?activeproperty=${encodeURIComponent(propDetails.Name)}`} />
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SchemaView;
