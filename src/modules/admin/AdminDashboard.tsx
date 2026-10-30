import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../core/contexts/AdminContext';
import {
  contentStore,
  SiteConfig,
  QuestionFeedbackRecord,
} from '../../core/services/contentStore';
import { isSupabaseConfigured } from '../../core/services/supabaseClient';
import { MsaLesson, LessonBlock } from '../../core/types/lessons';
import { SimuladoQuestion } from '../simulado/questions/schema';
import { PresetScore, MsaClefType } from '../partituras/types/music';
import {
  loadCatalogFromStorage,
  loadHiddenPresetIds,
  reimportScoreMusicXmlInStorage,
  updateScoreMetadataInStorage,
  deleteScoreFromStorage,
  restoreDefaultScoreInStorage,
  restoreHiddenFactoryScoresInStorage,
  downloadScoreMusicXmlFile,
} from '../partituras/data/sampleScores';
import { MSA_OFFICIAL_CLEFS, HYMNAL_EDITION_SHORT_LABELS } from '../partituras/utils/musicMath';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  MessageSquareWarning,
  Gamepad2,
  Palette,
  CloudUpload,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Search,
  ShieldAlert,
  Save,
  X,
  FileSpreadsheet,
  Music2,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    isAdmin,
    user,
    loginWithEmail,
    sendMagicLink,
    loginWithGoogle,
    loginLocalPreview,
    logout,
  } = useAdmin();

  // Estados de Login
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Estados de Navegação do Dashboard
  const [activeTab, setActiveTab] = useState<
    'overview' | 'scores' | 'lessons' | 'questions' | 'feedbacks' | 'game' | 'site'
  >('overview');

  // Dados do Store
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [lessons, setLessons] = useState<MsaLesson[]>([]);
  const [questions, setQuestions] = useState<SimuladoQuestion[]>([]);
  const [feedbacks, setFeedbacks] = useState<QuestionFeedbackRecord[]>([]);
  const [catalogScores, setCatalogScores] = useState<PresetScore[]>([]);
  const [hiddenScoresCount, setHiddenScoresCount] = useState<number>(0);

  // Estados de Gestão de Partituras & Hinário
  const [scoreCollectionFilter, setScoreCollectionFilter] = useState<'all' | 'msa' | 'hinario5'>('all');
  const [scoreSearch, setScoreSearch] = useState<string>('');
  const [editingScoreMeta, setEditingScoreMeta] = useState<PresetScore | null>(null);
  const scoreXmlInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingXmlTarget, setPendingXmlTarget] = useState<{ scoreId: string; clef?: MsaClefType } | null>(null);
  const restoreBackupInputRef = useRef<HTMLInputElement | null>(null);

  // Confirmação Inline (sem window.confirm / window.alert)
  const [confirmActionKey, setConfirmActionKey] = useState<string | null>(null);

  // Estados de Edição de Lições
  const [filterFaseLesson, setFilterFaseLesson] = useState<number>(1);
  const [editingLesson, setEditingLesson] = useState<MsaLesson | null>(null);

  // Estados de Edição de Questões
  const [searchQuestion, setSearchQuestion] = useState('');
  const [filterFaseQuestion, setFilterFaseQuestion] = useState<number>(0); // 0 = todas
  const [filterStatusQuestion, setFilterStatusQuestion] = useState<'todos' | 'ativas' | 'inativas'>('todos');
  const [editingQuestion, setEditingQuestion] = useState<SimuladoQuestion | null>(null);

  // Estados de Feedback
  const [filterFeedbackStatus, setFilterFeedbackStatus] = useState<string>('todos');

  // Estados de Sincronização Cloud
  const [syncStatus, setSyncStatus] = useState<{
    loading: boolean;
    result?: { success: boolean; questionsCount: number; lessonsCount: number; scoresCount?: number; error?: string };
  }>({ loading: false });

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const loadAllData = async () => {
    const [cfg, less, qList, fList] = await Promise.all([
      contentStore.getSiteConfig(),
      contentStore.getLessons(),
      contentStore.getAllQuestions(),
      contentStore.getFeedbacks(),
    ]);
    setSiteConfig(cfg);
    setLessons(less);
    setQuestions(qList);
    setFeedbacks(fList);
    setCatalogScores(loadCatalogFromStorage());
    setHiddenScoresCount(loadHiddenPresetIds().length);
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  // ==================== TELA DE LOGIN EXCLUSIVA ====================
  if (!isAdmin) {
    const handleLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoggingIn(true);
      setLoginError(null);

      const res = await loginWithEmail(emailInput, passwordInput);
      if (!res.success) {
        setLoginError(res.error || 'Erro ao entrar.');
      }
      setIsLoggingIn(false);
    };

    const handleLocalPreviewLogin = () => {
      const ok = loginLocalPreview('issa2026');
      if (!ok) setLoginError('Senha de preview incorreta.');
    };

    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-100 min-h-[70vh]">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border-2 border-slate-200 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#1a3c5a] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-slate-300">
              <ShieldAlert size={32} className="text-amber-400" />
            </div>
            <h1 className="text-xl font-black text-[#1a3c5a]">Acesso de Administrador</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Área exclusiva para gestão de lições, questões e informações do Issa Academy.
            </p>
          </div>

          {/* Status do Backend */}
          <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-0.5">
              Status do Backend
            </span>
            {isSupabaseConfigured ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                🟢 Supabase Cloud Conectado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                🟡 Modo Local / Preview Offline
              </span>
            )}
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center">
              {loginError}
            </div>
          )}

          {magicLinkSent && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl text-center">
              ✔ Link de acesso enviado para {emailInput}! Verifique sua caixa de entrada (ou spam) para entrar sem senha.
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1">
                E-mail de Administrador
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="seu-email@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-sm font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1">
                Senha
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-sm font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-[#1a3c5a] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? 'Entrando...' : 'Entrar como Admin'}
            </button>
          </form>

          {isSupabaseConfigured && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                disabled={isLoggingIn || !emailInput}
                onClick={async () => {
                  if (!emailInput) {
                    setLoginError('Digite seu e-mail acima para receber o link de acesso.');
                    return;
                  }
                  setIsLoggingIn(true);
                  setLoginError(null);
                  const res = await sendMagicLink(emailInput);
                  setIsLoggingIn(false);
                  if (res.success) {
                    setMagicLinkSent(true);
                  } else {
                    setLoginError(res.error || 'Erro ao enviar link mágico.');
                  }
                }}
                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-2 border-indigo-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <span>✉️ Receber Link Mágico por E-mail</span>
              </button>
              <button
                type="button"
                disabled={isLoggingIn}
                onClick={async () => {
                  setIsLoggingIn(true);
                  setLoginError(null);
                  const res = await loginWithGoogle();
                  if (!res.success) {
                    setLoginError(res.error || 'Erro ao conectar com Google');
                    setIsLoggingIn(false);
                  }
                }}
                className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <span>Entrar com Conta Google</span>
              </button>
            </div>
          )}

          {/* Atalho para Modo Preview Local (Apenas ambiente de desenvolvimento/testes) */}
          {!import.meta.env.PROD && (
            <div className="mt-6 pt-4 border-t border-slate-200/80 text-center">
              <button
                type="button"
                onClick={handleLocalPreviewLogin}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-black cursor-pointer underline"
              >
                Entrar em Modo Preview Local (Sem login Supabase)
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== DASHBOARD AUTENTICADO ====================
  const handleSeedSupabase = async () => {
    setSyncStatus({ loading: true });
    const res = await contentStore.seedInitialDataToSupabase();
    setSyncStatus({ loading: false, result: res });
    if (res.success) {
      showNotification(
        `✔ Sincronização concluída: ${res.questionsCount} questões, ${res.lessonsCount} lições e ${res.scoresCount ?? 0} partituras enviadas!`
      );
    } else {
      showNotification(`⚠️ Falha na sincronização: ${res.error}`);
    }
  };

  const handleExportBackup = async () => {
    const json = await contentStore.exportFullBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `issa-academy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('✔ Backup JSON completo baixado com sucesso!');
  };

  const handleRestoreBackupFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const res = await contentStore.restoreFullBackupJson(text);
      if (res.success) {
        await loadAllData();
        showNotification(
          `✔ Backup restaurado (${res.lessonsCount} lições, ${res.questionsCount} questões, ${res.scoresCount} partituras)!`
        );
      } else {
        showNotification(`⚠️ Erro ao restaurar backup: ${res.error}`);
      }
    } finally {
      e.target.value = '';
    }
  };

  const handleScoreXmlFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingXmlTarget) return;
    try {
      const text = await file.text();
      if (text.includes('<score-partwise') || text.includes('<score-timewise')) {
        const next = reimportScoreMusicXmlInStorage(
          catalogScores,
          pendingXmlTarget.scoreId,
          text,
          pendingXmlTarget.clef
        );
        setCatalogScores(next);
        showNotification('✔ MusicXML atualizado no catálogo com sucesso!');
      } else {
        showNotification('⚠️ Arquivo inválido: selecione um arquivo .musicxml ou .xml válido.');
      }
    } finally {
      setPendingXmlTarget(null);
      e.target.value = '';
    }
  };

  const handleExportFeedbacksCsv = () => {
    if (feedbacks.length === 0) {
      showNotification('Nenhum feedback registrado para exportar.');
      return;
    }

    const sanitizeCsvCell = (val: unknown): string => {
      const str = String(val ?? '');
      const escaped = str.replace(/"/g, '""');
      // Previne CSV Injection / Formula Injection no Excel e Google Sheets
      if (/^[=+\-@\t\r]/.test(escaped)) {
        return `"'${escaped}"`;
      }
      return `"${escaped}"`;
    };

    const headers = ['ID', 'Questao_ID', 'Fase', 'Periodo', 'Motivo', 'Comentario', 'Status', 'Data'];
    const rows = feedbacks.map((f) => [
      sanitizeCsvCell(f.id),
      sanitizeCsvCell(f.question_id),
      sanitizeCsvCell(f.fase),
      sanitizeCsvCell(f.periodo),
      sanitizeCsvCell(f.reason),
      sanitizeCsvCell(f.comment),
      sanitizeCsvCell(f.status),
      sanitizeCsvCell(f.created_at),
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `issa-feedbacks-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('✔ Planilha CSV de feedbacks baixada!');
  };

  // Filtragem de Questões
  const filteredQuestions = questions.filter((q) => {
    if (filterFaseQuestion !== 0 && q.referencia?.fase !== filterFaseQuestion) return false;
    if (filterStatusQuestion === 'ativas' && q.ativo === false) return false;
    if (filterStatusQuestion === 'inativas' && q.ativo !== false) return false;
    if (searchQuestion.trim()) {
      const term = searchQuestion.toLowerCase();
      const matchId = q.id.toLowerCase().includes(term);
      const matchPergunta = q.pergunta.toLowerCase().includes(term);
      const matchOpcoes = q.opcoes.some((o) => o.texto.toLowerCase().includes(term));
      if (!matchId && !matchPergunta && !matchOpcoes) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 animate-in fade-in duration-300">
      {/* Notificação Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-black text-xs flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle size={18} /> {notification}
        </div>
      )}

      {/* ==================== HEADER DO DASHBOARD ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b-2 border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm">
              Painel de Controle
            </span>
            <span className="text-xs text-slate-500 font-bold">
              Conectado como: <strong>{user?.name || user?.email}</strong>
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1a3c5a] tracking-tight">
            Central de Administração Issa Academy
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={restoreBackupInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleRestoreBackupFileChange}
            className="hidden"
          />
          <input
            ref={scoreXmlInputRef}
            type="file"
            accept=".musicxml,.xml"
            onChange={handleScoreXmlFileChange}
            className="hidden"
          />

          <button
            onClick={() => handleExportBackup()}
            data-testid="admin-export-backup-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#f7f9fa] hover:bg-slate-100 text-slate-700 font-black text-xs rounded-xl border border-slate-200 shadow-sm cursor-pointer"
            title="Exportar backup completo de todo o banco (lições, questões, partituras e configurações) em JSON"
          >
            <Download size={14} /> Exportar Backup JSON
          </button>

          <button
            onClick={() => restoreBackupInputRef.current?.click()}
            data-testid="admin-restore-backup-btn"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-black text-xs rounded-xl border border-indigo-200 shadow-sm cursor-pointer"
            title="Restaurar backup JSON salvo anteriormente"
          >
            <Upload size={14} /> Restaurar Backup JSON
          </button>

          <button
            onClick={() => logout()}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-black text-xs rounded-xl border border-red-200 cursor-pointer transition-all"
          >
            Sair
          </button>
        </div>
      </div>

      {/* ==================== NAVEGAÇÃO DE ABAS ==================== */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap transition-all cursor-pointer border-2 ${
            activeTab === 'overview'
              ? 'bg-[#1a3c5a] text-white border-[#1a3c5a] shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          <LayoutDashboard size={16} /> Visão Geral & Cloud
        </button>

        <button
          onClick={() => setActiveTab('scores')}
          data-testid="admin-tab-scores"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap transition-all cursor-pointer border-2 ${
            activeTab === 'scores'
              ? 'bg-neutral-900 text-amber-400 border-neutral-900 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          <Music2 size={16} /> Partituras &amp; Hinário ({catalogScores.length})
        </button>

        <button
          onClick={() => setActiveTab('lessons')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap transition-all cursor-pointer border-2 ${
            activeTab === 'lessons'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          <BookOpen size={16} /> Gestor de Lições ({lessons.length})
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap transition-all cursor-pointer border-2 ${
            activeTab === 'questions'
              ? 'bg-[#58cc02] text-white border-[#58cc02] shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          <HelpCircle size={16} /> Questões do Simulado ({questions.length})
        </button>

        <button
          onClick={() => setActiveTab('feedbacks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap transition-all cursor-pointer border-2 ${
            activeTab === 'feedbacks'
              ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          <MessageSquareWarning size={16} /> Feedbacks dos Alunos (
          {feedbacks.filter((f) => f.status === 'pendente').length} novos)
        </button>

        <button
          onClick={() => setActiveTab('game')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap transition-all cursor-pointer border-2 ${
            activeTab === 'game'
              ? 'bg-[#1cb0f6] text-white border-[#1cb0f6] shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          <Gamepad2 size={16} /> Mestre da Clave
        </button>

        <button
          onClick={() => setActiveTab('site')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap transition-all cursor-pointer border-2 ${
            activeTab === 'site'
              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          <Palette size={16} /> Textos & Banners do Site
        </button>
      </div>

      {/* ==================== CONTEÚDO DAS ABAS ==================== */}

      {/* ABA 1: VISÃO GERAL */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Cartões de Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
              <div className="text-xs font-black uppercase text-slate-400 mb-1">Questões Blindadas</div>
              <div className="text-3xl font-black text-[#1a3c5a]">{questions.length}</div>
              <p className="text-[11px] text-slate-500 mt-1">16 fases completas no Simulado MSA</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
              <div className="text-xs font-black uppercase text-slate-400 mb-1">Lições Cadastradas</div>
              <div className="text-3xl font-black text-indigo-600">{lessons.length}</div>
              <p className="text-[11px] text-slate-500 mt-1">Aulas com tópicos e vídeos integrados</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
              <div className="text-xs font-black uppercase text-slate-400 mb-1">Feedbacks de Alunos</div>
              <div className="text-3xl font-black text-amber-500">
                {feedbacks.filter((f) => f.status === 'pendente').length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {feedbacks.length} reportes totais registrados
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
              <div className="text-xs font-black uppercase text-slate-400 mb-1">Status da Nuvem</div>
              <div className="text-sm font-black text-slate-800 mt-2">
                {isSupabaseConfigured ? '🟢 Supabase Ativo' : '🟡 Modo Local'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isSupabaseConfigured ? 'Pronto para sincronização cloud' : 'Configure no .env'}
              </p>
            </div>
          </div>

          {/* Sincronização 1-Clique para Supabase */}
          <div className="bg-gradient-to-r from-indigo-900 to-[#1a3c5a] text-white rounded-3xl p-6 md:p-8 shadow-xl">
            <div className="max-w-2xl">
              <span className="px-3 py-1 bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-lg inline-block mb-3">
                Sincronização Cloud
              </span>
              <h2 className="text-xl md:text-2xl font-black mb-2">
                Popular Banco de Dados no Supabase (1-Clique)
              </h2>
              <p className="text-sm text-slate-200 font-medium mb-6 leading-relaxed">
                Assim que você criar o seu projeto no Supabase e preencher o `.env`, clique no botão abaixo para enviar automaticamente todas as <strong>552 questões oficiais</strong>, as <strong>16 fases de lições com videoaulas do YouTube</strong> e as <strong>configurações do site</strong> para o seu PostgreSQL na nuvem!
              </p>

              <button
                onClick={handleSeedSupabase}
                disabled={syncStatus.loading || !isSupabaseConfigured}
                className="flex items-center gap-2.5 px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <CloudUpload size={18} />
                <span>
                  {syncStatus.loading
                    ? 'Sincronizando com a Nuvem...'
                    : 'Popular / Sincronizar Banco Inicial com o Supabase'}
                </span>
              </button>

              {!isSupabaseConfigured && (
                <p className="text-xs text-amber-300 font-bold mt-3">
                  ⚠️ O Supabase ainda não está configurado no arquivo `.env`. Suas alterações estão salvas no cache local do navegador.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: GESTOR DE LIÇÕES */}
      {activeTab === 'lessons' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border-2 border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-slate-500">Filtrar por Fase:</span>
              <select
                value={filterFaseLesson}
                onChange={(e) => setFilterFaseLesson(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl border-2 border-slate-200 font-bold text-xs"
              >
                {Array.from({ length: 16 }, (_, i) => i + 1).map((f) => (
                  <option key={f} value={f}>
                    Fase {f}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                const newId = `fase_${String(filterFaseLesson).padStart(2, '0')}_licao_${Date.now()}`;
                setEditingLesson({
                  id: newId,
                  periodo: (filterFaseLesson <= 3 ? 1 : filterFaseLesson <= 5 ? 2 : filterFaseLesson <= 9 ? 3 : 4) as 1 | 2 | 3 | 4,
                  fase: filterFaseLesson,
                  ordem: lessons.filter((l) => l.fase === filterFaseLesson).length + 1,
                  topico: `${filterFaseLesson}.${lessons.filter((l) => l.fase === filterFaseLesson).length + 1}`,
                  titulo: 'Nova Lição Didática',
                  resumo: 'Breve resumo do conteúdo desta lição.',
                  blocos: [
                    {
                      id: 'b1',
                      type: 'text',
                      title: 'Introdução ao Conceito',
                      content: 'Explique aqui a teoria do MSA de forma clara e objetiva.',
                    },
                  ],
                  ativo: true,
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow cursor-pointer"
            >
              <Plus size={16} /> Nova Lição na Fase {filterFaseLesson}
            </button>
          </div>

          {/* Lista de Lições da Fase */}
          <div className="space-y-3">
            {lessons
              .filter((l) => l.fase === filterFaseLesson)
              .map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white p-4 rounded-2xl border-2 border-slate-200 flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                      {lesson.topico}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-[#1a3c5a]">{lesson.titulo}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{lesson.resumo}</p>
                      {lesson.youtubeVideoId && (
                        <span className="text-[10px] font-bold text-red-600">
                          Vídeo ID: {lesson.youtubeVideoId}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingLesson({ ...lesson })}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                      title="Editar lição"
                    >
                      <Edit2 size={16} />
                    </button>
                    {confirmActionKey === `del-lesson-${lesson.id}` ? (
                      <div className="flex items-center gap-1 bg-red-50 border border-red-200 px-2 py-1 rounded-xl">
                        <span className="text-[11px] font-black text-red-800">Excluir?</span>
                        <button
                          onClick={async () => {
                            await contentStore.deleteLesson(lesson.id);
                            setConfirmActionKey(null);
                            loadAllData();
                            showNotification('Lição excluída com sucesso.');
                          }}
                          className="px-2 py-0.5 bg-red-600 text-white rounded-lg text-[10px] font-black cursor-pointer"
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => setConfirmActionKey(null)}
                          className="px-1.5 py-0.5 text-slate-600 text-[10px] font-bold cursor-pointer"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmActionKey(`del-lesson-${lesson.id}`)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title="Excluir lição"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Modal de Edição de Lição */}
          {editingLesson && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
                <button
                  onClick={() => setEditingLesson(null)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X size={20} />
                </button>

                <h3 className="text-lg font-black text-[#1a3c5a] mb-4">
                  {editingLesson.titulo.includes('Nova') ? 'Criar Nova Lição' : 'Editar Lição'}
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-1">
                        Tópico Oficial
                      </label>
                      <input
                        type="text"
                        value={editingLesson.topico}
                        onChange={(e) =>
                          setEditingLesson({ ...editingLesson, topico: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-1">
                        YouTube Video ID
                      </label>
                      <input
                        type="text"
                        value={editingLesson.youtubeVideoId || ''}
                        onChange={(e) =>
                          setEditingLesson({
                            ...editingLesson,
                            youtubeVideoId: e.target.value || undefined,
                          })
                        }
                        placeholder="Ex: ALHIyHtGHQs"
                        className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">
                      Título da Lição
                    </label>
                    <input
                      type="text"
                      value={editingLesson.titulo}
                      onChange={(e) =>
                        setEditingLesson({ ...editingLesson, titulo: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">
                      Resumo da Lição
                    </label>
                    <textarea
                      value={editingLesson.resumo}
                      onChange={(e) =>
                        setEditingLesson({ ...editingLesson, resumo: e.target.value })
                      }
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm font-medium"
                    />
                  </div>

                  {/* Editor de Blocos Modulares */}
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase text-slate-600">
                        Blocos de Conteúdo ({editingLesson.blocos.length})
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const newBlock: LessonBlock = {
                              id: `b_${Date.now()}`,
                              type: 'text',
                              title: 'Novo Tópico',
                              content: 'Texto explicativo do conceito...',
                            };
                            setEditingLesson({
                              ...editingLesson,
                              blocos: [...editingLesson.blocos, newBlock],
                            });
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          + Texto
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newBlock: LessonBlock = {
                              id: `b_${Date.now()}`,
                              type: 'fufu_tip',
                              title: 'Dica do Fufu 🎶',
                              content: 'Dica amigável do mascote para ajudar na memorização...',
                            };
                            setEditingLesson({
                              ...editingLesson,
                              blocos: [...editingLesson.blocos, newBlock],
                            });
                          }}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          + Dica Fufu
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newBlock: LessonBlock = {
                              id: `b_${Date.now()}`,
                              type: 'msa_rule',
                              title: 'Regra Oficial do MSA',
                              content: 'Texto formal ou observação oficial do livro do MSA...',
                            };
                            setEditingLesson({
                              ...editingLesson,
                              blocos: [...editingLesson.blocos, newBlock],
                            });
                          }}
                          className="px-2.5 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          + Regra MSA
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {editingLesson.blocos.map((bloco, bIdx) => (
                        <div
                          key={bloco.id || bIdx}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 relative"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                              {bloco.type}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = editingLesson.blocos.filter((_, i) => i !== bIdx);
                                setEditingLesson({ ...editingLesson, blocos: filtered });
                              }}
                              className="text-red-500 hover:text-red-700 cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <input
                            type="text"
                            value={bloco.title || ''}
                            onChange={(e) => {
                              const updatedBlocos = [...editingLesson.blocos];
                              updatedBlocos[bIdx].title = e.target.value;
                              setEditingLesson({ ...editingLesson, blocos: updatedBlocos });
                            }}
                            placeholder="Título do bloco (opcional)"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold mb-2 bg-white"
                          />

                          <textarea
                            value={bloco.content}
                            onChange={(e) => {
                              const updatedBlocos = [...editingLesson.blocos];
                              updatedBlocos[bIdx].content = e.target.value;
                              setEditingLesson({ ...editingLesson, blocos: updatedBlocos });
                            }}
                            rows={3}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEditingLesson(null)}
                      className="px-4 py-2 text-slate-500 font-bold text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await contentStore.saveLesson(editingLesson);
                        setEditingLesson(null);
                        loadAllData();
                        showNotification('Lição salva com sucesso!');
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow cursor-pointer"
                    >
                      <Save size={16} /> Salvar Lição
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 3: GESTOR DE QUESTÕES DO SIMULADO */}
      {activeTab === 'questions' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Barra de Filtros e Busca */}
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuestion}
                  onChange={(e) => setSearchQuestion(e.target.value)}
                  placeholder="Buscar questão ou ID..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={filterFaseQuestion}
                onChange={(e) => setFilterFaseQuestion(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              >
                <option value={0}>Todas as Fases</option>
                {Array.from({ length: 16 }, (_, i) => i + 1).map((f) => (
                  <option key={f} value={f}>
                    Fase {f}
                  </option>
                ))}
              </select>

              <select
                value={filterStatusQuestion}
                onChange={(e) => setFilterStatusQuestion(e.target.value as 'todos' | 'ativas' | 'inativas')}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              >
                <option value="todos">Status: Todos</option>
                <option value="ativas">Somente Ativas</option>
                <option value="inativas">Somente Inativas</option>
              </select>
            </div>

            <button
              onClick={() => {
                const targetFase = filterFaseQuestion === 0 ? 1 : filterFaseQuestion;
                const targetPeriodo = targetFase <= 3 ? 1 : targetFase <= 5 ? 2 : targetFase <= 9 ? 3 : 4;
                const newId = `f${String(targetFase).padStart(2, '0')}_q${Date.now().toString().slice(-3)}`;

                setEditingQuestion({
                  id: newId,
                  ativo: true,
                  dificuldade: 'facil',
                  pontos: 10,
                  tipo: 'texto',
                  pergunta: 'Pergunta sobre o MSA...',
                  imagemUrl: null,
                  audioUrl: null,
                  referencia: {
                    livro: 'MSA',
                    periodo: targetPeriodo,
                    fase: targetFase,
                    item: `${targetFase}.1 Tópico`,
                    pagina: 10,
                  },
                  opcoes: [
                    { texto: 'Alternativa correta', correta: true, feedback: 'Correto segundo o MSA!' },
                    { texto: 'Alternativa incorreta 1', correta: false, feedback: 'Incorreto.' },
                    { texto: 'Alternativa incorreta 2', correta: false, feedback: 'Incorreto.' },
                    { texto: 'Alternativa incorreta 3', correta: false, feedback: 'Incorreto.' },
                  ],
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#58cc02] hover:bg-[#46a302] text-white font-black text-xs rounded-xl shadow cursor-pointer whitespace-nowrap"
            >
              <Plus size={16} /> Nova Questão
            </button>
          </div>

          <div className="text-xs font-bold text-slate-500 px-1">
            Exibindo <strong>{filteredQuestions.length}</strong> de {questions.length} questões
          </div>

          {/* Tabela de Questões */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filteredQuestions.slice(0, 100).map((q) => (
                <div
                  key={q.id}
                  className="p-4 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {q.id}
                      </span>
                      <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        Fase {q.referencia?.fase ?? '?'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Pág. {q.referencia?.pagina ?? '?'} ({q.referencia?.item ?? '?'})
                      </span>
                      {q.ativo === false && (
                        <span className="text-[10px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded">
                          Inativa
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-800 leading-snug">{q.pergunta}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditingQuestion({ ...q })}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 size={13} /> Editar
                    </button>
                    {confirmActionKey === `del-q-${q.id}` ? (
                      <div className="flex items-center gap-1 bg-red-50 border border-red-200 px-2 py-1 rounded-xl">
                        <span className="text-[10px] font-black text-red-800">Excluir?</span>
                        <button
                          onClick={async () => {
                            await contentStore.deleteQuestion(q.id);
                            setConfirmActionKey(null);
                            loadAllData();
                            showNotification('Questão excluída.');
                          }}
                          className="px-2 py-0.5 bg-red-600 text-white rounded-lg text-[10px] font-black cursor-pointer"
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => setConfirmActionKey(null)}
                          className="px-1.5 py-0.5 text-slate-600 text-[10px] font-bold cursor-pointer"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmActionKey(`del-q-${q.id}`)}
                        className="p-1.5 text-red-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal de Edição de Questão */}
          {editingQuestion && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X size={20} />
                </button>

                <h3 className="text-lg font-black text-[#1a3c5a] mb-4">
                  Editar Questão: <span className="font-mono text-indigo-600">{editingQuestion.id}</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">
                      Enunciado da Pergunta
                    </label>
                    <textarea
                      value={editingQuestion.pergunta}
                      onChange={(e) =>
                        setEditingQuestion({ ...editingQuestion, pergunta: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-1">
                        Fase
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={16}
                        value={editingQuestion.referencia?.fase ?? 1}
                        onChange={(e) => {
                          const f = Number(e.target.value);
                          const p = f <= 3 ? 1 : f <= 5 ? 2 : f <= 9 ? 3 : 4;
                          setEditingQuestion({
                            ...editingQuestion,
                            referencia: { ...editingQuestion.referencia, fase: f, periodo: p },
                          });
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-1">
                        Página MSA
                      </label>
                      <input
                        type="number"
                        value={editingQuestion.referencia?.pagina ?? 1}
                        onChange={(e) =>
                          setEditingQuestion({
                            ...editingQuestion,
                            referencia: { ...editingQuestion.referencia, pagina: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-1">
                        Status
                      </label>
                      <select
                        value={editingQuestion.ativo ? 'true' : 'false'}
                        onChange={(e) =>
                          setEditingQuestion({
                            ...editingQuestion,
                            ativo: e.target.value === 'true',
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
                      >
                        <option value="true">Ativa no Simulado</option>
                        <option value="false">Inativa</option>
                      </select>
                    </div>
                  </div>

                  {/* As 4 Alternativas */}
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-xs font-black uppercase text-slate-600 block mb-3">
                      As 4 Alternativas (Selecione o botão da correta):
                    </span>

                    <div className="space-y-3">
                      {editingQuestion.opcoes.map((opcao, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-3.5 rounded-2xl border-2 transition-all ${
                            opcao.correta
                              ? 'bg-emerald-50/70 border-emerald-400'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="radio"
                              name="correta-radio"
                              checked={opcao.correta}
                              onChange={() => {
                                const updated = editingQuestion.opcoes.map((o, idx) => ({
                                  ...o,
                                  correta: idx === optIdx,
                                }));
                                setEditingQuestion({ ...editingQuestion, opcoes: updated });
                              }}
                              className="w-4 h-4 text-emerald-600 cursor-pointer"
                            />
                            <span className="text-xs font-black uppercase text-slate-700">
                              Opção {String.fromCharCode(65 + optIdx)}{' '}
                              {opcao.correta && <strong className="text-emerald-700">(Correta ✓)</strong>}
                            </span>
                          </div>

                          <input
                            type="text"
                            value={opcao.texto}
                            onChange={(e) => {
                              const updated = [...editingQuestion.opcoes];
                              updated[optIdx].texto = e.target.value;
                              setEditingQuestion({ ...editingQuestion, opcoes: updated });
                            }}
                            placeholder="Texto da alternativa..."
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium mb-1.5 bg-white"
                          />

                          <input
                            type="text"
                            value={opcao.feedback || ''}
                            onChange={(e) => {
                              const updated = [...editingQuestion.opcoes];
                              updated[optIdx].feedback = e.target.value;
                              setEditingQuestion({ ...editingQuestion, opcoes: updated });
                            }}
                            placeholder="Feedback pedagógico explicando o porquê do acerto/erro..."
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEditingQuestion(null)}
                      className="px-4 py-2 text-slate-500 font-bold text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await contentStore.saveQuestion(editingQuestion);
                        setEditingQuestion(null);
                        loadAllData();
                        showNotification('Questão salva com sucesso!');
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#58cc02] hover:bg-[#46a302] text-white font-black text-xs rounded-xl shadow cursor-pointer"
                    >
                      <Save size={16} /> Salvar Questão
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 4: CENTRAL DE FEEDBACKS */}
      {activeTab === 'feedbacks' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border-2 border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-slate-500">Filtrar Status:</span>
              <select
                value={filterFeedbackStatus}
                onChange={(e) => setFilterFeedbackStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold"
              >
                <option value="todos">Todos</option>
                <option value="pendente">Pendentes</option>
                <option value="em_analise">Em Análise</option>
                <option value="resolvido">Resolvidos</option>
              </select>
            </div>

            <button
              onClick={handleExportFeedbacksCsv}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl shadow cursor-pointer"
            >
              <FileSpreadsheet size={16} /> Exportar Planilha (CSV)
            </button>
          </div>

          <div className="space-y-3">
            {feedbacks
              .filter((f) => filterFeedbackStatus === 'todos' || f.status === filterFeedbackStatus)
              .map((fb) => (
                <div
                  key={fb.id}
                  className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        Questão: {fb.question_id}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          fb.status === 'resolvido'
                            ? 'bg-emerald-100 text-emerald-800'
                            : fb.status === 'em_analise'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {fb.status}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(fb.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-800 mb-1">{fb.reason}</h4>
                    {fb.comment && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 mb-2 font-medium">
                        &quot;{fb.comment}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const target = questions.find((q) => q.id === fb.question_id);
                        if (target) {
                          setActiveTab('questions');
                          setEditingQuestion(target);
                        } else {
                          showNotification(`⚠️ Questão ${fb.question_id} não encontrada no banco.`);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow cursor-pointer"
                    >
                      <Edit2 size={13} /> Corrigir Questão
                    </button>

                    {fb.status !== 'resolvido' && (
                      <button
                        onClick={async () => {
                          await contentStore.updateFeedbackStatus(fb.id, 'resolvido');
                          loadAllData();
                          showNotification('Feedback marcado como Resolvido!');
                        }}
                        className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black text-xs rounded-xl border border-emerald-300 cursor-pointer"
                      >
                        Marcar Resolvido ✓
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ABA 5: CONFIGURAÇÕES DO JOGO */}
      {activeTab === 'game' && siteConfig && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-slate-200 shadow-sm max-w-2xl animate-in fade-in">
          <h2 className="text-lg font-black text-[#1a3c5a] mb-4">
            Parâmetros do Mestre da Clave
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                Velocidade Base da Pauta (Pixels/Segundo)
              </label>
              <input
                type="number"
                value={siteConfig.gameConfig.baseSpeed}
                onChange={(e) =>
                  setSiteConfig({
                    ...siteConfig,
                    gameConfig: { ...siteConfig.gameConfig, baseSpeed: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                Vidas Iniciais do Jogador
              </label>
              <input
                type="number"
                value={siteConfig.gameConfig.initialLives}
                onChange={(e) =>
                  setSiteConfig({
                    ...siteConfig,
                    gameConfig: { ...siteConfig.gameConfig, initialLives: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                Acertos por Nível (XP)
              </label>
              <input
                type="number"
                value={siteConfig.gameConfig.xpPerLevel}
                onChange={(e) =>
                  setSiteConfig({
                    ...siteConfig,
                    gameConfig: { ...siteConfig.gameConfig, xpPerLevel: Number(e.target.value) },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>

            <button
              onClick={async () => {
                await contentStore.saveSiteConfig(siteConfig);
                showNotification('✔ Parâmetros do jogo salvos com sucesso!');
              }}
              className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-[#1cb0f6] hover:bg-sky-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer"
            >
              <Save size={16} /> Salvar Parâmetros do Jogo
            </button>
          </div>
        </div>
      )}

      {/* ABA 6: TEXTOS & BANNERS DO SITE */}
      {activeTab === 'site' && siteConfig && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border-2 border-slate-200 shadow-sm max-w-2xl animate-in fade-in">
          <h2 className="text-lg font-black text-[#1a3c5a] mb-4">
            Textos Principais, Links e Banner Global
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                Título Principal da Home
              </label>
              <input
                type="text"
                value={siteConfig.heroTitle}
                onChange={(e) => setSiteConfig({ ...siteConfig, heroTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                Subtítulo da Home
              </label>
              <textarea
                value={siteConfig.heroSubtitle}
                onChange={(e) => setSiteConfig({ ...siteConfig, heroSubtitle: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                Fala de Boas-Vindas do Mascote Fufu
              </label>
              <textarea
                value={siteConfig.fufuWelcomeText}
                onChange={(e) => setSiteConfig({ ...siteConfig, fufuWelcomeText: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-600 uppercase mb-1">
                Link do Canal Oficial do YouTube
              </label>
              <input
                type="text"
                value={siteConfig.youtubeUrl}
                onChange={(e) => setSiteConfig({ ...siteConfig, youtubeUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="flex items-center gap-2 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteConfig.announcementBanner?.enabled || false}
                  onChange={(e) =>
                    setSiteConfig({
                      ...siteConfig,
                      announcementBanner: {
                        enabled: e.target.checked,
                        text: siteConfig.announcementBanner?.text || 'Aviso importante aos alunos!',
                        linkUrl: siteConfig.announcementBanner?.linkUrl || '/#/aulas',
                        linkText: 'Ver mais →',
                      },
                    })
                  }
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
                <span className="text-xs font-black uppercase text-slate-800">
                  Ativar Banner de Aviso Global no Topo do Site
                </span>
              </label>

              {siteConfig.announcementBanner?.enabled && (
                <div className="space-y-2 mt-2">
                  <input
                    type="text"
                    value={siteConfig.announcementBanner.text}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        announcementBanner: { ...siteConfig.announcementBanner!, text: e.target.value },
                      })
                    }
                    placeholder="Texto do aviso..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                  />
                  <input
                    type="text"
                    value={siteConfig.announcementBanner.linkUrl || ''}
                    onChange={(e) =>
                      setSiteConfig({
                        ...siteConfig,
                        announcementBanner: { ...siteConfig.announcementBanner!, linkUrl: e.target.value },
                      })
                    }
                    placeholder="Link de destino (ex: /#/aulas)..."
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                  />
                </div>
              )}
            </div>

            <button
              onClick={async () => {
                await contentStore.saveSiteConfig(siteConfig);
                showNotification('✔ Textos e configurações globais salvos!');
              }}
              className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer"
            >
              <Save size={16} /> Salvar Textos do Site
            </button>
          </div>
        </div>
      )}

      {/* ABA: PARTITURAS & HINÁRIO (CATÁLOGO MUSICXML) */}
      {activeTab === 'scores' && (
        <div className="space-y-6 animate-in fade-in" data-testid="admin-scores-panel">
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={scoreSearch}
                  onChange={(e) => setScoreSearch(e.target.value)}
                  placeholder="Buscar lição do MSA ou hino..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={scoreCollectionFilter}
                onChange={(e) =>
                  setScoreCollectionFilter(e.target.value as 'all' | 'msa' | 'hinario5')
                }
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              >
                <option value="all">Todas as Coleções ({catalogScores.length})</option>
                <option value="msa">
                  MSA — Lições ({catalogScores.filter((s) => s.collection === 'msa').length})
                </option>
                <option value="hinario5">
                  Hinário 5 CCB ({catalogScores.filter((s) => s.collection === 'hinario5').length})
                </option>
              </select>

              {hiddenScoresCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const restored = restoreHiddenFactoryScoresInStorage();
                    setCatalogScores(restored);
                    setHiddenScoresCount(0);
                    showNotification('✔ Partituras de fábrica restauradas ao catálogo!');
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={14} /> Restaurar {hiddenScoresCount} oculta(s)
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate('/partituras')}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-amber-400 font-black text-xs rounded-xl shadow cursor-pointer whitespace-nowrap"
            >
              <ExternalLink size={15} /> Abrir Estúdio de Partituras
            </button>
          </div>

          {/* Lista de Partituras e Hinos */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {catalogScores
                .filter((s) => {
                  if (scoreCollectionFilter !== 'all' && s.collection !== scoreCollectionFilter)
                    return false;
                  if (scoreSearch.trim()) {
                    const q = scoreSearch.toLowerCase();
                    return (
                      s.title.toLowerCase().includes(q) ||
                      s.id.toLowerCase().includes(q) ||
                      String(s.number) === q
                    );
                  }
                  return true;
                })
                .map((score) => {
                  const isMsaSolfejo =
                    score.collection === 'msa' && score.msaPhase === 'solfejo';
                  const delScoreKey = `del-score-${score.id}`;

                  return (
                    <div
                      key={score.id}
                      className="p-4 hover:bg-slate-50 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              score.collection === 'msa'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {score.collection === 'msa'
                              ? `MSA · Lição ${score.number}`
                              : `Hino ${score.number}${
                                  score.edition
                                    ? ` · ${HYMNAL_EDITION_SHORT_LABELS[score.edition]}`
                                    : ''
                                }`}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {score.timeSignature} · ♩ = {score.defaultBpm}
                          </span>
                          {score.hasAdminOverride && (
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              Personalizada
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-black text-slate-800 truncate">
                          {score.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                        {/* Cobertura de Claves para Solfejo MSA */}
                        {isMsaSolfejo &&
                          MSA_OFFICIAL_CLEFS.map((clefOpt) => {
                            const hasXml = Boolean(
                              score.xmlByClef?.[clefOpt.value] ||
                                (clefOpt.value === 'sol' && score.xml)
                            );
                            return (
                              <button
                                key={clefOpt.value}
                                type="button"
                                onClick={() => {
                                  setPendingXmlTarget({
                                    scoreId: score.id,
                                    clef: clefOpt.value,
                                  });
                                  scoreXmlInputRef.current?.click();
                                }}
                                title={`Substituir MusicXML (${clefOpt.label})`}
                                className={`px-2 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                                  hasXml
                                    ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                                    : 'bg-slate-50 border-dashed border-slate-300 text-slate-400'
                                }`}
                              >
                                <span>{clefOpt.shortLabel}</span>
                                <Upload size={11} />
                              </button>
                            );
                          })}

                        {!isMsaSolfejo && (
                          <button
                            type="button"
                            onClick={() => {
                              setPendingXmlTarget({ scoreId: score.id });
                              scoreXmlInputRef.current?.click();
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                            title="Substituir arquivo MusicXML"
                          >
                            <Upload size={13} /> MusicXML
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setEditingScoreMeta({ ...score })}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                          title="Editar metadados (título, número, compasso e BPM)"
                        >
                          <Edit2 size={13} /> Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => downloadScoreMusicXmlFile(score)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer"
                          title="Baixar arquivo .musicxml"
                        >
                          <Download size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`/partituras?scoreId=${score.id}`)}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                          title="Abrir esta partitura no Estúdio Interativo"
                        >
                          <ExternalLink size={13} /> Abrir
                        </button>

                        {score.hasAdminOverride && !score.isCustomCreated && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = restoreDefaultScoreInStorage(
                                catalogScores,
                                score.id
                              );
                              setCatalogScores(next);
                              showNotification(
                                `✔ Padrão de "${score.title}" restaurado!`
                              );
                            }}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-xl cursor-pointer"
                            title="Restaurar MusicXML padrão de fábrica"
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}

                        {confirmActionKey === delScoreKey ? (
                          <div className="flex items-center gap-1 bg-red-50 border border-red-200 px-2 py-1 rounded-xl">
                            <span className="text-[10px] font-black text-red-800">
                              Excluir?
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const next = deleteScoreFromStorage(
                                  catalogScores,
                                  score.id
                                );
                                setCatalogScores(next);
                                setHiddenScoresCount(loadHiddenPresetIds().length);
                                setConfirmActionKey(null);
                                showNotification(`"${score.title}" removida.`);
                              }}
                              className="px-2 py-0.5 bg-red-600 text-white rounded-lg text-[10px] font-black cursor-pointer"
                            >
                              Sim
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmActionKey(null)}
                              className="px-1.5 py-0.5 text-slate-600 text-[10px] font-bold cursor-pointer"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmActionKey(delScoreKey)}
                            className="p-1.5 text-red-400 hover:text-red-600 cursor-pointer"
                            title="Excluir partitura"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Modal de Edição de Metadados da Partitura */}
          {editingScoreMeta && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 max-w-lg w-full p-6 relative">
                <button
                  type="button"
                  onClick={() => setEditingScoreMeta(null)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X size={20} />
                </button>

                <h3 className="text-lg font-black text-[#1a3c5a] mb-4">
                  Editar Metadados da Partitura
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">
                      Título da Obra
                    </label>
                    <input
                      type="text"
                      value={editingScoreMeta.title}
                      onChange={(e) =>
                        setEditingScoreMeta({
                          ...editingScoreMeta,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-1">
                        {editingScoreMeta.collection === 'msa' ? 'Nº Lição' : 'Nº Hino'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={480}
                        value={editingScoreMeta.number}
                        onChange={(e) =>
                          setEditingScoreMeta({
                            ...editingScoreMeta,
                            number: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-1">
                        Compasso
                      </label>
                      <select
                        value={editingScoreMeta.timeSignature}
                        onChange={(e) =>
                          setEditingScoreMeta({
                            ...editingScoreMeta,
                            timeSignature: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm font-mono font-bold"
                      >
                        <option value="4/4">4/4</option>
                        <option value="3/4">3/4</option>
                        <option value="2/4">2/4</option>
                        <option value="6/8">6/8</option>
                        <option value="9/8">9/8</option>
                        <option value="12/8">12/8</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-1">
                        BPM (♩)
                      </label>
                      <input
                        type="number"
                        min={30}
                        max={240}
                        value={editingScoreMeta.defaultBpm}
                        onChange={(e) =>
                          setEditingScoreMeta({
                            ...editingScoreMeta,
                            defaultBpm: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 text-sm font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEditingScoreMeta(null)}
                      className="px-4 py-2 text-slate-500 font-bold text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = updateScoreMetadataInStorage(
                          catalogScores,
                          editingScoreMeta.id,
                          {
                            title: editingScoreMeta.title,
                            number: editingScoreMeta.number,
                            timeSignature: editingScoreMeta.timeSignature,
                            defaultBpm: editingScoreMeta.defaultBpm,
                          }
                        );
                        setCatalogScores(next);
                        setEditingScoreMeta(null);
                        showNotification('✔ Metadados da partitura salvos!');
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#1a3c5a] hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow cursor-pointer"
                    >
                      <Save size={16} /> Salvar Alterações
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

