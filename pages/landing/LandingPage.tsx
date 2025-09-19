

import React from 'react';
import { Link } from 'react-router-dom';
import { DocumentIcon, DocumentDiffIcon, CodeIcon, BoltIcon, HeartIcon, StarIcon } from '../../components/icons';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Hero Section */}
      <section className="text-center py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          The Modern Developer's Guide to Tally
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-500 dark:text-gray-400">
          An open-source, modern, and responsive documentation explorer for Tally ERP schemas, functions, definitions, and actions.
        </p>
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Link
            to="/schema"
            className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Explore Schemas
          </Link>
          <a
            href="https://github.com/saivineeth100/tally-schema-explorer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
              <DocumentIcon className="w-12 h-12 text-cyan-500 dark:text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Schema Explorer</h3>
              <p className="text-gray-500 dark:text-gray-400">Browse detailed object schemas across different Tally versions with ease.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
              <DocumentDiffIcon className="w-12 h-12 text-cyan-500 dark:text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Version Comparison</h3>
              <p className="text-gray-500 dark:text-gray-400">Instantly see what's changed between versions with our intuitive diff tool.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
              <CodeIcon className="w-12 h-12 text-cyan-500 dark:text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Functions Reference</h3>
              <p className="text-gray-500 dark:text-gray-400">A comprehensive reference for Tally functions, complete with parameters and descriptions.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
              <BoltIcon className="w-12 h-12 text-cyan-500 dark:text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Actions & Definitions</h3>
              <p className="text-gray-500 dark:text-gray-400">Explore Tally's core actions and definition attributes in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsor Section */}
      <section className="bg-gray-100 dark:bg-gray-800 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <HeartIcon className="w-12 h-12 text-pink-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Support Our Work</h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            This is an open-source project created and maintained by the community. If you find it useful, please consider giving us a star on GitHub and sponsoring us to help fund development and keep the project alive.
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
             <a
              href="https://github.com/saivineeth100/tally-schema-explorer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <StarIcon className="w-5 h-5 mr-2" />
              Star on GitHub
            </a>
            <a
              href="https://github.com/sponsors/saivineeth100"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <HeartIcon className="w-5 h-5 mr-2" />
              Sponsor Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;