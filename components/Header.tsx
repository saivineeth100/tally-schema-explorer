import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { MenuIcon, CloseIcon } from './icons';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    // Custom active check that handles versioned routes (e.g., /7.0/schema matches /schema)
    const isActiveRoute = (path: string) => {
        const currentPath = location.pathname;
        if (path === '/compare') {
            return currentPath.startsWith('/compare');
        }
        const pathSegment = path.replace('/', '');
        return currentPath.endsWith(`/${pathSegment}`) || currentPath.includes(`/${pathSegment}/`);
    };

    const navItems = [
        { path: '/schema', label: 'Schema' },
        { path: '/functions', label: 'Functions' },
        { path: '/definitions', label: 'Definitions' },
        { path: '/actions', label: 'Actions' },
        { path: '/compare', label: 'Change Log' },
    ];

    return (
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 flex-shrink-0 transition-colors duration-300">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 max-w-7xl mx-auto">
                <Link to="/" className="text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500 truncate hover:opacity-80 transition-opacity">
                    Tally Schema Explorer
                </Link>
                <div className="flex items-center gap-4">
                    {/* Desktop Navigation - Modern Pill Style */}
                    <nav className="hidden md:flex items-center bg-gray-100/50 dark:bg-gray-800/50 rounded-full p-1.5 gap-1 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                        {navItems.map((item) => {
                            const isActive = isActiveRoute(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ease-in-out relative
                                        ${isActive
                                            ? 'bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                                        }
                                    `}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 hidden md:block" />
                    <ThemeToggle />
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                    </button>
                </div>
            </div>
            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl absolute w-full left-0 shadow-lg">
                    <nav className="px-4 py-3 space-y-2">
                        {navItems.map((item) => {
                            const isActive = isActiveRoute(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`
                                        block px-4 py-3 text-base font-medium rounded-xl transition-all duration-200
                                        ${isActive
                                            ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-600 dark:text-cyan-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }
                                    `}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;