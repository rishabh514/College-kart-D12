import React, { useEffect } from 'react';
import { supabase } from "../supabaseClient";
import { Auth } from '@supabase/auth-ui-react';
import { useNavigate, Link } from 'react-router-dom';

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

  const handleGoogleSignIn = () => {
    supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background-dark)' }}>
      <div className="w-full max-w-md p-8 md:p-12 space-y-8 rounded-2xl" style={{ background: 'var(--surface-dark)' }}>
        <div>
          <h2 className="text-center text-3xl font-bold text-white">
            <span className="title-gradient">
              Welcome to CollegeKart
            </span>
          </h2>
        </div>

        {/* Custom Google Sign-In Button above the Auth component's form */}
        <button
          onClick={handleGoogleSignIn}
          style={{
            width: '100%',
            background: '#18181b',
            color: '#fff',
            padding: '12px 15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '400',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
          aria-label="Sign up or sign in with Google"
        >
          <img
            src="https://raw.githubusercontent.com/rishabh514/College-kart-D12/main/NEW/src/icons8-google-logo.svg"
            alt="Google logo"
            style={{ width: '25px', height: '25px' }}
            loading="lazy"
          />
          Sign Up / Sign In with Google
        </button>

        {/* Auth UI without social providers */}
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: 'light',
            variables: customTheme,
          }}
          providers={[]} // no social providers here
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


