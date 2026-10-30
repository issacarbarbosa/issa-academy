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
  const isMestreDaClave = location.pathname === '/mestre-da-clave';

  return (
    <aside
      aria-label="Barra de Administração"
      className={`fixed left-1/2 -translate-x-1/2 z-50 bg-[#1a3c5a]/95 text-white backdrop-blur-md px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-2xl border-2 border-amber-400/80 flex items-center gap-1.5 sm:gap-3 text-[11px] sm:text-xs font-black max-w-[96vw] animate-in fade-in duration-300 ${
        isMestreDaClave ? 'top-2' : 'bottom-4'
      }`}
    >
      <div className="flex items-center gap-1.5 text-amber-300 pr-1.5 sm:pr-2 border-r border-slate-600 shrink-0">
        <Shield size={15} className="text-amber-400" />
        <span className="hidden sm:inline uppercase tracking-widest text-[10px]">Admin</span>
      </div>

      {/* Alternador Visão Aluno ↔ Modo Edição */}
      <div className="flex items-center bg-slate-800/80 p-0.5 rounded-full border border-slate-700 shrink-0">
        <button
          type="button"
          onClick={() => setMode('aluno')}
          className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
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
          className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
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
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>Ir ao Site</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all cursor-pointer shadow-sm whitespace-nowrap shrink-0"
        >
          <Settings size={13} />
          <span className="hidden sm:inline">Painel Central</span>
        </button>
      )}

      {/* Sair */}
      <button
        type="button"
        onClick={() => logout()}
        className="p-1.5 hover:bg-red-500/30 text-slate-400 hover:text-red-400 rounded-full transition-all cursor-pointer shrink-0"
        title="Encerrar sessão de Administrador"
      >
        <LogOut size={14} />
      </button>
    </aside>
  );
};
