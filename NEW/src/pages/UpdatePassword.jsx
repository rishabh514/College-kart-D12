import React from 'react';
import { supabase } from '../supabaseClient';
import { Auth } from '@supabase/auth-ui-react';

// A minimal theme to match your app
const customTheme = {
  default: {
    colors: {
      brand: 'hsl(252, 75%, 60%)', brandAccent: 'hsl(252, 75%, 70%)', brandButtonText: 'white',
      inputBackground: '#18181b', inputBorder: '#3f3f46', inputText: 'white',
      inputLabelText: '#a1a1aa',
    },
    radii: { borderRadiusButton: '0.5rem', inputBorderRadius: '0.5rem' },
  },
};

const UpdatePassword = () => {
    // This component now ONLY renders the Supabase Auth UI.
    // It will automatically handle success and error states.
    return (
        <div id="update-password" className="content-section">
            <div className="form-container p-8 md:p-12 rounded-2xl w-full max-w-md mx-auto">
                 <h2 className="text-3xl font-bold mb-8 text-center text-white">
                    <span className="title-gradient">Choose a New Password</span>
                </h2>
                <Auth
                    supabaseClient={supabase}
                    view="update_password"
                    appearance={{ theme: 'dark', variables: customTheme }}
                />
            </div>
        </div>
    );
};

export default UpdatePassword;