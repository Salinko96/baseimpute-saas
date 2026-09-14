import React from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="text-gray-500">Bienvenue dans votre espace de gestion douanière.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/clients" className="bg-white border px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
            Clients
          </Link>
          <Link href="/tec" className="bg-white border px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
            Gestion TEC
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Dossiers Actifs" value="12" change="+2 ce mois" color="blue" />
        <StatCard title="Taxes Calculées" value="4.5M GNF" change="+12% vs mois dernier" color="green" />
        <StatCard title="Alertes Matching" value="3" change="À vérifier" color="red" />
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-lg font-semibold mb-4">Activités Récentes</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">Dossier FOLD-2026-00{i}</span>
                  <span className="text-gray-500 ml-2">validé par Admin</span>
                </div>
                <span className="text-xs text-gray-400">il y a {i}h</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-lg font-semibold mb-4">Raccourcis Rapides</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/clients" className="p-4 border rounded-lg hover:bg-blue-50 transition text-center group">
              <div className="text-2xl mb-2 group-hover:scale-110 transition">👥</div>
              <div className="text-sm font-medium">Gérer Clients</div>
            </Link>
            <Link href="/tec" className="p-4 border rounded-lg hover:bg-blue-50 transition text-center group">
              <div className="text-2xl mb-2 group-hover:scale-110 transition">📜</div>
              <div className="text-sm font-medium">Mettre à jour TEC</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, color }: { title: string, value: string, change: string, color: 'blue' | 'green' | 'red' }) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${colors[color]}`}>{change}</span>
      </div>
    </div>
  );
}
