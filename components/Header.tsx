import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { MenuIcon, CloseIcon } from './icons';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinkClasses = "block px-3 py-2 text-sm font-medium transition-colors duration-150 rounded-md";
    const activeClassName = "text-white bg-cyan-500";
    const inactiveClassName = "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700";

    const desktopNavLinkClasses = "h-full flex items-center px-2 sm:px-3 text-sm font-medium transition-colors duration-150 border-b-2";
    const desktopActiveClassName = "text-cyan-500 border-cyan-500";
    const desktopInactiveClassName = "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white";

    const navLinks = (
        <>
            <NavLink
                to="/schema"
                className={({ isActive }) => isMenuOpen ? `${navLinkClasses} ${isActive ? activeClassName : inactiveClassName}` : `${desktopNavLinkClasses} ${isActive ? desktopActiveClassName : desktopInactiveClassName}`}
                onClick={() => setIsMenuOpen(false)}
            >
                Schema
            </NavLink>
            <NavLink
                to="/functions"
                className={({ isActive }) => isMenuOpen ? `${navLinkClasses} ${isActive ? activeClassName : inactiveClassName}` : `${desktopNavLinkClasses} ${isActive ? desktopActiveClassName : desktopInactiveClassName}`}
                onClick={() => setIsMenuOpen(false)}
            >
                Functions
            </NavLink>
            <NavLink
                to="/definitions"
                className={({ isActive }) => isMenuOpen ? `${navLinkClasses} ${isActive ? activeClassName : inactiveClassName}` : `${desktopNavLinkClasses} ${isActive ? desktopActiveClassName : desktopInactiveClassName}`}
                onClick={() => setIsMenuOpen(false)}
            >
                Definitions
            </NavLink>
            <NavLink
                to="/actions"
                className={({ isActive }) => isMenuOpen ? `${navLinkClasses} ${isActive ? activeClassName : inactiveClassName}` : `${desktopNavLinkClasses} ${isActive ? desktopActiveClassName : desktopInactiveClassName}`}
                onClick={() => setIsMenuOpen(false)}
            >
                Actions
            </NavLink>
            <NavLink
                to="/compare"
                className={({ isActive }) => isMenuOpen ? `${navLinkClasses} ${isActive ? activeClassName : inactiveClassName}` : `${desktopNavLinkClasses} ${isActive ? desktopActiveClassName : desktopInactiveClassName}`}
                onClick={() => setIsMenuOpen(false)}
            >
                Compare
            </NavLink>
        </>
    );

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 flex-shrink-0">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6">
                <Link to="/" className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                    Tally Schema Explorer
                </Link>
                <div className="flex items-center">
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center h-full space-x-1 sm:space-x-2">
                        {navLinks}
                    </nav>
                    <div className="flex items-center ml-2">
                        <ThemeToggle />
                        {/* Mobile Menu Button */}
                        <div className="md:hidden ml-2">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                                {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;