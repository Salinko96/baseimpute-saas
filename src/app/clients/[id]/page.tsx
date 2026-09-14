'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface SHBase {
  id: string;
  shCode: string;
  description: string;
}

interface Client {
  id: string;
  name: string;
  nif: string;
}

export default function ClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [shBases, setShBases] = useState<SHBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSH, setNewSH] = useState({ shCode: '', description: '' });

  useEffect(() => {
    fetchClientDetails();
    fetchSHBases();
  }, [id]);

  async function fetchClientDetails() {
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (res.ok) setClient(await res.json());
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchSHBases() {
    try {
      const res = await fetch(`/api/clients/sh-base?clientId=${id}`);
      if (res.ok) setShBases(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSH(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/clients/sh-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: id, ...newSH }),
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewSH({ shCode: '', description: '' });
        await fetchSHBases();
      } else {
        const data = await res.json();
        alert(data.error || 'Error adding SH code');
      }
    } catch (e) {
      alert('An unexpected error occurred');
    }
  }

  async function handleDeleteSH(shId: string) {
    if (!confirm('Are you sure you want to delete this SH code?')) return;
    try {
      const res = await fetch(`/api/clients/sh-base?id=${shId}`, { method: 'DELETE' });
      if (res.ok) await fetchSHBases();
    } catch (e) {
      alert('Error deleting');
    }
  }

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <a href="/clients" className="text-blue-600 hover:underline mb-4 block">← Retour aux clients</a>
        <h1 className="text-3xl font-bold">{client?.name || 'Détails Client'}</h1>
        <p className="text-gray-600">NIF: {client?.nif}</p>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="font-semibold">Nomenclature SH du Client</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            {showAddForm ? 'Annuler' : '+ Ajouter un code SH'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddSH} className="p-4 border-b bg-blue-50 grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium mb-1">Code SH</label>
              <input
                required
                type="text"
                value={newSH.shCode}
                onChange={(e) => setNewSH({...newSH, shCode: e.target.value})}
                placeholder="ex: 0101.21.00.00"
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium mb-1">Désignation</label>
              <input
                required
                type="text"
                value={newSH.description}
                onChange={(e) => setNewSH({...newSH, description: e.target.value})}
                placeholder="Description du produit"
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                Ajouter
              </button>
            </div>
          </form>
        )}

        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs uppercase text-gray-500">
              <th className="p-4 font-semibold">Code SH</th>
              <th className="p-4 font-semibold">Désignation</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shBases.length === 0 ? (
              <tr className="text-center"><td colSpan={3} className="p-8 text-gray-400">Aucun code SH configuré</td></tr>
            ) : (
              shBases.map(sh => (
                <tr key={sh.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm font-mono">{sh.shCode}</td>
                  <td className="p-4 text-sm">{sh.description}</td>
                  <td className="p-4 text-sm text-right">
                    <button
                      onClick={() => handleDeleteSH(sh.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Supprimer
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
