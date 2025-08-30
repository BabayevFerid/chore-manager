import React from 'react';

export default function TaskCard({ chore, onDone, onAssignClick }) {
  return (
    <div className="bg-white rounded shadow p-4 flex items-start justify-between">
      <div>
        <h3 className="font-semibold">{chore.title}</h3>
        {chore.description && <p className="text-sm text-gray-600 mt-1">{chore.description}</p>}
        <div className="text-xs text-gray-500 mt-2">
          <span>Frequency: {chore.frequency}</span>
          {chore.dueDate && <span className="ml-3">Due: {new Date(chore.dueDate).toLocaleDateString()}</span>}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Assigned: {chore.assignee ? chore.assignee.name : <em>—</em>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {chore.status === 'pending' ? (
          <button onClick={() => onDone(chore.id)} className="bg-green-500 text-white px-3 py-1 rounded text-sm">Done</button>
        ) : (
          <span className="text-sm text-green-700 font-semibold">Completed</span>
        )}
        <button onClick={() => onAssignClick(chore)} className="text-sm text-indigo-600 underline">Assign</button>
      </div>
    </div>
  );
}
