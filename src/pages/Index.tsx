import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import React from "react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 text-center">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          Jarvis Financeiro
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-8">
          Seu assistente financeiro pessoal, direto no WhatsApp. Gerencie gastos, defina metas e controle suas finanças de forma simples e gratuita.
        </p>
        <div className="mb-12">
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
            Usar no WhatsApp <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="mt-4 text-sm text-gray-500">
            100% Gratuito • Limites operacionais aplicáveis
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Registro Rápido</h3>
            <p className="text-gray-600">Anote seus gastos em segundos, diretamente pelo WhatsApp.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Metas e Dívidas</h3>
            <p className="text-gray-600">Crie metas financeiras e gerencie suas dívidas com lembretes inteligentes.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Categorização Inteligente</h3>
            <p className="text-gray-600">Organize suas despesas em categorias para uma visão clara do seu dinheiro.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Notificações Personalizadas</h3>
            <p className="text-gray-600">Receba alertas e resumos financeiros diretamente no seu WhatsApp.</p>
          </div>
        </div>
      </div>
      <div className="mt-16">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;