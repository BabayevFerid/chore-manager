import React, { useEffect, useState } from 'react';
import { api, getSavedToken } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

export default function Family() {
  const navigate = useNavigate();
  const token = getSavedToken();
  const [family, setFamily] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [createName, setCreateName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const decoded = jwtDecode(token);
    if (decoded.familyId) loadFamily(decoded.familyId);
  }, []);

  async function loadFamily(id) {
    try {
      const res = await api.getFamily(id);
      setFamily(res.family);
    } catch (err) {
      setError(err.message || JSON.stringify(err));
    }
  }

  async function doCreate() {
    try {
      const res = await api.createFamily({ name: createName });
      setFamily(res.family);
    } catch (err) {
      alert('Create error: ' + (err.message || JSON.stringify(err)));
    }
  }

  async function doJoin() {
    try {
      const res = await api.joinFamily({ joinCode });
      setFamily(res.family);
    } catch (err) {
      alert('Join error: ' + (err.message || JSON.stringify(err)));
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold">Family</h3>
        {family ? (
          <>
            <div className="mt-3">
              <div><strong>Name:</strong> {family.name}</div>
              <div><strong>Join code:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{family.joinCode}</code></div>
              <div className="mt-2">
                <h4 className="font-semibold">Members</h4>
                <ul className="mt-2 space-y-1">
                  {family.members.map(m => <li key={m.id}>{m.name} <span className="text-xs text-gray-400">({m.email})</span></li>)}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-gray-500">Hal-hazırda ailənizə qoşulmamısınız.</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <input value={createName} onChange={e=>setCreateName(e.target.value)} placeholder="Yeni family adı" className="w-full border p-2 rounded" />
                <button onClick={doCreate} className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded">Yarat</button>
              </div>
              <div>
                <input value={joinCode} onChange={e=>setJoinCode(e.target.value)} placeholder="Join code" className="w-full border p-2 rounded" />
                <button onClick={doJoin} className="mt-2 bg-green-600 text-white px-3 py-1 rounded">Qoşul</button>
              </div>
            </div>
          </>
        )}
      </div>
      {error && <div className="text-red-600">{String(error)}</div>}
    </div>
  );
}
