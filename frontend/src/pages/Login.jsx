import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken } from '../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', createFamilyName: '', joinCode: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        const payload = { name: form.name, email: form.email, password: form.password };
        // allow creating family or joining
        if (form.createFamilyName) payload.createFamilyName = form.createFamilyName;
        if (form.joinCode) payload.joinCode = form.joinCode;
        const res = await api.register(payload);
        setToken(res.token);
      } else {
        const res = await api.login({ email: form.email, password: form.password });
        setToken(res.token);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || JSON.stringify(err));
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">{isRegister ? 'Qeydiyyat' : 'Giriş'}</h2>
        {error && <div className="mb-3 text-sm text-red-600">{String(error)}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ad" className="w-full border p-2 rounded" />
            </>
          )}
          <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" className="w-full border p-2 rounded" />
          <input value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Şifrə" type="password" className="w-full border p-2 rounded" />
          {isRegister && (
            <>
              <input value={form.createFamilyName} onChange={e=>setForm({...form, createFamilyName: e.target.value})} placeholder="Yeni family yarat (opsional)" className="w-full border p-2 rounded" />
              <input value={form.joinCode} onChange={e=>setForm({...form, joinCode: e.target.value})} placeholder="Join code ilə qoşul (opsional)" className="w-full border p-2 rounded" />
            </>
          )}
          <div className="flex items-center justify-between">
            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded">
              {loading ? 'Yüklənir...' : isRegister ? 'Qeydiyyat' : 'Giriş'}
            </button>
            <button type="button" className="text-sm text-gray-600" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Artıq hesabın var? Giriş' : 'Hesabın yox? Qeydiyyat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
