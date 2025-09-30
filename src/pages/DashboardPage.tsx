import React from 'react';

const DashboardPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Seu Painel Financeiro</h1>
        <p className="text-lg text-gray-600 mb-6">Visão geral dos seus gastos, metas e dívidas.</p>
        <p className="text-sm text-gray-500">Gráficos e resumos financeiros aparecerão aqui.</p>
      </div>
    </div>
  );
};

export default DashboardPage;