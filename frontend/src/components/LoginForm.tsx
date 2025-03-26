'use client'; // Client component for form interaction

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for redirection

// Function to handle the login API call
const handleLogin = async (identifier: string, password: string): Promise<any> => {
  console.log('Attempting login with:', { identifier, password });
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'; // Use NEXT_PUBLIC_ prefix if needed client-side

  try {
    const res = await fetch(`${strapiUrl}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Handle Strapi error format
      const errorMessage = data?.error?.message || 'Login failed due to an unknown error.';
      console.error('Strapi login error:', data);
      throw new Error(errorMessage);
    }

    console.log('Login successful:', data);
    // data contains { jwt: '...', user: { ... } }
    // TODO: Store JWT and user info securely (e.g., httpOnly cookie, context)
    // TODO: Redirect user after successful login
    return data; // Return data on success

  } catch (error) {
    console.error('Network or other error during login:', error);
    // Re-throw the error to be caught by handleSubmit
    throw error instanceof Error ? error : new Error('An unexpected error occurred during login.');
  }
};

const LoginForm: React.FC = () => {
  const router = useRouter(); // Initialize router
  const [identifier, setIdentifier] = useState(''); // Can be email or username
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // To display login errors

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    if (!identifier || !password) {
      setError('Please enter both email/username and password.');
      return;
    }
    try {
      const loginResponse = await handleLogin(identifier, password);
      // On success:
      alert('Login Successful!'); // Placeholder success message
      // TODO: Implement proper session management
      // TODO: Redirect to a protected page or homepage
      router.push('/'); // Redirect to homepage for now
    } catch (err) {
      console.error("Login failed in component:", err);
      // Use error message from handleLogin if available, otherwise generic
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div>
        <label
          htmlFor="identifier"
          className="block text-sm font-medium text-gray-700"
        >
          Email or Username
        </label>
        <div className="mt-1">
          <input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign in
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
            Forgot your password? {/* TODO: Implement Forgot Password */}
          </a>
        </div>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {/* TODO: Implement Social Logins */}
          <div>
            <button
              type="button"
              disabled
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-not-allowed opacity-50"
              onClick={() => alert('Google Login TBD')}
            >
              <span className="sr-only">Sign in with Google</span>
              {/* Placeholder Icon */}
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zM9 17.364V11H6.636v-2.727H9V6.545c0-2.338 1.425-3.636 3.54-3.636 1.007 0 1.873.075 2.125.109v2.455h-1.455c-1.136 0-1.358.54-1.358 1.336V8.273h2.727L14.364 11h-2.727v6.364H9z"/></svg> {/* Generic placeholder */}
            </button>
          </div>
          <div>
            <button
              type="button"
              disabled
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-not-allowed opacity-50"
              onClick={() => alert('Yandex Login TBD')}
            >
              <span className="sr-only">Sign in with Yandex</span>
               {/* Placeholder Icon */}
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zM9 17.364V11H6.636v-2.727H9V6.545c0-2.338 1.425-3.636 3.54-3.636 1.007 0 1.873.075 2.125.109v2.455h-1.455c-1.136 0-1.358.54-1.358 1.336V8.273h2.727L14.364 11h-2.727v6.364H9z"/></svg> {/* Generic placeholder */}
            </button>
          </div>
          <div>
            <button
              type="button"
              disabled
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-not-allowed opacity-50"
              onClick={() => alert('Facebook/Insta Login TBD')}
            >
              <span className="sr-only">Sign in with Facebook</span>
               {/* Placeholder Icon */}
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zM9 17.364V11H6.636v-2.727H9V6.545c0-2.338 1.425-3.636 3.54-3.636 1.007 0 1.873.075 2.125.109v2.455h-1.455c-1.136 0-1.358.54-1.358 1.336V8.273h2.727L14.364 11h-2.727v6.364H9z"/></svg> {/* Generic placeholder */}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
