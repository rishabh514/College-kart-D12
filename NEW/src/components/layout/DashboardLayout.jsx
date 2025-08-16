// DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useProfile } from '../../context/ProfileContext';
import { useUI } from '../../context/UIContext';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles = {
    '/profile': 'Profile',
    '/marketplace': 'Marketplace',
    '/create-listing': 'Create Listing',
    '/my-listings': 'My Listings',
    '/wishlist': 'Wishlist',
    '/admin': 'Admin Panel',
    '/info-legal': 'Info & Legal',
};

// --- NEW: Minimal Grid Background ---
// This background is more subtle and fits a modern, clean aesthetic.
const GridBackground = () => (
    <>
        <style>
            {`
                .grid-background-container {
                    position: fixed; /* Ensures it covers the whole viewport and stays put */
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background-color: var(--background-dark); /* Your base dark color */
                    /* Creates a grid of faint dots */
                    background-image: radial-gradient(circle, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
                    background-size: 2rem 2rem; /* The spacing of the dots */
                    z-index: 0; /* Places it behind all other content */
                }
            `}
        </style>
        <div className="grid-background-container"></div>
    </>
);

const DashboardLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const title = pageTitles[location.pathname] || 'Dashboard';

    const { profile, loading: profileLoading } = useProfile();
    const { showToast } = useUI();

    useEffect(() => {
        if (profileLoading) return;

        const isProfileDeficient = (p) => {
            if (!p) return true; 
            const requiredFields = ['firstName', 'lastName', 'branch', 'year', 'whatsappNumber'];
            if (p.isHosteller && !p.hostelName) return true;
            return requiredFields.some(field => !p[field]);
        };

        const allowedPaths = ['/profile', '/marketplace', '/wishlist', '/create-listing', '/admin', '/info-legal']; // Add new path here

        if (isProfileDeficient(profile) && !allowedPaths.includes(location.pathname)) {
            const message = !profile 
                ? "Welcome! Please create your profile to get started." 
                : "Please complete your profile to access this page.";
            showToast(message, !profile ? 'info' : 'error');
            navigate('/profile');
        }
    }, [profile, profileLoading, location.pathname, navigate, showToast]);

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigate('/auth');
        } catch (error) {
            console.error("Error logging out:", error.message);
            showToast("Failed to log out.", "error");
        }
    };
    
    if (profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background-dark)' }}>
                <div className="text-white text-xl">Loading User Data...</div>
            </div>
        );
    }

    return (
        <>
            {/* --- REPLACED AuroraBackground with GridBackground --- */}
            <GridBackground />
            <div className="flex h-screen relative z-10">
                <Sidebar
                    isOpen={isSidebarOpen}
                    setOpen={setSidebarOpen}
                    onLogout={handleLogout}
                />
                <div id="main-content-wrapper" className="flex-1 flex flex-col overflow-hidden">
                    <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
                    <main id="content-area" className="flex-grow p-4 md:p-8 overflow-y-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    );
};

export default DashboardLayout;


