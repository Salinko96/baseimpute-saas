'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface FolderLine {
  id: string;
  description: string;
  shCode: string;
  cifValue: number;
  dutyAmount: number;
  statAmount: number;
  totalAmount: number;
  isExempt: boolean;
}

export default function FolderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lines, setLines] = useState<FolderLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchLines();
  }, [id]);

  async function fetchLines() {
    try {
      const res = await fetch(`/api/folders/${id}/lines`);
      if (res.ok) setLines(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleExtract() {
    setExtracting(true);
    try {
      // In a real flow, we'd get the latest uploaded file URL from the folder's document list
      const res = await fetch('/api/folders/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId: id, fileUrl: 'https://supabase-storage.com/invoice.pdf' }),
      });
      if (res.ok) await fetchLines();
    } catch (e) {
      alert('Extraction failed');
    } finally {
      setExtracting(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderId', id as string);

    try {
      const res = await fetch('/api/folders/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        alert('Fichier uploadé avec succès !');
      } else {
        alert('Erreur lors de l\'upload');
      }
    } catch (e) {
      alert('Une erreur est survenue');
    } finally {
      setUploading(false);
    }
  }

  async function updateLine(lineId: string, field: keyof FolderLine, value: any) {
    try {
      const res = await fetch(`/api/folders/lines/${lineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) await fetchLines();
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <a href="/clients" className="text-blue-600 hover:underline mb-4 block text-sm">← Retour aux clients</a>
          <h1 className="text-2xl font-bold">Gestion du Dossier</h1>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="file"
              onChange={handleUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer px-4 py-2 rounded text-white transition ${uploading ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'}`}
            >
              {uploading ? 'Upload...' : '📁 Upload Document'}
            </label>
          </div>
          <button
            onClick={handleExtract}
            disabled={extracting}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 transition"
          >
            {extracting ? 'Extraction en cours...' : 'Simuler Extraction PDF'}
          </button>
          <button
            onClick={async () => {
              const res = await fetch(`/api/folders/${id}/calculate`, { method: 'POST' });
              if (res.ok) {
                alert('Calculs terminés');
                await fetchLines();
              } else {
                alert('Erreur de calcul');
              }
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Calculer les Taxes
          </button>
          <button
            onClick={async () => {
              const res = await fetch(`/api/folders/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'VALIDATED' }),
              });
              if (res.ok) {
                alert('Dossier validé avec succès');
              } else {
                alert('Erreur lors de la validation');
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Valider le Dossier
          </button>
          <a
            href={`/api/folders/${id}/export`}
            target="_blank"
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition"
          >
            Export Excel
          </a>
          <button
            onClick={() => router.push(`/audit-logs/${id}`)}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            Audit
          </button>
        </div>




      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-xs uppercase text-gray-500">
              <th className="p-4 font-semibold">Désignation</th>
              <th className="p-4 font-semibold">Code SH</th>
              <th className="p-4 font-semibold">Valeur CIF</th>
              <th className="p-4 font-semibold">D.D.</th>
              <th className="p-4 font-semibold">R.S.</th>
              <th className="p-4 font-semibold">Total</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr className="text-center"><td colSpan={7} className="p-8 text-gray-400">Aucune ligne extraite. Cliquez sur "Simuler Extraction".</td></tr>
            ) : (
              lines.map(line => (
                <tr key={line.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <input
                      className="p-1 border rounded w-full"
                      value={line.description}
                      onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                    />
                  </td>
                  <td className="p-4">
                    <input
                      className="p-1 border rounded w-full font-mono"
                      value={line.shCode}
                      onChange={(e) => updateLine(line.id, 'shCode', e.target.value)}
                    />
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      className="p-1 border rounded w-full"
                      value={line.cifValue}
                      onChange={(e) => updateLine(line.id, 'cifValue', parseFloat(e.target.value))}
                    />
                  </td>
                  <td className="p-4 text-sm">{line.dutyAmount.toLocaleString()}</td>
                  <td className="p-4 text-sm">{line.statAmount.toLocaleString()}</td>
                  <td className="p-4 text-sm font-bold">{line.totalAmount.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <button className="text-red-600 hover:underline text-sm">Supprimer</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
