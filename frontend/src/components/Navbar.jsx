import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearToken, getSavedToken } from '../utils/api';
import jwtDecode from 'jwt-decode';

export default function Navbar() {
  const navigate = useNavigate();
  const token = getSavedToken();
  let name = null;
  if (token) {
    try { name = jwtDecode(token).name || null; } catch (e) {}
  }

  function handleLogout() {
    clearToken();
    navigate('/login');
  }

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-semibold text-indigo-600">ChoreManager</Link>
        <nav className="flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600">Dashboard</Link>
          <Link to="/family" className="text-gray-600 hover:text-indigo-600">Family</Link>
          {token ? (
            <>
              <span className="text-sm text-gray-700"> {name ? `Salam, ${name}` : ''} </span>
              <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Çıxış</button>
            </>
          ) : (
            <Link to="/login" className="bg-indigo-600 text-white px-3 py-1 rounded text-sm">Giriş / Qeydiyyat</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
