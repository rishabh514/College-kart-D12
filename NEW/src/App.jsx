import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from "./supabaseClient";

// Import Providers & Hooks
import { UIProvider } from './context/UIContext';
import { ProfileProvider, useProfile } from './context/ProfileContext'; // UPDATED: Import useProfile
import { ProductProvider } from './context/ProductContext';

// Import Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Import Pages
import AuthPage from './pages/AuthPage';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import CreateListing from './pages/CreateListing';
import MyListings from './pages/MyListings';
import Wishlist from './pages/Wishlist';
import AdminPage from './pages/AdminPage'; // NEW: Import the AdminPage

// NEW: This is a special component that checks if the user is an admin
const AdminRoute = () => {
    const { profile, loading } = useProfile();

    // Show a loading indicator while we check the user's role
    if (loading) {
        return (
             <div className="content-section text-center p-8 text-zinc-400">Loading Access...</div>
        );
    }
    
    // If the profile is loaded and the role is 'admin', show the AdminPage.
    // Otherwise, redirect them to the homepage.
    return profile?.role === 'admin' ? <AdminPage /> : <Navigate to="/" />;
};

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background-dark)' }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <UIProvider>
      <ProfileProvider>
        <ProductProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={!session ? <AuthPage /> : <Navigate to="/" />} />
              
              <Route element={session ? <DashboardLayout /> : <Navigate to="/auth" />} >
                <Route path="/" element={<Profile />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/create-listing" element={<CreateListing />} />
                <Route path="/my-listings" element={<MyListings />} />
                <Route path="/wishlist" element={<Wishlist />} />
                
                {/* NEW: Add the protected route for the admin page */}
                <Route path="/admin" element={<AdminRoute />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </ProductProvider>
      </ProfileProvider>
    </UIProvider>
  );
}

export default App;