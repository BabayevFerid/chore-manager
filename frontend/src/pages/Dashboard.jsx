import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getSavedToken } from '../utils/api';
import AddTaskForm from '../components/AddTaskForm';
import TaskCard from '../components/TaskCard';
import jwtDecode from 'jwt-decode';

export default function Dashboard() {
  const navigate = useNavigate();
  const token = getSavedToken();
  const [chores, setChores] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningTo, setAssigningTo] = useState(null);
  const [assignUserId, setAssignUserId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    load();
  }, []);

  async function load() {
    setLoading(true); setError(null);
    try {
      const decoded = jwtDecode(token);
      const res = await api.listChores();
      setChores(res.chores || []);
      // load family members via family endpoint if family exists
      if (decoded.familyId) {
        const famRes = await api.getFamily(decoded.familyId);
        setMembers(famRes.family.members || []);
      } else {
        setMembers([]);
      }
    } catch (err) {
      setError(err.message || JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(payload) {
    try {
      await api.createChore(payload);
      await load();
    } catch (err) {
      alert('Error: ' + (err.message || JSON.stringify(err)));
    }
  }

  async function handleDone(id) {
    try {
      await api.markDone(id);
      await load();
    } catch (err) {
      alert('Error marking done: ' + (err.message || JSON.stringify(err)));
    }
  }

  function openAssign(chore) {
    setAssigningTo(chore);
    setAssignUserId(chore.assignee ? chore.assignee.id : null);
  }

  async function doAssign() {
    if (!assignUserId) { alert('Select a user'); return; }
    try {
      await api.assignChore(assigningTo.id, { assignedToId: assignUserId });
      setAssigningTo(null);
      setAssignUserId(null);
      await load();
    } catch (err) {
      alert('Assign error: ' + (err.message || JSON.stringify(err)));
    }
  }

  async function doAutoAssign() {
    try {
      await api.autoAssign();
      await load();
    } catch (err) {
      alert('Auto-assign error: ' + (err.message || JSON.stringify(err)));
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <div className="flex gap-2">
            <button onClick={doAutoAssign} className="bg-yellow-500 text-white px-3 py-1 rounded">Auto-assign</button>
            <button onClick={load} className="bg-gray-200 px-3 py-1 rounded">Refresh</button>
          </div>
        </div>

        {loading ? <div>Loading...</div> : (
          chores.length === 0 ? <div className="text-gray-500">Heç bir tapşırıq yoxdur.</div> :
          <div className="space-y-3">
            {chores.map(c => <TaskCard key={c.id} chore={c} onDone={handleDone} onAssignClick={openAssign} />)}
          </div>
        )}

        {assigningTo && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
            <div className="bg-white p-4 rounded shadow w-full max-w-md">
              <h3 className="font-semibold mb-2">Assign "{assigningTo.title}"</h3>
              <select className="w-full border p-2 rounded" value={assignUserId || ''} onChange={e=>setAssignUserId(Number(e.target.value))}>
                <option value="">-- Select member --</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}
              </select>
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={()=>{ setAssigningTo(null); setAssignUserId(null); }} className="px-3 py-1">Cancel</button>
                <button onClick={doAssign} className="bg-indigo-600 text-white px-3 py-1 rounded">Assign</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <AddTaskForm onAdd={handleAdd} />
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-2">Family Members</h4>
          {members.length === 0 ? <div className="text-sm text-gray-500">You have no family yet. Create or join one in Family tab.</div> :
            <ul className="space-y-2">
              {members.map(m => <li key={m.id} className="text-sm">{m.name} <span className="text-xs text-gray-400">({m.role})</span></li>)}
            </ul>
          }
        </div>
      </aside>
    </div>
  );
}
