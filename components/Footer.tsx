import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, StarIcon } from './icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-4 xl:col-span-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Tally Schema Explorer
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base">
              An open-source, modern, and responsive documentation explorer for Tally ERP.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Explore</h3>
              <ul className="mt-4 grid grid-cols-2 gap-4">
                <li><Link to="/schema" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Schema</Link></li>
                <li><Link to="/functions" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Functions</Link></li>
                <li><Link to="/definitions" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Definitions</Link></li>
                <li><Link to="/actions" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Actions</Link></li>
                <li><Link to="/compare" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Compare</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Community</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="https://github.com/saivineeth100/tally-schema-explorer" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <StarIcon className="w-5 h-5 mr-2" /> Star on GitHub
                  </a>
                </li>
                <li>
                  <a href="https://github.com/sponsors/saivineeth100" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <HeartIcon className="w-5 h-5 mr-2 text-pink-500" /> Sponsor Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-base text-gray-400 text-center">&copy; {new Date().getFullYear()} Tally Schema Explorer. An open source initiative.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;