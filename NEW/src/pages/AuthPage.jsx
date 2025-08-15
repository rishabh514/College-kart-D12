import React, { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient";
import { Auth } from '@supabase/auth-ui-react';
import { useNavigate, Link } from 'react-router-dom';

// Your custom theme variables (no changes)
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
  // The 'isLoginView' state is removed to let the Auth component manage its own view state
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('banned_until')
          .eq('id', session.user.id)
          .single();

        if (profile && profile.banned_until) {
          const banExpires = new Date(profile.banned_until);
          const now = new Date();

          if (banExpires > now) {
            alert(`You are banned until: ${banExpires.toLocaleString()}.`);
            await supabase.auth.signOut();
            return;
          }
        }
        
        navigate('/');
      }
    });

    return () => subscription?.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background-dark)' }}>
      <div className="w-full max-w-md p-8 md:p-12 space-y-8 rounded-2xl" style={{ background: 'var(--surface-dark)' }}>
        <div>
          {/* A static or dynamic title can go here */}
          <h2 className="text-center text-3xl font-bold text-white">
            <span className="title-gradient">
              Welcome to CollegeKart
            </span>
          </h2>
        </div>

        {/* The custom toggle buttons are removed */}
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: 'dark',
            variables: customTheme,
          }}
          // The 'view' prop is removed to let the component manage its own state
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
              // NEW: Added localization for the forgotten password view
              forgotten_password: {
                email_label: 'Email address',
                button_label: 'Send reset instructions',
                loading_button_label: 'Sending...',
              },
            },
          }}
        />
        <div className="text-center text-sm">
          <Link to="/forgot-password" className="font-semibold text-indigo-400 hover:underline">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;


