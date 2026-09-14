'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  oldValue: any;
  newValue: any;
  createdAt: string;
}

export default function AuditLogPage() {
  const { id } = useParams();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [id]);

  async function fetchLogs() {
    try {
      const res = await fetch(`/api/audit-logs/${id}`);
      if (res.ok) setLogs(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Journal d'Audit</h1>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs uppercase text-gray-500">
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Action</th>
              <th className="p-4 font-semibold">Type</th>
              <th className="p-4 font-semibold">Modifications</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="text-center"><td colSpan={4} className="p-8">Chargement...</td></tr>
            ) : logs.length === 0 ? (
              <tr className="text-center"><td colSpan={4} className="p-8 text-gray-400">Aucun log disponible</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-4 text-sm font-medium">{log.action}</td>
                  <td className="p-4 text-sm">{log.entityType}</td>
                  <td className="p-4 text-xs font-mono text-gray-600">
                    <div className="flex flex-col gap-1">
                      <div className="text-red-500 line-through">{JSON.stringify(log.oldValue)}</div>
                      <div className="text-green-600">{JSON.stringify(log.newValue)}</div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
