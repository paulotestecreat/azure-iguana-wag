import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-blue-50 to-indigo-100 p-4 text-center">
      <div className="flex flex-col items-center justify-center flex-grow max-w-md mx-auto">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Meu Controle Financeiro - CreativeGO
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Seu assistente financeiro pessoal para gerenciar gastos, definir metas e controlar suas finanças de forma simples e gratuita.
        </p>

        <div className="w-full space-y-4 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Funcionalidades Principais:</h2>
          <ul className="list-disc list-inside text-lg text-gray-600 space-y-2">
            <li>Registro rápido de transações (receitas e despesas)</li>
            <li>Categorização personalizada de despesas e receitas</li>
            <li>Visualização de gráficos interativos</li>
            <li>Listagem e filtragem de todas as transações</li>
            <li>Relatórios de entradas, saídas e saldo</li>
          </ul>
        </div>

        <Link to="/login" className="w-full">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
            Entrar no Sistema
          </Button>
        </Link>
        <p className="text-sm text-gray-500 mt-4">
          Totalmente gratuito para controle financeiro pessoal.
        </p>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Landing;