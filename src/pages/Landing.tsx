import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-blue-50 to-indigo-100 p-4 text-center">
      <div className="flex flex-col items-center justify-center flex-grow max-w-md mx-auto">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Creative Go Financeiro
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Seu assistente financeiro pessoal, direto no WhatsApp.
          Gerencie gastos, defina metas e controle suas dívidas de forma simples e gratuita.
        </p>

        <div className="w-full space-y-4 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Funcionalidades Principais:</h2>
          <ul className="list-disc list-inside text-lg text-gray-600 space-y-2">
            <li>Registro rápido de gastos via WhatsApp</li>
            <li>Categorização inteligente de despesas</li>
            <li>Definição e acompanhamento de metas financeiras</li>
            <li>Gestão simplificada de dívidas</li>
            <li>Notificações e lembretes personalizados</li>
            <li>Painel de controle intuitivo</li>
          </ul>
        </div>

        <Link to="/login" className="w-full"> {/* Alterado para /login */}
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
            Começar Agora
          </Button>
        </Link>
        <p className="text-sm text-gray-500 mt-4">
          100% gratuito com limites operacionais. Planos futuros opcionais.
        </p>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Landing;