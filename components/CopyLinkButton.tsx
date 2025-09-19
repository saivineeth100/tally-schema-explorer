import React, { useState } from 'react';
import { LinkIcon, CheckIcon } from './icons';

interface CopyLinkButtonProps {
    url: string;
}

const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({ url }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
            aria-label="Copy link"
            title="Copy link"
        >
            {copied ? (
                <CheckIcon className="w-4 h-4 text-green-500" />
            ) : (
                <LinkIcon className="w-4 h-4" />
            )}
        </button>
    );
};

export default CopyLinkButton;
