import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { SchemaDiff, TallyProperty, TallySchema } from '../types';
import Spinner from './Spinner';
import { compareSchemas } from '../utils/diff';
import CopyLinkButton from './CopyLinkButton';

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

const PropertyTable: React.FC<{ properties: [string, TallyProperty][]; version: string; type: 'added' | 'deleted' }> = ({ properties, version, type }) => {
  if (properties.length === 0) return null;
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-4">
      <table className="w-full text-left">
        <thead className="bg-gray-100/50 dark:bg-gray-700/50">
          <tr>
            <th className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-white uppercase tracking-wider">Property Name</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-white uppercase tracking-wider">Type</th>
            <th className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-white uppercase tracking-wider">Repeats</th>
          </tr>
        </thead>
        <tbody>
          {properties.map(([propName, propDetails]) => (
            <tr key={propName} data-prop-name={propDetails.Name} data-prop-type={type}>
              <td className="px-4 py-2 whitespace-nowrap font-mono text-sm">
                <div className="flex items-center gap-2">
                    <span>{propDetails.Name}</span>
                    <CopyLinkButton url={`${window.location.href.split('?')[0]}?prop=${encodeURIComponent(propDetails.Name)}&type=${type}`} />
                </div>
              </td>
              <td className="px-4 py-2 whitespace-nowrap font-mono text-sm">
                {(() => {
                  const objectName = propDetails.Meta['Object Name'];
                  if (propDetails.IsComplex && objectName) {
                    return (
                      <Link 
                        to={`/schema/${version}/schema/${objectName.replace(/\s+/g, '')}`} 
                        className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {objectName}
                      </Link>
                    );
                  }
                  return <span>{propDetails.Meta.Datatype || 'N/A'}</span>;
                })()}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm">{propDetails.Meta['Is Repeated'] || 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
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

const ModifiedProperties: React.FC<{ 
    properties: [string, { old: TallyProperty, new: TallyProperty }][];
    versions: { from: string; to: string; }
}> = ({ properties, versions }) => {
    if (properties.length === 0) return null;

    const renderProp = (prop: TallyProperty, version: string) => {
        const objectName = prop.Meta['Object Name'];
        if (prop.IsComplex && objectName) {
            return (
                <Link 
                  to={`/schema/${version}/schema/${objectName.replace(/\s+/g, '')}`} 
                  className="text-cyan-600 dark:text-cyan-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                    {objectName}
                </Link>
            );
        }
        return <span className="text-gray-700 dark:text-gray-300">{prop.Meta.Datatype || 'N/A'}</span>;
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-4">
            <table className="w-full text-left">
                <thead className="bg-gray-100/50 dark:bg-gray-700/50">
                    <tr>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-white uppercase tracking-wider">Property Name</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-white uppercase tracking-wider">Change Details</th>
                    </tr>
                </thead>
                <tbody>
                    {properties.map(([propName, { old: oldProp, new: newProp }]) => (
                        <tr key={propName} data-prop-name={propName} data-prop-type="modified">
                            <td className="px-4 py-2 whitespace-nowrap font-mono text-sm align-top">
                                <div className="flex items-center gap-2">
                                    <span>{propName}</span>
                                    <CopyLinkButton url={`${window.location.href.split('?')[0]}?prop=${encodeURIComponent(propName)}&type=modified`} />
                                </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap font-mono text-sm">
                                <div className="space-y-1">
                                    {oldProp.Meta.Datatype !== newProp.Meta.Datatype && <div>Type: <span className="text-red-500 dark:text-red-400">{oldProp.Meta.Datatype || 'N/A'}</span> &rarr; <span className="text-green-500 dark:text-green-400">{newProp.Meta.Datatype || 'N/A'}</span></div>}
                                    {oldProp.Meta['Object Name'] !== newProp.Meta['Object Name'] && <div>Object: {renderProp(oldProp, versions.from)} &rarr; {renderProp(newProp, versions.to)}</div>}
                                    {oldProp.Meta['Is Repeated'] !== newProp.Meta['Is Repeated'] && <div>Repeats: <span className="text-red-500 dark:text-red-400">{oldProp.Meta['Is Repeated'] || 'No'}</span> &rarr; <span className="text-green-500 dark:text-green-400">{newProp.Meta['Is Repeated'] || 'No'}</span></div>}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const ModifiedMeta: React.FC<{ meta: [string, { oldValue: string, newValue: string }][] }> = ({ meta }) => {
    if (meta.length === 0) return null;
    return (
        <ul className="list-disc list-inside bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
            {meta.map(([key, { oldValue, newValue }]) => (
                <li key={key}>
                    <span className="font-semibold">{key}:</span> 
                    <span className="text-red-500 dark:text-red-400 line-through">{oldValue}</span> &rarr; <span className="text-green-500 dark:text-green-400">{newValue}</span>
                </li>
            ))}
        </ul>
    );
};


const SchemaDiffView: React.FC = () => {
  const { fromVersion, toVersion, schemaName } = useParams<{ fromVersion: string; toVersion: string; schemaName: string }>();
  const [diff, setDiff] = useState<SchemaDiff | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fromVersion || !toVersion || !schemaName) return;

    const fetchAndCompare = async () => {
      setLoading(true);
      setError(null);
      setDiff(null);
      try {
        const [oldSchemaRes, newSchemaRes] = await Promise.all([
            fetch(`/schemas/${fromVersion}/${schemaName}.json`),
            fetch(`/schemas/${toVersion}/${schemaName}.json`)
        ]);

        if (!oldSchemaRes.ok) throw new Error(`Schema not found: ${schemaName} (Version: ${fromVersion})`);
        if (!newSchemaRes.ok) throw new Error(`Schema not found: ${schemaName} (Version: ${toVersion})`);
        
        const oldSchema: TallySchema = await oldSchemaRes.json();
        const newSchema: TallySchema = await newSchemaRes.json();
        
        const calculatedDiff = compareSchemas(oldSchema, newSchema);
        setDiff(calculatedDiff);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndCompare();
  }, [fromVersion, toVersion, schemaName]);
  
  useEffect(() => {
    if(loading || !diff) return;

    const params = new URLSearchParams(location.search);
    const prop = params.get('prop');
    const type = params.get('type');
    
    if (prop && type && containerRef.current) {
        const targetRow = containerRef.current.querySelector(`tr[data-prop-name="${prop}"][data-prop-type="${type}"]`) as HTMLTableRowElement;

        if (targetRow) {
            targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetRow.classList.add('bg-cyan-500/20');
            
            const timer = setTimeout(() => {
                targetRow.classList.remove('bg-cyan-500/20');
            }, 2500);

            return () => clearTimeout(timer);
        }
    }
  }, [location.search, loading, diff]);

  if (loading) return <Spinner />;
  if (error) return <div className="p-8 text-red-600 dark:text-red-400 text-center">{error}</div>;
  if (!diff) return <div className="p-8 text-center">Could not load diff data.</div>;
  if (!diff.HasChanges) return <div className="p-8 text-center text-lg">No changes found for <strong>{schemaName}</strong> between v{fromVersion?.substring(1)} and v{toVersion?.substring(1)}.</div>;

  const addedProperties = Object.entries(diff.AddedProperties);
  const deletedProperties = Object.entries(diff.DeletedProperties);
  const modifiedProperties = Object.entries(diff.ModifiedProperties);
  const addedMeta = Object.entries(diff.AddedMeta);
  const deletedMeta = Object.entries(diff.DeletedMeta);
  const modifiedMeta = Object.entries(diff.ModifiedMeta);
  
  return (
    <div ref={containerRef} className="p-4 sm:p-6 md:p-8 text-gray-700 dark:text-gray-300">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Schema Changes: {schemaName}</h1>
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
          Showing differences from <span className="font-semibold text-cyan-500 dark:text-cyan-400">v{fromVersion!.substring(1)}</span> to <span className="font-semibold text-cyan-500 dark:text-cyan-400">v{toVersion!.substring(1)}</span>
        </p>
         <Link to={`/compare/${fromVersion}/${toVersion}`} className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline mt-2 inline-block">&larr; Back to Summary</Link>
      </header>

      <DiffSection title="Added Properties" color="green">
        <PropertyTable properties={addedProperties} version={toVersion!} type="added" />
      </DiffSection>

      <DiffSection title="Deleted Properties" color="red">
        <PropertyTable properties={deletedProperties} version={fromVersion!} type="deleted" />
      </DiffSection>

      <DiffSection title="Modified Properties" color="cyan">
        <ModifiedProperties properties={modifiedProperties} versions={{from: fromVersion!, to: toVersion!}} />
      </DiffSection>
      
      <DiffSection title="Added Metadata" color="green">
        <MetaList meta={addedMeta} />
      </DiffSection>

      <DiffSection title="Deleted Metadata" color="red">
        <MetaList meta={deletedMeta} />
      </DiffSection>
      
      <DiffSection title="Modified Metadata" color="cyan">
        <ModifiedMeta meta={modifiedMeta} />
      </DiffSection>

    </div>
  );
};

export default SchemaDiffView;
