// src/components/layout/Sidebar.jsx

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faStore, faPlusCircle, faListUl, faHeart, faChevronLeft, faRightFromBracket, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { useProfile } from '../../context/ProfileContext';
import { supabase } from '../../supabaseClient';
import { useUI } from '../../context/UIContext';

// Navigation items configuration
const navItems = [
    // Updated route to link directly to the /profile page
    { to: "/profile", icon: faUserCircle, text: "Profile" },
    { to: "/marketplace", icon: faStore, text: "Marketplace" },
    { to: "/create-listing", icon: faPlusCircle, text: "Create Listing" },
    { to: "/my-listings", icon: faListUl, text: "My Listings" },
    { to: "/wishlist", icon: faHeart, text: "Wishlist" },
];

const Sidebar = ({ isOpen, setOpen }) => {
    const { profile } = useProfile();
    const { showToast } = useUI();
    const navigate = useNavigate();
    const sidebarClass = isOpen ? 'translate-x-0' : '-translate-x-full';

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                throw error;
            }
            navigate('/auth'); // Redirect to login page after successful logout
        } catch (error) {
            console.error("Logout Error:", error.message);
            showToast("Error logging out: " + error.message, "error");
        }
    };

    return (
        <aside id="sidebar" className={`w-64 bg-zinc-900 text-white flex-shrink-0 transition-transform duration-300 ease-in-out fixed inset-y-0 left-0 md:static md:translate-x-0 ${sidebarClass} z-50`}>
            <div className="flex flex-col h-full">
                {/* Header with Title and Close Button */}
                <div className="p-4 flex items-center justify-between h-[77px] border-b border-zinc-700">
                    <h2 className="text-2xl font-bold title-gradient">College Kart</h2>
                    <button onClick={() => setOpen(false)} className="text-[var(--text-secondary)] hover:text-white transition-colors md:hidden">
                        <FontAwesomeIcon icon={faChevronLeft} className="text-xl" />
                    </button>
                </div>
                
                {/* Main Navigation */}
                <nav className="flex-grow p-4 pt-2 space-y-2 overflow-y-auto">
                    <span className="px-4 text-xs font-semibold uppercase text-gray-500 tracking-wider">Menu</span>
                    <div className="mt-2 space-y-2">
                        {navItems.map(item => (
                            <NavLink
                                key={item.text}
                                to={item.to}
                                className="nav-link flex items-center px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-dark-lighter)] hover:text-white"
                                onClick={() => setOpen(false)}
                                end={item.to === "/"}
                            >
                                <FontAwesomeIcon icon={item.icon} className="w-6 text-center mr-3 text-lg" />
                                <span className="font-medium">{item.text}</span>
                            </NavLink>
                        ))}
                    </div>

                    {/* Admin Link (Conditional) */}
                    {profile?.role === 'admin' && (
                        <div className="mt-4">
                            <span className="px-4 text-xs font-semibold uppercase text-gray-500 tracking-wider">Admin</span>
                            <div className="mt-2 space-y-2">
                                <NavLink to="/admin" className="nav-link flex items-center px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-dark-lighter)] hover:text-white" onClick={() => setOpen(false)}>
                                    <FontAwesomeIcon icon={faShieldHalved} className="w-6 text-center mr-3 text-lg" />
                                    <span>Admin Panel</span>
                                </NavLink>
                            </div>
                        </div>
                    )}
                </nav>
                
                {/* User Info and Logout Button */}
                <div className="p-4 border-t border-zinc-700">
                    <div className="flex items-center">
                        <img 
                            src={profile?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${profile?.firstName || ' '}+${profile?.lastName || ' '}&background=4f46e5&color=fff`} 
                            alt="User Avatar" 
                            className="w-10 h-10 rounded-full mr-3 object-cover" 
                        />
                        <div className="flex-grow overflow-hidden">
                            <p className="font-semibold text-sm truncate">{profile ? `${profile.firstName} ${profile.lastName}` : 'Loading...'}</p>
                            <span className="text-xs text-[var(--text-secondary)] truncate">{profile?.email}</span>
                        </div>
                        <button onClick={handleLogout} className="ml-3 flex-shrink-0 text-[var(--text-secondary)] hover:text-white transition-colors" title="Logout">
                            <FontAwesomeIcon icon={faRightFromBracket} />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;