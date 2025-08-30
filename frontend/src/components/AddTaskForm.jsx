import React, { useState } from 'react';

export default function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('once');
  const [dueDate, setDueDate] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, description, frequency, dueDate: dueDate || null });
    setTitle(''); setDescription(''); setFrequency('once'); setDueDate('');
  };

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-3">
      <h3 className="font-semibold">Yeni Tapşırıq əlavə et</h3>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Başlıq" className="w-full border p-2 rounded" />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Təsvir (optional)" className="w-full border p-2 rounded" />
      <div className="flex gap-2">
        <select value={frequency} onChange={e => setFrequency(e.target.value)} className="border p-2 rounded">
          <option value="once">Once</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="border p-2 rounded" />
        <button type="submit" className="bg-indigo-600 text-white px-3 rounded">Əlavə et</button>
      </div>
    </form>
  );
}
