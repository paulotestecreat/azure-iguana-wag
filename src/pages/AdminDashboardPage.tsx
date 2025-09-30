import React from 'react';

const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Painel Administrativo</h1>
        <p className="text-lg text-gray-600 mb-6">Métricas de uso e monitoramento de limites para administradores.</p>
        <p className="text-sm text-gray-500">Dados de uso e ferramentas de administração.</p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;