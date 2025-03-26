import type { Metadata } from "next";
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
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="bg-gray-800 text-white p-4">
          {/* Placeholder for Header Content (e.g., Logo, Nav) */}
          <nav>Uzbekistan Real Estate</nav>
        </header>
        <main className="p-4">
          {/* Page content will be rendered here */}
          {children}
        </main>
        <footer className="bg-gray-200 text-center p-4 mt-8">
          {/* Placeholder for Footer Content */}
          &copy; {new Date().getFullYear()} Uzbekistan Real Estate. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
