import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const Header = ({ onMenuClick, title }) => {
    return (
        // 1. Remove justify-between from the header
        <header id="header" className="glassmorphic p-4 flex items-center sticky top-0 z-20">
            <button onClick={onMenuClick} className="text-gray-300 md:hidden">
                <FontAwesomeIcon icon={faBars} className="text-2xl" />
            </button>
            
            {/* 2. Add flex-grow and text-center to the h1 element */}
            <h1 id="content-title" className="flex-grow text-center text-2xl font-semibold text-white">
                {title}
            </h1>

            {/* This div acts as a spacer to balance the hamburger icon, ensuring the title is perfectly centered */}
            <div className="w-8 md:w-0"></div> 
        </header>
    );
};

export default Header;