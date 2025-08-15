import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const Header = ({ onMenuClick, title }) => {
    return (
        <header id="header" className="glassmorphic p-4 flex justify-between items-center sticky top-0">
            <button onClick={onMenuClick} className="text-gray-300 md:hidden">
                <FontAwesomeIcon icon={faBars} className="text-2xl" />
            </button>
            <h1 id="content-title" className="text-2xl font-semibold text-white">{title}</h1>
            <div className="w-8"></div>
        </header>
    );
};

export default Header;