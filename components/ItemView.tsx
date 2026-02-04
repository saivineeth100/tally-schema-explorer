import React, { useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { TallyFunction, TallyAction, DefinitionAttribute, FunctionParameter, DefinitionAttributeParameter, ActionParameter } from '../types';
import MetadataView from './MetadataView';
import CopyLinkButton from './CopyLinkButton';
import { ChevronRightIcon } from './icons';

const FunctionParametersTable: React.FC<{ parameters: FunctionParameter[] }> = ({ parameters }) => (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                    <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs whitespace-nowrap">Parameter Type</th>
                    <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs whitespace-nowrap">Datatype</th>
                    <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs whitespace-nowrap">Mandatory</th>
                    <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs whitespace-nowrap">Variable Argument</th>
                    <th className="px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs min-w-[250px]">Description</th>
                    <th className="px-4 py-3 w-10"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {parameters.map((param, index) => (
                    <tr key={index} data-parameter-index={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 font-mono text-sm">{param['Parameter Type']}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 font-mono text-sm">{param.Datatype || 'Any'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${param['Is Mandatory'] === 'Yes' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300'}`}>
                                {param['Is Mandatory']}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 font-mono text-sm">{param['Variable Argument']}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm break-words whitespace-normal leading-relaxed">{param.Description || '-'}</td>
                        <td className="px-4 py-4">
                            <CopyLinkButton url={`${window.location.href.split('?')[0]}?activeparameter=${index}`} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const PARAMETER_COLUMNS: (keyof DefinitionAttributeParameter)[] = [
    "Parameter Type", "Datatype", "Is Mandatory", "Is Constant", "Is List", "Refers To", "Keywords", "Description"
];

const DefinitionParametersTable: React.FC<{ parameters: DefinitionAttributeParameter[] }> = ({ parameters }) => {
    const visibleParameterColumns = PARAMETER_COLUMNS.filter(colName =>
        parameters.some(param => param[colName] !== undefined && param[colName] !== null && param[colName] !== '')
    );
    if (visibleParameterColumns.length === 0) {
        return <p className="text-gray-500 dark:text-gray-400 italic">This attribute does not take any parameters.</p>;
    }
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                        {visibleParameterColumns.map(colName => (
                            <th key={colName} className={`px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs ${colName === 'Description' || colName === 'Keywords' ? 'min-w-[250px]' : 'whitespace-nowrap'}`}>{colName}</th>
                        ))}
                        <th className="px-4 py-3 w-10"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {parameters.map((param, index) => (
                        <tr key={index} data-parameter-index={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            {visibleParameterColumns.map(colName => (
                                <td key={colName} className={`px-6 py-4 text-gray-700 dark:text-gray-300 font-mono text-sm ${colName === 'Description' || colName === 'Keywords' ? 'break-words whitespace-normal leading-relaxed' : 'whitespace-nowrap'}`}>
                                    {param[colName] || <span className="text-gray-400 dark:text-gray-500">-</span>}
                                </td>
                            ))}
                            <td className="px-4 py-4">
                                <CopyLinkButton url={`${window.location.href.split('?')[0]}?activeparameter=${index}`} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
};

const ActionParametersTable: React.FC<{ parameters: ActionParameter[] }> = ({ parameters }) => {
    if (parameters.length > 0) {
        return (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="p-4 text-gray-500 dark:text-gray-400 italic">Parameter schema not available yet.</p>
            </div>
        );
    }
    return <p className="text-gray-500 dark:text-gray-400 italic">This action does not take any parameters.</p>;
};


type Item = TallyFunction | DefinitionAttribute | TallyAction;
type ItemType = 'function' | 'definition' | 'action';

const ItemView: React.FC<{
    item: Item,
    itemType: ItemType,
    history?: { added?: string; deleted?: string },
    currentVersion?: string
}> = ({ item, itemType, history, currentVersion }) => {
    const { Name, Description, Meta, Parameters } = item;
    const location = useLocation();
    const parametersContainerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!item) return;

        const params = new URLSearchParams(location.search);
        const activeParameterIndex = params.get('activeparameter');

        if (activeParameterIndex && parametersContainerRef.current) {
            const targetRow = parametersContainerRef.current.querySelector(`tr[data-parameter-index="${activeParameterIndex}"]`) as HTMLTableRowElement;

            if (targetRow) {
                targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetRow.classList.add('bg-cyan-500/20');

                const timer = setTimeout(() => {
                    targetRow.classList.remove('bg-cyan-500/20');
                }, 2500);

                return () => clearTimeout(timer);
            }
        }
    }, [location.search, item]);

    const [searchTerm, setSearchTerm] = React.useState('');

    useEffect(() => {
        setSearchTerm('');
    }, [Name]);

    const renderParameters = () => {
        if (!Parameters) {
            return <p className="text-gray-500 dark:text-gray-400 italic">This item does not take any parameters.</p>;
        }

        const normalize = (str: string) => str.replace(/\s+/g, '').toLowerCase();
        const query = normalize(searchTerm);

        const filterParams = (params: any[]) => {
            if (!query) return params;
            return params.filter(p =>
                Object.values(p).some(val =>
                    val && typeof val === 'string' && normalize(val).includes(query)
                )
            );
        };

        switch (itemType) {
            case 'Function':
                const funcParams = Parameters as FunctionParameter[];
                const filteredFuncParams = filterParams(funcParams);
                return filteredFuncParams.length > 0
                    ? <FunctionParametersTable parameters={filteredFuncParams} />
                    : <p className="text-gray-500 dark:text-gray-400 italic">No parameters match your search.</p>;
            case 'Definition':
                const defParams = Parameters as DefinitionAttributeParameter[];
                const filteredDefParams = filterParams(defParams);
                return filteredDefParams.length > 0
                    ? <DefinitionParametersTable parameters={filteredDefParams} />
                    : <p className="text-gray-500 dark:text-gray-400 italic">No parameters match your search.</p>;
            case 'Action':
                return <ActionParametersTable parameters={Parameters as ActionParameter[]} />;
            default:
                return null;
        }
    };

    const aliases = (Meta as any).Aliases;

    const currentVerNum = currentVersion ? parseFloat(currentVersion.replace(/^v/, '')) : 0;
    const addedVerNum = history?.added ? parseFloat(history.added.replace(/^v/, '')) : 0;
    const deletedVerNum = history?.deleted ? parseFloat(history.deleted.replace(/^v/, '')) : Infinity;
    const showAdded = history?.added && addedVerNum <= currentVerNum;
    const showDeleted = history?.deleted && deletedVerNum > currentVerNum; // Logic: if deleted > current, implies it WILL be deleted. If deleted <= current, it IS deleted? 
    // Wait, if it IS deleted in current version, it wouldn't show up at all in the items list for this version?
    // Actually, items are often still in "modified" or just gone. If it's gone, we won't see it.
    // So "Deleted in vX" essentially implies "This item will be deleted in vX" if we are viewing v(X-1).
    // Let's stick to standard logic: show the tag if data exists.

    return (
        <div className="p-4 sm:p-6 md:p-8 text-gray-700 dark:text-gray-300">
            <header className="mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">{Name}</h1>
                    {showAdded && <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Added in v{history?.added?.replace(/^v/, '')}</span>}
                    {showDeleted && <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">Deleted in v{history?.deleted?.replace(/^v/, '')}</span>}
                </div>
                {aliases && <p className="text-sm text-gray-500 dark:text-gray-400">Aliases: {aliases}</p>}
                <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-300">{Description}</p>
            </header>

            <section className="mb-10">
                <h2 className="text-2xl font-bold text-cyan-500 dark:text-cyan-400 border-b-2 border-gray-200 dark:border-gray-700 pb-2 mb-4">Metadata</h2>
                <MetadataView meta={Meta} />
            </section>

            <section ref={parametersContainerRef}>
                <div className="sticky top-0 md:top-16 z-30 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 pt-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
                    <h2 className="text-2xl font-bold text-cyan-500 dark:text-cyan-400">Parameters</h2>
                    {Parameters && Parameters.length > 0 && (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search parameters..."
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
                    )}
                </div>
                {renderParameters()}
            </section>
        </div>
    );
};

export default ItemView;
