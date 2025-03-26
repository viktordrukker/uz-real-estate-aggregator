import React from 'react';
import LoginForm from '@/components/LoginForm'; // Import the form component

export default function LoginPage() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
      <LoginForm />
    </div>
  );
}
