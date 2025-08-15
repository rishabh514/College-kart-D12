import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

const MultiSelectDropdown = ({ options, selected, onChange, title, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [ref]);

    const selectionText = selected.length > 0 ? `${title} (${selected.length})` : `All ${title}`;

    return (
        <div className={`multi-select-dropdown ${isOpen ? 'z-index-elevated' : ''}`} ref={ref}>
            <button 
                type="button" 
                onClick={() => !disabled && setIsOpen(!isOpen)} 
                // UPDATED: Removed the 'input-field' class
                className="multi-select-button" 
                disabled={disabled}
            >
                <span>{selectionText}</span>
                <FontAwesomeIcon icon={faChevronDown} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="dropdown-panel custom-scrollbar">
                    {options.map(option => (
                        <label key={option} className="dropdown-item">
                            <input 
                                type="checkbox" 
                                className="custom-checkbox"
                                value={option} 
                                checked={selected.includes(option)} 
                                onChange={(e) => onChange(e)} 
                            />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;