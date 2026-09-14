'use client';

import { useState } from 'react';

export default function TECManagementPage() {
  const [versionName, setVersionName] = useState('');
  const [filePath, setFilePath] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>({
    type: 'idle',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch('/api/tec/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, versionName }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: `Successfully imported ${data.count} rates.` });
      } else {
        setStatus({ type: 'error', message: data.error || 'Import failed' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestion du TEC</h1>

      <div className="bg-white p-6 rounded-lg shadow border space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom de la version</label>
          <input
            type="text"
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
            placeholder="ex: Tarif 2026"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Chemin du fichier (.xls)</label>
          <input
            type="text"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder="/Users/path/to/tec.xls"
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          onClick={handleImport}
          disabled={loading || !versionName || !filePath}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? 'Importation...' : 'Importer le TEC'}
        </button>

        {status.message && (
          <div className={`p-3 rounded ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
