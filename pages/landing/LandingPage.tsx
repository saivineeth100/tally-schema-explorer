import React from 'react';
import { Link } from 'react-router-dom';
import { DocumentIcon, DocumentDiffIcon, CodeIcon, BoltIcon, HeartIcon, StarIcon } from '../../components/icons';

const LandingPage: React.FC = () => {
  const features = [
    {
      path: '/schema',
      icon: DocumentIcon,
      title: 'Schema Explorer',
      description: 'Browse detailed object schemas across different Tally versions with ease.',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      path: '/compare',
      icon: DocumentDiffIcon,
      title: 'Version Comparison',
      description: "Instantly see what's changed between versions with our intuitive diff tool.",
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      path: '/functions',
      icon: CodeIcon,
      title: 'Functions Reference',
      description: 'A comprehensive reference for Tally functions, complete with parameters and descriptions.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      path: '/definitions',
      icon: BoltIcon,
      title: 'Actions & Definitions',
      description: "Explore Tally's core actions and definition attributes in one place.",
      gradient: 'from-green-500 to-teal-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div>
              {/* Version badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['7.0', '6.0', '5.0', '4.0', '3.0'].map((version, i) => (
                  <Link
                    key={version}
                    to={`/${version}/schema`}
                    className={`px-3 py-1 text-xs font-mono rounded-full transition-colors ${i === 0
                      ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
                      }`}
                  >
                    v{version}
                  </Link>
                ))}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                Tally Schema
                <br />
                <span className="text-cyan-500">Explorer</span>
              </h1>

              <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
                Navigate Tally's complete TDL reference — schemas, functions, actions, and definitions —
                with version comparison and instant search.
              </p>

              {/* Stats */}
              <div className="mt-8 flex gap-8">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">500+</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Schemas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">200+</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Functions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">5</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Versions</div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-10 flex gap-4 flex-wrap">
                <Link
                  to="/schema"
                  className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                >
                  Explore Schemas
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/compare"
                  className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  Compare Versions
                </Link>
              </div>
            </div>

            {/* Right side - Schema Tree Preview */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-2xl blur-2xl" />
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <DocumentIcon className="w-4 h-4 text-cyan-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Schema Explorer</span>
                  </div>
                </div>
                {/* Schema tree */}
                <div className="p-4 space-y-1">
                  {[
                    { name: 'Company', primary: true, children: ['Address', 'Ledger', 'Voucher'] },
                    { name: 'Ledger', primary: true },
                    { name: 'Voucher', primary: true },
                    { name: 'Stock Item', primary: true },
                    { name: 'Cost Centre', primary: false },
                  ].map((schema, i) => (
                    <div key={schema.name}>
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${i === 0 ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                        }`}>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium">{schema.name}</span>
                        {schema.primary && (
                          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400">
                            Primary
                          </span>
                        )}
                      </div>
                      {schema.children && (
                        <div className="ml-6 mt-1 space-y-1">
                          {schema.children.map(child => (
                            <div key={child} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5" />
                              </svg>
                              {child}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Everything you need
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful tools to help you understand and work with Tally's data structures
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.path}
                  to={feature.path}
                  className="group relative bg-white dark:bg-gray-800/50 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 hover:border-transparent overflow-hidden"
                >
                  {/* Gradient border on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
                  <div className="absolute inset-[2px] bg-white dark:bg-gray-800 rounded-[14px]" />

                  {/* Content */}
                  <div className="relative">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="mt-6 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                      <span>Explore</span>
                      <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sponsor Section */}
      <section className="relative py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 dark:from-pink-500/5 dark:via-purple-500/5 dark:to-cyan-500/5 rounded-3xl p-8 sm:p-12 border border-pink-500/20 dark:border-pink-400/10 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl" />

            <div className="relative text-center">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 mb-6">
                <HeartIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Support Our Work
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
                This is an open-source project created and maintained by the community.
                Your support helps fund development and keeps the project alive.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <a
                  href="https://github.com/saivineeth100/tally-schema-explorer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <StarIcon className="w-5 h-5" />
                  Star on GitHub
                </a>
                <a
                  href="https://github.com/sponsors/saivineeth100"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 hover:-translate-y-0.5"
                >
                  <HeartIcon className="w-5 h-5" />
                  Sponsor Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Made with <span className="text-pink-500">❤</span> by the community •
            <a href="https://github.com/saivineeth100/tally-schema-explorer" target="_blank" rel="noopener noreferrer" className="ml-1 hover:text-cyan-500 transition-colors">
              Open Source on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;