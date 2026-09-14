'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface ImportFolder {
  id: string;
  folderNumber: string;
  status: string;
  createdAt: string;
}

export default function FoldersPage() {
  const { clientId } = useParams(); // Assuming we are in /clients/[clientId]/folders
  const router = useRouter();
  const [folders, setFolders] = useState<ImportFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [folderNumber, setFolderNumber] = useState('');

  useEffect(() => {
    fetchFolders();
  }, [clientId]);

  async function fetchFolders() {
    setLoading(true);
    try {
      const res = await fetch(`/api/folders?clientId=${clientId}`);
      if (res.ok) setFolders(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, folderNumber }),
      });
      if (res.ok) {
        setShowForm(false);
        setFolderNumber('');
        await fetchFolders();
      } else {
        const data = await res.json();
        alert(data.error || 'Error creating folder');
      }
    } catch (e) {
      alert('An unexpected error occurred');
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dossiers d'Importation</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {showForm ? 'Annuler' : 'Nouveau Dossier'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateFolder} className="bg-white p-6 rounded-lg shadow border mb-8 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Numéro du Dossier *</label>
            <input
              required
              type="text"
              value={folderNumber}
              onChange={(e) => setFolderNumber(e.target.value)}
              placeholder="ex: FOLD-2026-001"
              className="w-full p-2 border rounded"
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Créer le Dossier
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs uppercase text-gray-500">
              <th className="p-4 font-semibold">Numéro</th>
              <th className="p-4 font-semibold">Statut</th>
              <th className="p-4 font-semibold">Date de Création</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="text-center"><td colSpan={4} className="p-8">Chargement...</td></tr>
            ) : folders.length === 0 ? (
              <tr className="text-center"><td colSpan={4} className="p-8 text-gray-400">Aucun dossier trouvé</td></tr>
            ) : (
              folders.map(folder => (
                <tr key={folder.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 text-sm font-medium">{folder.folderNumber}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      folder.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                      folder.status === 'VALIDATED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {folder.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{new Date(folder.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-sm text-right">
                    <button
                      onClick={() => router.push(`/folders/${folder.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      Gérer le dossier
                    </button>
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
