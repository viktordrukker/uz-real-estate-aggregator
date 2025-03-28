'use client'; // Client component for form interaction

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Function to handle the registration API call
const handleRegister = async (username: string, email: string, password: string): Promise<any> => {
  console.log('Attempting registration with:', { username, email, password });
  // Ensure we use the environment variable provided during build
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  if (!strapiUrl) {
    console.error("Error: NEXT_PUBLIC_STRAPI_URL environment variable is not set.");
    throw new Error("API URL configuration error.");
  }

  try {
    const res = await fetch(`${strapiUrl}/api/auth/local/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMessage = data?.error?.message || 'Registration failed due to an unknown error.';
      console.error('Strapi registration error:', data);
      throw new Error(errorMessage);
    }

    console.log('Registration successful:', data);
    // data contains { jwt: '...', user: { ... } }
    // TODO: Store JWT and user info securely (e.g., httpOnly cookie, context)
    // TODO: Redirect user after successful registration
    return data; // Return data on success

  } catch (error) {
    console.error('Network or other error during registration:', error);
    throw error instanceof Error ? error : new Error('An unexpected error occurred during registration.');
  }
};

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    // Basic password validation (example)
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      await handleRegister(username, email, password);
      alert('Registration Successful! Please log in.'); // Placeholder success message
      router.push('/login'); // Redirect to login page after registration
    } catch (err) {
      console.error("Registration failed in component:", err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700"
        >
          Username
        </label>
        <div className="mt-1">
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

       <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            autoComplete="new-password"
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
          Register
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
