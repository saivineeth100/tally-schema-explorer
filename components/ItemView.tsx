import React, { useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { TallyFunction, TallyAction, DefinitionAttribute, FunctionParameter, DefinitionAttributeParameter, ActionParameter } from '../types';
import MetadataView from './MetadataView';
import CopyLinkButton from './CopyLinkButton';
import { ChevronRightIcon } from './icons';

const FunctionParametersTable: React.FC<{ parameters: FunctionParameter[] }> = ({ parameters }) => (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                    <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">Parameter Type</th>
                    <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">Datatype</th>
                    <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">Mandatory</th>
                    <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">Variable Argument</th>
                    <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 min-w-[200px]">Description</th>
                    <th className="px-2 py-2 w-10"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {parameters.map((param, index) => (
                    <tr key={index} data-parameter-index={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300 font-mono">{param['Parameter Type']}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300 font-mono">{param.Datatype || 'Any'}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${param['Is Mandatory'] === 'Yes' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300'}`}>
                                {param['Is Mandatory']}
                            </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300 font-mono">{param['Variable Argument']}</td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400 text-sm">{param.Description || '-'}</td>
                        <td className="px-2 py-2">
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
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                        {visibleParameterColumns.map(colName => (
                            <th key={colName} className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">{colName}</th>
                        ))}
                        <th className="px-2 py-2 w-10"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {parameters.map((param, index) => (
                        <tr key={index} data-parameter-index={index}>
                            {visibleParameterColumns.map(colName => (
                                <td key={colName} className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300 font-mono">
                                    {param[colName] || <span className="text-gray-400 dark:text-gray-500">-</span>}
                                </td>
                            ))}
                            <td className="px-2 py-2">
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

    const renderParameters = () => {
        if (!Parameters) {
            return <p className="text-gray-500 dark:text-gray-400 italic">This item does not take any parameters.</p>;
        }
        // ... (rest of logic)
        switch (itemType) {
            case 'Function':
                return (Parameters as FunctionParameter[]).length > 0 ? <FunctionParametersTable parameters={Parameters as FunctionParameter[]} /> : <p className="text-gray-500 dark:text-gray-400 italic">This function does not take any parameters.</p>;
            case 'Definition':
                return (Parameters as DefinitionAttributeParameter[]).length > 0 ? <DefinitionParametersTable parameters={Parameters as DefinitionAttributeParameter[]} /> : <p className="text-gray-500 dark:text-gray-400 italic">This attribute does not take any parameters.</p>;
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
                <h2 className="text-2xl font-bold text-cyan-500 dark:text-cyan-400 border-b-2 border-gray-200 dark:border-gray-700 pb-2 mb-4">Parameters</h2>
                {renderParameters()}
            </section>
        </div>
    );
};

export default ItemView;
