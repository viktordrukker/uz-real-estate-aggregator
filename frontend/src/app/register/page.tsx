import React from 'react';
import RegisterForm from '@/components/RegisterForm'; // Import the form component

export default function RegisterPage() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Register</h1>
      <RegisterForm />
    </div>
  );
}
