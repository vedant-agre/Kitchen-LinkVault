import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../lib/auth';
import { Button } from '../components/ui/Button';
import { Zap } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError("Failed to sign in. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative M-stripe at the top */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-m-blue-light via-m-blue-dark to-m-red" />
      
      <div className="w-full max-w-md flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-surface-card flex items-center justify-center mb-8 border border-hairline">
          <Zap className="w-8 h-8 text-on-dark" />
        </div>
        
        <h1 className="text-display-lg text-on-dark mb-4 tracking-tight">
          LINKVAULT
        </h1>
        
        <p className="text-body-md text-body mb-12">
          The ultimate vault for your digital discoveries. Categorize, tag, and find your saved links instantly.
        </p>

        {error && (
          <div className="w-full mb-6 p-4 bg-surface-elevated border border-m-red text-on-dark text-body-sm">
            {error}
          </div>
        )}

        <Button 
          onClick={handleLogin} 
          disabled={loading}
          className="w-full justify-center"
        >
          {loading ? 'CONNECTING...' : 'SIGN IN WITH GOOGLE'}
        </Button>
      </div>
    </div>
  );
}
