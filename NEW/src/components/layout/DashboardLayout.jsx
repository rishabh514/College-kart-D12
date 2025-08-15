// DashboardLayout.jsx
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient'; // Make sure this path is correct
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles = {
    '/': 'Profile',
    '/marketplace': 'Marketplace',
    '/create-listing': 'Create Listing',
    '/my-listings': 'My Listings',
    '/wishlist': 'Wishlist',
};

const AuroraBackground = () => (
    <div className="aurora-container">
        <div className="aurora-glow" style={{ backgroundColor: 'var(--vibrant-purple)', width: '40vw', height: '40vw', top: '-10vh', left: '-10vw' }}></div>
        <div className="aurora-glow" style={{ backgroundColor: 'var(--vibrant-cyan)', width: '30vw', height: '30vw', bottom: '-5vh', right: '-5vw' }}></div>
    </div>
);

const DashboardLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const title = pageTitles[location.pathname] || 'Dashboard';

    // 1. Define the logout function
    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigate('/login'); // Redirect to the login page after a successful logout
        } catch (error) {
            console.error("Error logging out:", error.message);
            // You might want to display an error message to the user here
        }
    };

    return (
        <>
            <AuroraBackground />
            <div className="flex h-screen relative z-10">
                {/* 2. Pass the handleLogout function as a prop to the Sidebar */}
                <Sidebar
                    isOpen={isSidebarOpen}
                    setOpen={setSidebarOpen}
                    onLogout={handleLogout} // Pass the function here
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