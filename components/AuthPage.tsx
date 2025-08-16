import React, { useState } from 'react';
import { supabase } from '../supabase/supabaseClient';

export const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSigningUp) {
        // Sign up new user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        setSuccessMsg('Signup successful! Please check your email to confirm.');
      } else {
        // Sign in existing user
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        setSuccessMsg('Login successful!');
        // You may redirect user here or update UI accordingly
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-base-200 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">{isSigningUp ? 'Sign Up' : 'Login'}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="input input-bordered w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="input input-bordered w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? 'Please wait...' : isSigningUp ? 'Sign Up' : 'Login'}
        </button>
      </form>

      {errorMsg && (
        <p className="mt-4 text-center text-red-600 font-semibold">{errorMsg}</p>
      )}
      {successMsg && (
        <p className="mt-4 text-center text-green-600 font-semibold">{successMsg}</p>
      )}

      <div className="mt-6 text-center">
        {isSigningUp ? (
          <>
            Already have an account?{' '}
            <button
              onClick={() => {
                setIsSigningUp(false);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="btn btn-link"
            >
              Login
            </button>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <button
              onClick={() => {
                setIsSigningUp(true);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="btn btn-link"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </div>
  );
};
