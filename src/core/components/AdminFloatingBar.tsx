import React from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Eye, Edit3, Settings, LogOut } from 'lucide-react';

export const AdminFloatingBar: React.FC = () => {
  const { isAdmin, mode, setMode, logout } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAdmin) return null;

  const isAdminDashboard = location.pathname === '/admin';

  return (
    <aside
      aria-label="Barra de Administração"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[#1a3c5a]/95 text-white backdrop-blur-md px-4 py-2 rounded-full shadow-2xl border-2 border-amber-400/80 flex items-center gap-3 text-xs font-black animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-center gap-1.5 text-amber-300 pr-2 border-r border-slate-600">
        <Shield size={16} className="text-amber-400" />
        <span className="hidden sm:inline uppercase tracking-widest text-[10px]">Admin</span>
      </div>

      {/* Alternador Visão Aluno ↔ Modo Edição */}
      <div className="flex items-center bg-slate-800/80 p-0.5 rounded-full border border-slate-700">
        <button
          type="button"
          onClick={() => setMode('aluno')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
            mode === 'aluno'
              ? 'bg-blue-600 text-white shadow-sm font-black'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Ver o site exatamente como um aluno comum"
        >
          <Eye size={13} />
          <span>Visão Aluno</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('edicao')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
            mode === 'edicao'
              ? 'bg-amber-500 text-slate-900 shadow-sm font-black'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Ativar botões de edição rápida na própria tela"
        >
          <Edit3 size={13} />
          <span>Modo Edição</span>
        </button>
      </div>

      {/* Botão Painel Central / Voltar ao Site */}
      {isAdminDashboard ? (
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-full transition-all cursor-pointer"
        >
          <span>Ir para o Site</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all cursor-pointer shadow-sm"
        >
          <Settings size={13} />
          <span className="hidden sm:inline">Painel Central</span>
        </button>
      )}

      {/* Sair */}
      <button
        type="button"
        onClick={() => logout()}
        className="p-1.5 hover:bg-red-500/30 text-slate-400 hover:text-red-400 rounded-full transition-all cursor-pointer ml-1"
        title="Encerrar sessão de Administrador"
      >
        <LogOut size={14} />
      </button>
    </aside>
  );
};
