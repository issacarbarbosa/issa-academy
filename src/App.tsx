import React, { useState, useEffect, Suspense } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { stopAllNotes } from './core/utils/audio';
import { OrientationGuard } from './core/components/OrientationGuard';
import { AdminProvider, useAdmin } from './core/contexts/AdminContext';
import { AdminFloatingBar } from './core/components/AdminFloatingBar';
import { QuickEditModal } from './core/components/QuickEditModal';
import { contentStore, SiteConfig } from './core/services/contentStore';
import { GraduationCap, ArrowLeft, Youtube, Bell, Lock, Smartphone } from 'lucide-react';
import { usePwaInstall } from './core/hooks/usePwaInstall';
import { PwaInstallModal } from './core/components/PwaInstallModal';

// Helper para recuperar automaticamente de falhas transitórias de importação dinâmica (ex.: durante restart do servidor Vite ou oscilação de rede mobile)
async function retryDynamicImport<T>(
  factory: () => Promise<T>,
  retries = 3,
  intervalMs = 600,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await factory();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }
  }
  throw lastError;
}

// Code Splitting via React.lazy com auto-retry e Suspense
const WelcomeHome = React.lazy(() =>
  retryDynamicImport(() =>
    import('./modules/home/WelcomeHome').then((m) => ({ default: m.WelcomeHome })),
  ),
);
const MestreDaClave = React.lazy(() =>
  retryDynamicImport(() =>
    import('./modules/mestre-da-clave/MestreDaClave').then((m) => ({ default: m.MestreDaClave })),
  ),
);
const SimuladoMsa = React.lazy(() =>
  retryDynamicImport(() =>
    import('./modules/simulado/SimuladoMsa').then((m) => ({ default: m.SimuladoMsa })),
  ),
);
const AdminDashboard = React.lazy(() =>
  retryDynamicImport(() =>
    import('./modules/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
  ),
);
const PartiturasStudio = React.lazy(() =>
  retryDynamicImport(() => import('./modules/partituras/PartiturasStudio')),
);

function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, mode, openEditTarget, isAuthReady, canAccessPartituras } = useAdmin();
  const { canInstall, installApp, showInstructionsModal, closeInstructionsModal } = usePwaInstall();

  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);

  const loadConfig = () => {
    contentStore.getSiteConfig().then((cfg) => setSiteConfig(cfg));
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Para todo áudio ativo na troca de rotas
  useEffect(() => {
    stopAllNotes();
  }, [location.pathname]);

  // Atalho global de teclado: Ctrl + Shift + A (ou Cmd + Shift + A) para abrir o Painel Admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigate('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const isMestreDaClave = location.pathname === '/mestre-da-clave';
  const isPartituras = location.pathname === '/partituras';
  const isImmersiveModule = isMestreDaClave || isPartituras;
  const isHome = location.pathname === '/';
  const isAdminRoute = location.pathname === '/admin';

  return (
    <div
      className={`bg-[#ffffff] text-slate-700 flex flex-col font-sans ${
        isMestreDaClave ? 'h-screen overflow-hidden' : 'min-h-screen'
      }`}
      id="app-root"
    >
      {/* ==================== BANNER DE ANÚNCIO GLOBAL ==================== */}
      {!isImmersiveModule && siteConfig?.announcementBanner?.enabled && (
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 text-white px-4 py-2 text-xs font-black flex items-center justify-center gap-2 text-center shadow-inner relative z-50">
          <Bell size={14} className="text-amber-300 shrink-0" />
          <span>{siteConfig.announcementBanner.text}</span>
          {siteConfig.announcementBanner.linkUrl && (
            <button
              onClick={() => {
                const url = siteConfig.announcementBanner?.linkUrl;
                if (!url) return;
                if (url.startsWith('/')) {
                  navigate(url.replace('/#', ''));
                } else if (/^https?:\/\//i.test(url)) {
                  window.open(url, '_blank', 'noopener,noreferrer');
                }
              }}
              className="ml-1 underline font-black hover:text-amber-300 cursor-pointer text-xs"
            >
              {siteConfig.announcementBanner.linkText || 'Ver mais →'}
            </button>
          )}

          {isAdmin && mode === 'edicao' && (
            <button
              onClick={() => openEditTarget({ type: 'announcement' })}
              className="ml-3 px-2 py-0.5 bg-amber-400 text-slate-900 rounded text-[10px] font-black hover:bg-amber-300 cursor-pointer"
            >
              ✏️ Editar Banner
            </button>
          )}
        </div>
      )}

      {/* ==================== GLOBAL APP HEADER ==================== */}
      {!isImmersiveModule && (
        <header className="h-[70px] border-b-2 border-slate-200 bg-white flex items-center justify-between px-6 md:px-8 sticky top-0 z-40 shadow-sm">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 text-left text-decoration-none bg-transparent border-0 cursor-pointer p-0"
          >
            <div className="w-10 h-10 bg-[#1a3c5a] rounded-xl flex items-center justify-center shadow-md shadow-slate-300">
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black tracking-tight text-[#1a3c5a] leading-none">
                Issa Academy
              </h1>
              <p className="text-[10px] text-amber-600 uppercase tracking-widest font-black mt-0.5">
                Ensino Musical de Excelência
              </p>
            </div>
          </button>

          {/* Header Actions */}
          <div className="flex items-center gap-2.5">
            {canInstall && (
              <button
                type="button"
                onClick={installApp}
                className="flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white border-b-4 border-emerald-800 active:border-b-0 active:translate-y-0.5 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer animate-pulse"
                title="Instalar aplicativo na tela inicial do celular"
              >
                <Smartphone size={16} /> Instalar App
              </button>
            )}
            {!isHome && (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 bg-[#f7f9fa] hover:bg-slate-100 text-slate-600 border-2 border-slate-200 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm active:translate-y-0.5"
              >
                <ArrowLeft size={16} /> Voltar
              </button>
            )}

            <a
              href={siteConfig?.youtubeUrl || 'https://www.youtube.com/@issacarbarbosa'}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 min-h-[44px] px-4 py-2 bg-red-600 hover:bg-red-700 text-white border-b-4 border-red-800 active:border-b-0 active:translate-y-0.5 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
            >
              <Youtube size={16} fill="currentColor" /> Canal Oficial
            </a>
          </div>
        </header>
      )}

      {/* ==================== MAIN RENDER WORKSPACE ==================== */}
      <div className="flex-1 flex flex-col w-full relative">
        <Suspense
          fallback={
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 font-extrabold text-sm gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
              <span>Carregando ambiente musical...</span>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<WelcomeHome />} />
            <Route
              path="/partituras"
              element={
                !isAuthReady ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 font-extrabold text-sm gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                    <span>Carregando ambiente musical...</span>
                  </div>
                ) : canAccessPartituras ? (
                  <PartiturasStudio />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/mestre-da-clave"
              element={
                <OrientationGuard>
                  <MestreDaClave />
                </OrientationGuard>
              }
            />
            <Route path="/simulado" element={<SimuladoMsa />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<WelcomeHome />} />
          </Routes>
        </Suspense>
      </div>

      {/* ==================== BOTTOM STATUS BAR ==================== */}
      {!isPartituras && (
        <footer className="h-10 bg-[#1a3c5a] flex items-center justify-between px-6 text-[10px] font-black text-slate-300 uppercase tracking-widest shrink-0 shadow">
          <div className="flex items-center gap-2">
            <span>{siteConfig?.footerText || 'Issa Academy • Mestre da Clave & Simulado MSA'}</span>
            {/* Acesso discreto ao Admin via cadeado no rodapé */}
            {!isAdminRoute && (
              <button
                onClick={() => navigate('/admin')}
                className="opacity-40 hover:opacity-100 transition-opacity p-0.5 text-slate-300 cursor-pointer"
                title="Acesso de Administrador (Ctrl+Shift+A)"
              >
                <Lock size={11} />
              </button>
            )}
          </div>
          <div className="flex gap-4">
            <span className="hidden md:inline">CCB • Método de Teoria e Solfejo</span>
            <span className="hidden md:inline opacity-50">|</span>
            <span>Nível: Digital</span>
          </div>
        </footer>
      )}

      {/* Barra Flutuante de Administração e Modal de Edição Rápida */}
      {!isImmersiveModule && <AdminFloatingBar />}
      <QuickEditModal onUpdated={loadConfig} />
      <PwaInstallModal
        isOpen={showInstructionsModal}
        onClose={closeInstructionsModal}
      />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AdminProvider>
        <MainLayout />
      </AdminProvider>
    </HashRouter>
  );
}
