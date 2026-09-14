'use client';

import { useState, useEffect } from 'react';

interface Client {
  id: string;
  name: string;
  nif: string;
  agreementNo?: string;
  address?: string;
  email?: string;
  phone?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nif: '',
    agreementNo: '',
    address: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      if (res.ok) setClients(data);
    } catch (e) {
      console.error('Error fetching clients:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({ name: '', nif: '', agreementNo: '', address: '', email: '', phone: '' });
        await fetchClients();
      } else {
        const data = await res.json();
        alert(data.error || 'Error creating client');
      }
    } catch (e) {
      alert('An unexpected error occurred');
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Clients</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {showForm ? 'Annuler' : 'Nouveau Client'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow border mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">Nom de l'entreprise *</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">NIF *</label>
              <input
                required
                type="text"
                value={formData.nif}
                onChange={(e) => setFormData({...formData, nif: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">N° Agrément</label>
              <input
                type="text"
                value={formData.agreementNo}
                onChange={(e) => setFormData({...formData, agreementNo: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">Téléphone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">Adresse</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="col-span-2 flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Enregistrer le Client
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-sm">Entreprise</th>
              <th className="p-4 font-semibold text-sm">NIF</th>
              <th className="p-4 font-semibold text-sm">Agrément</th>
              <th className="p-4 font-semibold text-sm">Contact</th>
              <th className="p-4 font-semibold text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">Chargement...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center">Aucun client trouvé</td></tr>
            ) : (
              clients.map(client => (
                <tr key={client.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 text-sm font-medium">{client.name}</td>
                  <td className="p-4 text-sm">{client.nif}</td>
                  <td className="p-4 text-sm">{client.agreementNo || '-'}</td>
                  <td className="p-4 text-sm">{client.email || client.phone || '-'}</td>
                  <td className="p-4 text-sm text-right">
                    <button className="text-blue-600 hover:underline">Détails</button>
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
