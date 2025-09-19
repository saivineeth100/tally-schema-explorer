import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { SchemaIndex, TallySchema } from '../types';
import Spinner from './Spinner';
import { PlusCircleIcon, MinusCircleIcon, DocumentDiffIcon, ArrowRightIcon } from './icons';
import { compareSchemas } from '../utils/diff';
import CopyLinkButton from './CopyLinkButton';

const ChangeList: React.FC<{ title: string; items: string[]; icon: React.ReactNode; type: 'added' | 'removed' }> = ({ title, items, icon, type }) => {
  if (items.length === 0) return null;
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h2>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item} data-schema-name={item} data-schema-type={type} className="flex justify-between items-center text-gray-700 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-700/50 px-3 py-2 rounded-md transition-colors">
            <span>{item}</span>
            <CopyLinkButton url={`${window.location.href.split('?')[0]}?schema=${encodeURIComponent(item)}&type=${type}`} />
          </li>
        ))}
      </ul>
    </div>
  );
};

const ModifiedList: React.FC<{ title: string; items: string[]; from: string; to: string; icon: React.ReactNode }> = ({ title, items, from, to, icon }) => {
  if (items.length === 0) return null;
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h2>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item} data-schema-name={item} data-schema-type="modified">
            <Link 
              to={`/compare/${from}/${to}/schema/${item}`} 
              className="flex justify-between items-center text-gray-700 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-700/50 px-3 py-2 rounded-md hover:bg-cyan-500/10 dark:hover:bg-cyan-500/20 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
            >
              <span>{item}</span>
              <div className="flex items-center gap-2">
                <CopyLinkButton url={`${window.location.href.split('?')[0]}?schema=${encodeURIComponent(item)}&type=modified`} />
                <ArrowRightIcon className="w-5 h-5" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};


const ChangesSummary: React.FC<{ schemaIndex: SchemaIndex }> = ({ schemaIndex }) => {
  const { fromVersion, toVersion } = useParams<{ fromVersion: string; toVersion: string }>();
  const [changes, setChanges] = useState<{ added: string[]; removed: string[]; modified: string[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const listContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fromVersion || !toVersion || !schemaIndex) return;
    
    const calculateChanges = async () => {
      setLoading(true);
      setError(null);
      setChanges(null);
      try {
        const fromSchemas = schemaIndex[fromVersion] || [];
        const toSchemas = schemaIndex[toVersion] || [];
        const fromSet = new Set(fromSchemas);
        const toSet = new Set(toSchemas);

        const added = toSchemas.filter(s => !fromSet.has(s));
        const removed = fromSchemas.filter(s => !toSet.has(s));
        
        const commonSchemas = fromSchemas.filter(s => toSet.has(s));
        
        const diffPromises = commonSchemas.map(async (schemaName) => {
            try {
                const [oldSchemaRes, newSchemaRes] = await Promise.all([
                    fetch(`/schemas/${fromVersion}/${schemaName}.json`),
                    fetch(`/schemas/${toVersion}/${schemaName}.json`)
                ]);

                if (!oldSchemaRes.ok || !newSchemaRes.ok) return null;

                const oldSchema: TallySchema = await oldSchemaRes.json();
                const newSchema: TallySchema = await newSchemaRes.json();
                const diff = compareSchemas(oldSchema, newSchema);

                return diff.HasChanges ? schemaName : null;
            } catch {
                return null;
            }
        });

        const modifiedResults = await Promise.all(diffPromises);
        const modified = modifiedResults.filter((s): s is string => s !== null);

        setChanges({ added, removed, modified });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };
    calculateChanges();
  }, [fromVersion, toVersion, schemaIndex]);

  useEffect(() => {
    if(loading || !changes) return;

    const params = new URLSearchParams(location.search);
    const schema = params.get('schema');
    const type = params.get('type');

    if (schema && type && listContainerRef.current) {
        const targetLi = listContainerRef.current.querySelector(`li[data-schema-name="${schema}"][data-schema-type="${type}"]`) as HTMLLIElement;

        if (targetLi) {
            targetLi.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            const content = targetLi.querySelector('a, div');
            if (content) {
              content.classList.add('bg-cyan-500/20', 'dark:bg-cyan-500/30');
              const timer = setTimeout(() => {
                  content.classList.remove('bg-cyan-500/20', 'dark:bg-cyan-500/30');
              }, 2500);
              return () => clearTimeout(timer);
            }
        }
    }
  }, [location.search, loading, changes]);

  if (loading) return <Spinner />;
  if (error) return <div className="p-8 text-red-600 dark:text-red-400 text-center">{error}</div>;
  if (!changes) return <div className="p-8 text-center">Select a version range to see changes.</div>;

  const sortedAdded = [...changes.added].sort();
  const sortedRemoved = [...changes.removed].sort();
  const sortedModified = [...changes.modified].sort();

  return (
    <div className="p-4 sm:p-6 md:p-8 text-gray-700 dark:text-gray-300">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Version Changes</h1>
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
          Summary of changes from <span className="font-semibold text-cyan-500 dark:text-cyan-400">v{fromVersion?.substring(1)}</span> to <span className="font-semibold text-cyan-500 dark:text-cyan-400">v{toVersion?.substring(1)}</span>
        </p>
      </header>

      <div ref={listContainerRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ChangeList title="Added Schemas" items={sortedAdded} icon={<PlusCircleIcon className="w-6 h-6 text-green-500 dark:text-green-400" />} type="added" />
        <ChangeList title="Removed Schemas" items={sortedRemoved} icon={<MinusCircleIcon className="w-6 h-6 text-red-500 dark:text-red-400" />} type="removed" />
        <ModifiedList 
            title="Modified Schemas" 
            items={sortedModified}
            from={fromVersion!}
            to={toVersion!}
            icon={<DocumentDiffIcon className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />} 
        />
      </div>
    </div>
  );
};

export default ChangesSummary;
