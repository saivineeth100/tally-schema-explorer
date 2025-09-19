import React from 'react';
import { DocumentDiffIcon } from '../../components/icons';

const CompareInstructions: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <DocumentDiffIcon className="w-20 h-20 text-cyan-500 dark:text-cyan-400 mb-6" />
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Select Versions to Compare</h2>
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">Choose a 'from' and 'to' version in the sidebar to see a summary of schema changes.</p>
    </div>
);

export default CompareInstructions;