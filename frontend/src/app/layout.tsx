'use client'; // Layout needs to be client component to use hooks like useAuth

// Note: Metadata export might not work as expected in a full client component layout.
// Consider moving metadata to specific pages or using alternative approaches if needed.
// import type { Metadata } from "next";
import Link from 'next/link';
import "./globals.css";
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { FavoritesProvider } from '@/context/FavoritesContext'; // Import FavoritesProvider

// export const metadata: Metadata = {
//   title: "Uzbekistan Real Estate",
//   description: "Find properties for sale and rent in Uzbekistan",
// };

// Header component to access auth context
function SiteHeader() {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">Uzbekistan Real Estate</Link>
        <nav>
          {isLoading ? (
            <span>Loading...</span> // Show loading state
          ) : user ? (
            <>
              <Link href="/favorites" className="hover:text-gray-300 mr-4">My Favorites</Link> {/* Add Favorites Link */}
              <span className="mr-4">Welcome, {user.username}!</span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-gray-300 ml-4">Login</Link>
              <Link href="/register" className="hover:text-gray-300 ml-4">Register</Link>
            </>
          )}
          {/* TODO: Add Favorites Link */}
        </nav>
      </div>
    </header>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <FavoritesProvider> {/* Wrap with FavoritesProvider */}
            <SiteHeader /> {/* Use the new Header component */}
            <main className="p-4 flex-grow container mx-auto">
            {/* Page content will be rendered here */}
            {children}
          </main>
          <footer className="bg-gray-200 text-center p-4 mt-auto">
            {/* Placeholder for Footer Content */}
            &copy; {new Date().getFullYear()} Uzbekistan Real Estate. All rights reserved.
          </footer>
          </FavoritesProvider> {/* Close FavoritesProvider */}
        </AuthProvider>
      </body>
    </html>
  );
}
