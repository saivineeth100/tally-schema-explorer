import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { SchemaDiff, TallyProperty, TallySchema } from '../types';
import Spinner from './Spinner';
import CopyLinkButton from './CopyLinkButton';
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
  const { fromVersion, toVersion, schemaName, itemName } = useParams<{ fromVersion: string; toVersion: string; schemaName: string; itemName: string }>();
  const effectiveSchemaName = schemaName || itemName;
  const [diffs, setDiffs] = useState<{ ver: string; diff: SchemaDiff }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const { availableVersions } = useVersion();

  const getVerNum = (v: string | undefined) => parseFloat((v || '').replace(/^v/, ''));
  const isInverse = getVerNum(fromVersion) > getVerNum(toVersion);

  const effectiveFromVer = isInverse ? toVersion : fromVersion;
  const effectiveToVer = isInverse ? fromVersion : toVersion;

  useEffect(() => {
    if (!fromVersion || !toVersion || !effectiveSchemaName || availableVersions.length === 0) return;

    // Sort versions to ensure we can find intermediates
    const sortedVersions = [...availableVersions].sort((a, b) => {
      const vA = parseFloat(a.replace(/^v/, ''));
      const vB = parseFloat(b.replace(/^v/, ''));
      return vA - vB;
    });

    const fetchAndCompare = async () => {
      setLoading(true);
      setError(null);
      setDiffs([]);

      const encodedName = encodeURIComponent(effectiveSchemaName);

      try {
        const checkRes = (res: Response) => {
          const contentType = res.headers.get("content-type");
          return res.ok && !contentType?.includes("text/html");
        };

        // Determine version path: effectiveFrom -> effectiveTo
        const fromVal = parseFloat(effectiveFromVer.replace(/^v/, ''));
        const toVal = parseFloat(effectiveToVer.replace(/^v/, ''));

        const intermediateVersions = sortedVersions.filter(v => {
          const val = parseFloat(v.replace(/^v/, ''));
          return val > fromVal && val <= toVal;
        });

        if (intermediateVersions.length === 0) {
          throw new Error(`No intermediate versions found between ${effectiveFromVer} and ${effectiveToVer}`);
        }

        // Fetch ALL changelogs in the range
        const promises = intermediateVersions.map(v =>
          fetch(`/Data/${v}/ChangeLog/Schema/${encodedName}.json`)
            .then(async res => {
              if (!checkRes(res)) return null;
              return { ver: v, diff: await res.json() as SchemaDiff };
            })
        );

        const results = await Promise.all(promises);

        // Filter out missing logs and keep valid ones
        const validDiffs = results.filter(r => r !== null && r.diff.HasChanges) as { ver: string, diff: SchemaDiff }[];

        setDiffs(validDiffs);

      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndCompare();
  }, [fromVersion, toVersion, effectiveSchemaName, availableVersions]);

  useEffect(() => {
    if (loading || diffs.length === 0) return;

    const params = new URLSearchParams(location.search);
    const prop = params.get('prop');
    const type = params.get('type');

    if (prop && type && containerRef.current) {
      // Logic to find first occurrence? Or just let user scroll manually for now.
      // Updated to select ANY matching row.
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
  }, [location.search, loading, diffs]);

  if (loading) return <Spinner />;
  if (error) return <div className="p-8 text-red-600 dark:text-red-400 text-center">{error}</div>;
  if (diffs.length === 0) return <div className="p-8 text-center text-lg">No changes found for <strong>{effectiveSchemaName}</strong> between v{fromVersion?.substring(1)} and v{toVersion?.substring(1)}.</div>;

  return (
    <div ref={containerRef} className="p-4 sm:p-6 md:p-8 text-gray-700 dark:text-gray-300">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Schema Changes: {effectiveSchemaName}</h1>
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
          Showing differences from <span className="font-semibold text-cyan-500 dark:text-cyan-400">v{fromVersion?.replace(/^v/, '')}</span> to <span className="font-semibold text-cyan-500 dark:text-cyan-400">v{toVersion?.replace(/^v/, '')}</span>
        </p>
        <Link to={`/compare/${fromVersion}/${toVersion}`} className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline mt-2 inline-block">&larr; Back to Summary</Link>
      </header>

      {diffs.map(({ ver, diff }) => {
        const addedProperties = Object.entries(diff.AddedProperties);
        const deletedProperties = Object.entries(diff.DeletedProperties);
        const modifiedProperties = Object.entries(diff.ModifiedProperties);
        const addedMeta = Object.entries(diff.AddedMeta);
        const deletedMeta = Object.entries(diff.DeletedMeta);
        const modifiedMeta = Object.entries(diff.ModifiedMeta);

        return (
          <div key={ver} className="mb-12 border-b border-gray-200 dark:border-gray-700 pb-8 last:border-0">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">v{ver}</span>
              Changes
            </h2>

            {addedProperties.length > 0 && (
              <DiffSection title="Added Properties" color="green">
                <PropertyTable properties={addedProperties} version={ver} type="added" />
              </DiffSection>
            )}

            {deletedProperties.length > 0 && (
              <DiffSection title="Deleted Properties" color="red">
                <PropertyTable properties={deletedProperties} version={ver} type="deleted" />
              </DiffSection>
            )}

            {modifiedProperties.length > 0 && (
              <DiffSection title="Modified Properties" color="cyan">
                <ModifiedProperties properties={modifiedProperties} versions={{ from: fromVersion!, to: ver }} />
              </DiffSection>
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
          </div>
        );
      })}

    </div>
  );
};

export default SchemaDiffView;
