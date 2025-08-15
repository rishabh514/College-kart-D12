import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useUI } from '../context/UIContext';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useUI();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                // This is the URL your user will be redirected to after clicking the email link.
                // It must be a route in your React app.
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) {
                throw error;
            }

            showToast("Password reset link has been sent. Please check your email.", "success");

        } catch (error) {
            // Show a generic success message even if the email doesn't exist for security reasons
            // This prevents attackers from finding out which emails are registered.
            showToast("If an account with this email exists, a reset link has been sent.", "success");
            console.error('Error sending password reset email:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="forgot-password" className="content-section">
            <div className="form-container p-8 md:p-12 rounded-2xl w-full max-w-md mx-auto">
                <h2 className="text-3xl font-bold mb-3 text-center text-white">
                    <span className="title-gradient">Forgot Password</span>
                </h2>
                <p className="text-center text-zinc-400 mb-8">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2 text-zinc-300">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field p-3 rounded-lg w-full"
                            required
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="pt-2">
                        <button type="submit" disabled={loading} className="stylish-button p-3 rounded-lg w-full text-lg font-semibold">
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                </form>
                <p className="text-center text-zinc-400 mt-6">
                    Remember your password? <Link to="/login" className="font-semibold text-indigo-400 hover:underline">Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;