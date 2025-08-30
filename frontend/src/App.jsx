import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';

export default function App() {
  const navigate = useNavigate();

  // If user not logged in, redirect to login when trying to access protected pages is handled inside pages
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="text-center text-sm text-gray-500 py-8">
        © {new Date().getFullYear()} Chore Manager
      </footer>
    </div>
  );
}
