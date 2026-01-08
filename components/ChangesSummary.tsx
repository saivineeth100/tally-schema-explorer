import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { SchemaIndex } from '../types';
import Spinner from './Spinner';
import { PlusCircleIcon, MinusCircleIcon, DocumentDiffIcon, ArrowRightIcon, CodeIcon, BoltIcon, DocumentIcon, DatabaseIcon } from './icons';
import CopyLinkButton from './CopyLinkButton';
import { useVersion } from '../contexts/VersionContext';

type ChangeType = 'added' | 'removed' | 'modified';
type ItemType = 'Schema' | 'Function' | 'Definition' | 'Action' | 'ExistingDefinitions';

interface ChangeItem {
  name: string;
  type: ItemType;
}

interface Changes {
  added: ChangeItem[];
  removed: ChangeItem[];
  modified: ChangeItem[];
}

const getItemIcon = (type: ItemType) => {
  switch (type) {
    case 'Schema': return <DatabaseIcon className="w-4 h-4" />;
    case 'Function': return <CodeIcon className="w-4 h-4" />;
    case 'Action': return <BoltIcon className="w-4 h-4" />;
    case 'Definition': return <DocumentIcon className="w-4 h-4" />;
  }
};

const ChangeList: React.FC<{ title: string; items: ChangeItem[]; icon: React.ReactNode; type: 'added' | 'removed' }> = ({ title, items, icon, type }) => {
  if (items.length === 0) return null;
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
        <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{items.length}</span>
      </h2>
      <ul className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {items.map((item, idx) => (
          <li key={`${item.type}-${item.name}-${idx}`} className="flex justify-between items-center text-gray-700 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-700/50 px-3 py-2 rounded-md transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-gray-400" title={item.type}>{getItemIcon(item.type)}</span>
              <span className="truncate">{item.name}</span>
            </div>
            <CopyLinkButton url={`${window.location.href.split('?')[0]}?item=${encodeURIComponent(item.name)}&type=${type}&category=${item.type}`} />
          </li>
        ))}
      </ul>
    </div>
  );
};

const ModifiedList: React.FC<{ title: string; items: ChangeItem[]; from: string; to: string; icon: React.ReactNode }> = ({ title, items, from, to, icon }) => {
  if (items.length === 0) return null;
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
        <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{items.length}</span>
      </h2>
      <ul className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {items.map((item, idx) => (
          <li key={`${item.type}-${item.name}-${idx}`}>
            <Link
              to={`/compare/${from}/${to}/${item.type}/${item.name}`}
              className="flex justify-between items-center text-gray-700 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-700/50 px-3 py-2 rounded-md hover:bg-cyan-500/10 dark:hover:bg-cyan-500/20 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-gray-400" title={item.type}>{getItemIcon(item.type)}</span>
                <span className="truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRightIcon className="w-4 h-4" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ChangesSummary: React.FC<{}> = () => {
  const { fromVersion, toVersion } = useParams<{ fromVersion: string; toVersion: string }>();
  const { availableVersions } = useVersion();
  // State is now mapped by ItemType
  const [changesByType, setChangesByType] = useState<Record<ItemType, Changes>>({
    'Schema': { added: [], removed: [], modified: [] },
    'Function': { added: [], removed: [], modified: [] },
    'Definition': { added: [], removed: [], modified: [] },
    'Action': { added: [], removed: [], modified: [] },
    'ExistingDefinitions': { added: [], removed: [], modified: [] } // merged into Definition in UI usually, but keeping logic distinct for now
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fromVersion || !toVersion || availableVersions.length === 0) return;

    const fetchChanges = async () => {
      setLoading(true);
      setError(null);

      const allVersions = [...availableVersions].sort((a, b) => Number(a.substring(1)) - Number(b.substring(1))); // Ascending
      const startIndex = allVersions.indexOf(fromVersion);
      const endIndex = allVersions.indexOf(toVersion);

      const isAdjacent = Math.abs(startIndex - endIndex) === 1;

      const intermediateVersions: string[] = [];
      if (startIndex < endIndex) {
        for (let i = startIndex + 1; i <= endIndex; i++) {
          intermediateVersions.push(allVersions[i]);
        }
      }

      const types: string[] = ['Schema', 'Function', 'Definition', 'Action', 'ExistingDefinitions'];
      const newChangesByType: Record<string, Changes> = {
        'Schema': { added: [], removed: [], modified: [] },
        'Function': { added: [], removed: [], modified: [] },
        'Definition': { added: [], removed: [], modified: [] },
        'Action': { added: [], removed: [], modified: [] },
        'ExistingDefinitions': { added: [], removed: [], modified: [] }
      };

      const runDiff = async () => {
        if (isAdjacent) {
          // Fast path
          const targetVer = startIndex < endIndex ? toVersion : fromVersion;

          await Promise.all(types.map(async (type) => {
            try {
              const url = `/Data/${targetVer}/ChangeLog/${type}/${type === 'ExistingDefinitions' ? 'ExistingDefinitions' : type}.json`;
              const res = await fetch(url);
              if (res.ok) {
                const data = await res.json();
                const destType = type; // Keep original type key

                const isInverted = startIndex > endIndex;

                const addList = isInverted ? data.deleted : data.added;
                const delList = isInverted ? data.added : data.deleted;

                if (Array.isArray(addList)) addList.forEach((name: string) => newChangesByType[destType].added.push({ name, type: type as ItemType }));
                if (Array.isArray(delList)) delList.forEach((name: string) => newChangesByType[destType].removed.push({ name, type: type as ItemType }));
                if (Array.isArray(data.modified)) data.modified.forEach((name: string) => newChangesByType[destType].modified.push({ name, type: type as ItemType }));
              }
            } catch (e) { console.warn(e); }
          }));
        } else {
          // Multi-version path
          const minVer = startIndex < endIndex ? fromVersion : toVersion;
          const maxVer = startIndex < endIndex ? toVersion : fromVersion;

          await Promise.all(types.map(async (type) => {
            try {
              const destType = type;

              if (type === 'ExistingDefinitions') {
                // Union of modified
                const modifiedSet = new Set<string>();
                for (const v of intermediateVersions) {
                  try {
                    const res = await fetch(`/Data/${v}/ChangeLog/ExistingDefinitions/ExistingDefinitions.json`);
                    if (res.ok) {
                      const d = await res.json();
                      if (Array.isArray(d.modified)) d.modified.forEach((m: string) => modifiedSet.add(m));
                    }
                  } catch { }
                }
                modifiedSet.forEach(name => newChangesByType[destType].modified.push({ name, type: type as ItemType }));
                return;
              }

              const [minRes, maxRes] = await Promise.all([
                fetch(`/Data/${minVer}/${type}/index.json`),
                fetch(`/Data/${maxVer}/${type}/index.json`)
              ]);

              if (!minRes.ok || !maxRes.ok) return;

              const minData = await minRes.json();
              const maxData = await maxRes.json();

              const getNames = (d: any) => {
                if (Array.isArray(d)) {
                  if (typeof d[0] === 'string') return d as string[];
                  if (typeof d[0] === 'object' && d[0].Name) return d.map((x: any) => x.Name as string);
                }
                return [];
              }

              const minNames = new Set(getNames(minData));
              const maxNames = new Set(getNames(maxData));

              const added = [...maxNames].filter(x => !minNames.has(x));
              const removed = [...minNames].filter(x => !maxNames.has(x));
              const common = [...minNames].filter(x => maxNames.has(x));

              const isInverted = startIndex > endIndex;
              (isInverted ? removed : added).forEach(name => newChangesByType[destType].added.push({ name, type: type as ItemType }));
              (isInverted ? added : removed).forEach(name => newChangesByType[destType].removed.push({ name, type: type as ItemType }));

              const potentialModified = new Set<string>();
              for (const v of intermediateVersions) {
                try {
                  const cRes = await fetch(`/Data/${v}/ChangeLog/${type}/${type}.json`);
                  if (cRes.ok) {
                    const cData = await cRes.json();
                    if (Array.isArray(cData.modified)) {
                      cData.modified.forEach((m: string) => potentialModified.add(m));
                    }
                  }
                } catch { }
              }

              common.filter(x => potentialModified.has(x)).forEach(name => newChangesByType[destType].modified.push({ name, type: type as ItemType }));

            } catch (e) {
              console.warn(`Error processing ${type}`, e);
            }
          }));
        }
      };

      try {
        await runDiff();

        // Post-process: merge ExistingDefinitions into Definition if desired, or keep separate.
        // User asked for "per schema, action, def, function".
        // I will merge ExistingDefinitions into Definition for display simplicity, OR keep generic.
        // Let's merge ExistingDefinitions into Definition for the UI State.
        newChangesByType['Definition'].added.push(...newChangesByType['ExistingDefinitions'].added);
        newChangesByType['Definition'].removed.push(...newChangesByType['ExistingDefinitions'].removed);
        newChangesByType['Definition'].modified.push(...newChangesByType['ExistingDefinitions'].modified);

        // Sort everything
        Object.keys(newChangesByType).forEach(key => {
          const k = key as ItemType;
          if (k !== 'ExistingDefinitions') {
            newChangesByType[k].added.sort((a, b) => a.name.localeCompare(b.name));
            newChangesByType[k].removed.sort((a, b) => a.name.localeCompare(b.name));
            newChangesByType[k].modified.sort((a, b) => a.name.localeCompare(b.name));
          }
        });

        // Cast to Record<ItemType, Changes> avoiding the temp key issue
        setChangesByType(newChangesByType as Record<ItemType, Changes>);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load changelogs');
      } finally {
        setLoading(false);
      }
    };

    fetchChanges();
  }, [fromVersion, toVersion, availableVersions]);

  if (loading) return <Spinner />;
  if (error) return <div className="p-8 text-red-600 dark:text-red-400 text-center">{error}</div>;

  const displayTypes: ItemType[] = ['Schema', 'Function', 'Definition', 'Action'];

  return (
    <div className="p-4 sm:p-6 md:p-8 text-gray-700 dark:text-gray-300">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Version Changes</h1>
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
          Summary of changes from <span className="font-semibold text-cyan-500 dark:text-cyan-400">v{fromVersion?.replace(/^v/, '')}</span> to <span className="font-semibold text-cyan-500 dark:text-cyan-400">v{toVersion?.replace(/^v/, '')}</span>
        </p>
      </header>

      {displayTypes.map(type => {
        const typeChanges = changesByType[type];
        if (typeChanges.added.length === 0 && typeChanges.removed.length === 0 && typeChanges.modified.length === 0) return null;

        return (
          <div key={type} className="mb-10 border-t pt-6 border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">{type}s</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ChangeList title="Added" items={typeChanges.added} icon={<PlusCircleIcon className="w-6 h-6 text-green-500" />} type="added" />
              <ChangeList title="Removed" items={typeChanges.removed} icon={<MinusCircleIcon className="w-6 h-6 text-red-500" />} type="removed" />
              <ModifiedList title="Modified" items={typeChanges.modified} from={fromVersion!} to={toVersion!} icon={<DocumentDiffIcon className="w-6 h-6 text-blue-500" />} />
            </div>
          </div>
        );
      })}

      {/* Verify if empty */}
      {displayTypes.every(t => changesByType[t].added.length === 0 && changesByType[t].removed.length === 0 && changesByType[t].modified.length === 0) && (
        <div className="p-8 text-center text-lg">No changes found between these versions.</div>
      )}
    </div>
  );
};

export default ChangesSummary;
