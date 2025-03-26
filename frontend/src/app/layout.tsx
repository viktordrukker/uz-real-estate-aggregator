import type { Metadata } from "next";
import Link from 'next/link'; // Import Link
import "./globals.css";

export const metadata: Metadata = {
  title: "Uzbekistan Real Estate",
  description: "Find properties for sale and rent in Uzbekistan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // TODO: Add logic to show user info/logout if logged in
  const isLoggedIn = false; // Placeholder

  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <header className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">Uzbekistan Real Estate</Link>
            <nav>
              {isLoggedIn ? (
                <>
                  {/* Placeholder for logged-in user */}
                  <span>Welcome, User!</span>
                  <button className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
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
        <main className="p-4 flex-grow container mx-auto">
          {/* Page content will be rendered here */}
          {children}
        </main>
        <footer className="bg-gray-200 text-center p-4 mt-auto">
          {/* Placeholder for Footer Content */}
          &copy; {new Date().getFullYear()} Uzbekistan Real Estate. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
