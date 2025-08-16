import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from "./supabaseClient";

// Import Providers & Hooks
import { UIProvider } from './context/UIContext';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { ProductProvider } from './context/ProductContext';

// Import Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Import page components using React.lazy
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Profile = lazy(() => import('./pages/Profile'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const MyListings = lazy(() => import('./pages/MyListings'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'));

// This component checks for admin role before rendering the AdminPage
const AdminRoute = () => {
    const { profile, loading } = useProfile();

    if (loading) {
        return (
             <div className="content-section text-center p-8 text-zinc-400">Loading Access...</div>
        );
    }
    
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

  const loadingFallback = (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background-dark)' }}>
      <div className="text-white text-xl">Loading Page...</div>
    </div>
  );

  return (
    <UIProvider>
      <ProfileProvider>
        <ProductProvider>
          <BrowserRouter>
            <Suspense fallback={loadingFallback}>
              <Routes>
                {/* --- THIS IS THE CORRECTED LINE --- */}
                {/* If a session exists, navigate to /marketplace instead of / */}
                <Route path="/auth" element={!session ? <AuthPage /> : <Navigate to="/marketplace" />} />
                
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/update-password" element={<UpdatePassword />} />

                {/* This wrapper handles all protected routes */}
                <Route element={session ? <DashboardLayout /> : <Navigate to="/auth" />} >
                  <Route path="/" element={<Profile />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/create-listing" element={<CreateListing />} />
                  <Route path="/my-listings" element={<MyListings />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/admin" element={<AdminRoute />} />
                </Route>
                
                {/* Fallback route: If no other route matches, navigate to the main page. */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ProductProvider>
      </ProfileProvider>
    </UIProvider>
  );
}

export default App;
