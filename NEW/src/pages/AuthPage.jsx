import React, { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient";
import { Auth } from '@supabase/auth-ui-react';
import { useNavigate } from 'react-router-dom';

// Your custom theme variables (no changes needed here)
const customTheme = {
  default: {
    colors: {
      brand: 'hsl(252, 75%, 60%)',
      brandAccent: 'hsl(252, 75%, 70%)',
      brandButtonText: 'white',
      defaultButtonBackground: '#27272a',
      defaultButtonBackgroundHover: '#3f3f46',
      defaultButtonBorder: '#3f3f46',
      defaultButtonText: 'white',
      dividerBackground: '#3f3f46',
      inputBackground: '#18181b',
      inputBorder: '#3f3f46',
      inputBorderHover: 'hsl(252, 75%, 60%)',
      inputBorderFocus: 'hsl(252, 75%, 60%)',
      inputText: 'white',
      inputLabelText: '#a1a1aa',
      inputPlaceholder: '#52525b',
      messageText: '#a1a1aa',
      messageTextDanger: 'rgb(220 38 38)',
      anchorTextColor: '#a1a1aa',
      anchorTextHoverColor: 'hsl(252, 75%, 70%)',
    },
    space: {
      spaceSmall: '4px',
      spaceMedium: '8px',
      spaceLarge: '16px',
      labelBottomMargin: '8px',
      anchorBottomMargin: '4px',
      emailInputSpacing: '8px',
      socialAuthSpacing: '12px',
      buttonPadding: '12px 15px',
      inputPadding: '12px 15px',
    },
    fontSizes: {
      baseBodySize: '14px',
      baseInputSize: '14px',
      baseLabelSize: '14px',
      baseButtonSize: '14px',
    },
    fonts: {
      bodyFontFamily: `Inter, sans-serif`,
      buttonFontFamily: `Inter, sans-serif`,
      inputFontFamily: `Inter, sans-serif`,
      labelFontFamily: `Inter, sans-serif`,
    },
    borderWidths: {
      buttonBorderWidth: '1px',
      inputBorderWidth: '1px',
    },
    radii: {
      borderRadiusButton: '0.5rem',
      buttonBorderRadius: '0.5rem',
      inputBorderRadius: '0.5rem',
    },
  },
};

const AuthPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const navigate = useNavigate();

  // --- MODIFIED useEffect TO CHECK FOR BANS ---
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // 1. Get the user's profile from the database
        const { data: profile } = await supabase
          .from('profiles')
          .select('banned_until')
          .eq('id', session.user.id)
          .single();

        // 2. Check if the ban expiration date is in the future
        if (profile && profile.banned_until) {
          const banExpires = new Date(profile.banned_until);
          const now = new Date();

          if (banExpires > now) {
            // 3. If banned, show a message and sign the user out immediately
            alert(`You are banned until: ${banExpires.toLocaleString()}.`);
            await supabase.auth.signOut();
            return; // Stop further execution
          }
        }
        
        // 4. If not banned, proceed to the app
        navigate('/');
      }
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background-dark)' }}>
      <div className="w-full max-w-md p-8 md:p-12 space-y-8 rounded-2xl" style={{ background: 'var(--surface-dark)' }}>
        <div>
          <h2 className="text-center text-3xl font-bold text-white">
            <span className="title-gradient">
              {isLoginView ? 'Welcome Back' : 'Create Your Account'}
            </span>
          </h2>
        </div>

        <div className="flex justify-center rounded-lg shadow-sm">
          <button
            onClick={() => setIsLoginView(true)}
            className={`py-2 px-4 w-1/2 rounded-l-lg text-sm font-medium focus:outline-none transition-colors duration-200 ${
              isLoginView ? 'bg-indigo-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLoginView(false)}
            className={`py-2 px-4 w-1/2 rounded-r-lg text-sm font-medium focus:outline-none transition-colors duration-200 ${
              !isLoginView ? 'bg-indigo-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            Sign Up
          </button>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: 'dark',
            variables: customTheme,
          }}
          view={isLoginView ? 'sign_in' : 'sign_up'}
          providers={['google', 'github']}
          socialLayout="horizontal"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email address',
                password_label: 'Password',
              },
              sign_up: {
                email_label: 'Email address',
                password_label: 'Create a Password',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default AuthPage;



