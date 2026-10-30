import React, { useState, useEffect } from 'react';
import { ChevronRight, BookOpen, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAssetUrl } from '../../core/utils/paths';
import { useAdmin } from '../../core/contexts/AdminContext';
import { contentStore, SiteConfig } from '../../core/services/contentStore';

interface WelcomeHomeProps {
  onNavigate?: (view: 'home' | 'partituras' | 'mestre_da_clave' | 'simulado_msa') => void;
}

export const WelcomeHome: React.FC<WelcomeHomeProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { isAdmin, mode, openEditTarget } = useAdmin();
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const showPartituras = Boolean(import.meta.env.DEV);

  useEffect(() => {
    contentStore.getSiteConfig().then((cfg) => setSiteConfig(cfg));
  }, []);

  const handleNav = (view: 'home' | 'partituras' | 'mestre_da_clave' | 'simulado_msa') => {
    if (onNavigate) {
      onNavigate(view);
      return;
    }
    const routes: Record<string, string> = {
      home: '/',
      mestre_da_clave: '/mestre-da-clave',
      simulado_msa: '/simulado',
      partituras: '/partituras',
    };
    navigate(routes[view] || '/');
  };

  return (
    <div className="flex-1 flex flex-col w-full bg-white animate-fade" id="primary-site-home">
      {/* Mascot welcoming banner */}
      <div className="max-w-2xl mx-auto w-full px-6 py-8 flex items-center gap-5 border-b border-slate-100 welcome-section relative">
        <img
          src={getAssetUrl('assets/fufu-capa-home-pagge.png')}
          alt="Mascote Fufu da Issa Academy"
          className="w-[120px] md:w-[130px] h-auto object-contain animate-float drop-shadow-md saturate-[1.1]"
        />
        <div className="welcome-text flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">
              Olá! Eu sou o Fufu!
            </h2>
            {isAdmin && mode === 'edicao' && (
              <button
                onClick={() =>
                  openEditTarget({
                    type: 'site_text',
                    key: 'fufuWelcomeText',
                  })
                }
                className="px-2 py-0.5 bg-amber-400 text-slate-900 rounded text-[10px] font-black hover:bg-amber-300 cursor-pointer"
                title="Editar fala do Fufu"
              >
                <Edit3 size={12} className="inline mr-1" /> Editar
              </button>
            )}
          </div>
          <p className="text-sm md:text-base text-slate-500 font-extrabold mt-1 leading-relaxed">
            {siteConfig?.fufuWelcomeText || 'O que vamos praticar hoje? Escolha uma atividade abaixo:'}
          </p>
        </div>
      </div>

      {/* Main grid containing the 4 cards: Aulas MSA, Partituras & Hinário, Mestre da Clave e Simulado MSA */}
      <main
        className={`flex-1 mx-auto w-full px-6 py-8 grid gap-5 ${
          showPartituras
            ? 'max-w-xl md:max-w-4xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'max-w-xl md:max-w-3xl grid-cols-1 sm:grid-cols-2'
        }`}
      >

        {/* CARD 2: ESTÚDIO DE PARTITURAS & HINÁRIO 5 */}
        {showPartituras && (
          <button id="card-nav-partituras"
          onClick={() => handleNav('partituras')}
          className="w-full text-left bg-[#f7f9fa] border-2 border-slate-200 rounded-3xl p-5 flex flex-col justify-between hover:border-amber-500 hover:bg-amber-50/20 active:scale-[0.98] transition-all cursor-pointer relative group shadow-sm min-h-[170px]"
        >
          <div className="flex items-start justify-between w-full">
            <div className="w-[60px] h-[60px] rounded-2xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/20 overflow-visible shrink-0">
              <img
                src={getAssetUrl('assets/fufu-violino.png')}
                alt="Fufu Estúdio de Partituras"
                className="w-full h-full object-contain transform scale-[1.35] -translate-y-1 drop-shadow-md"
              />
            </div>
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Estúdio
            </span>
          </div>

          <div className="mt-3 flex-1">
            <div className="text-base font-black text-slate-800 flex items-center justify-between">
              <span>Partituras & Hinário</span>
              <ChevronRight
                size={18}
                className="text-slate-300 group-hover:text-amber-600 transition-colors shrink-0"
              />
            </div>
            <div className="text-xs text-slate-500 font-bold mt-1 line-clamp-2">
              Solfejo interativo do MSA e Hinário 5 CCB com piano didático
            </div>
          </div>
        </button>
        )}

        {/* CARD 2: MESTRE DA CLAVE */}
        <button
          id="card-nav-mestre"
          onClick={() => handleNav('mestre_da_clave')}
          className="w-full text-left bg-[#f7f9fa] border-2 border-slate-200 rounded-3xl p-5 flex flex-col justify-between hover:border-sky-400 hover:bg-sky-50/20 active:scale-[0.98] transition-all cursor-pointer relative group shadow-sm min-h-[170px]"
        >
          <div className="flex items-start justify-between w-full">
            <div className="w-[60px] h-[60px] rounded-2xl bg-[#1cb0f6] flex items-center justify-center shadow-md shadow-sky-500/20 overflow-visible shrink-0">
              <img
                src={getAssetUrl('assets/fufu-capa-mestre-da-clave.png')}
                alt="Fufu Mestre da Clave"
                className="w-full h-full object-contain transform scale-[1.4] -translate-y-1 drop-shadow-md"
              />
            </div>
            <span className="bg-[#1cb0f6] text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Jogo
            </span>
          </div>

          <div className="mt-3 flex-1">
            <div className="text-base font-black text-slate-800 flex items-center justify-between">
              <span>Mestre da Clave</span>
              <ChevronRight
                size={18}
                className="text-slate-300 group-hover:text-sky-500 transition-colors shrink-0"
              />
            </div>
            <div className="text-xs text-slate-500 font-bold mt-1 line-clamp-2">
              Leitura rápida na pauta e reflexo musical nas 3 Claves
            </div>
          </div>
        </button>

        {/* CARD 3: SIMULADO MSA */}
        <button
          id="card-nav-simulado"
          onClick={() => handleNav('simulado_msa')}
          className="w-full text-left bg-[#f7f9fa] border-2 border-slate-200 rounded-3xl p-5 flex flex-col justify-between hover:border-emerald-400 hover:bg-emerald-50/20 active:scale-[0.98] transition-all cursor-pointer relative group shadow-sm min-h-[170px]"
        >
          <div className="flex items-start justify-between w-full">
            <div className="w-[60px] h-[60px] rounded-2xl bg-[#58cc02] flex items-center justify-center shadow-md shadow-emerald-500/20 overflow-visible shrink-0">
              <img
                src={getAssetUrl('assets/fufu-capa-simulado.png')}
                alt="Fufu Simulado MSA"
                className="w-full h-full object-contain transform scale-[1.4] -translate-y-1 drop-shadow-md"
              />
            </div>
            <span className="bg-[#58cc02] text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Oficial
            </span>
          </div>

          <div className="mt-3 flex-1">
            <div className="text-base font-black text-slate-800 flex items-center justify-between">
              <span>Simulado MSA</span>
              <ChevronRight
                size={18}
                className="text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0"
              />
            </div>
            <div className="text-xs text-slate-500 font-bold mt-1 line-clamp-2">
              552 questões reais com gabarito, cronômetro e dual-mode
            </div>
          </div>
        </button>
      </main>

      {/* SEO Paragraph */}
      <section className="text-center px-6 py-6 max-w-2xl mx-auto w-full">
        <p className="text-xs text-slate-400 font-bold leading-relaxed">
          {siteConfig?.heroSubtitle ||
            'Plataforma de ensino musical 100% gratuita, desenvolvida para auxiliar candidatos a músicos e organistas da CCB. Prepare-se para o Teste de Oficialização com o Simulado MSA e treine a leitura rápida de notas com o jogo Mestre da Clave. Feito com muito carinho para a orquestra!'}
        </p>
      </section>

      {/* Footer with accessible touch targets and clean contrast */}
      <footer className="text-center p-6 border-t border-slate-100 text-slate-500 font-extrabold text-xs flex flex-col gap-3">
        <span>Feito com ❤️ por Issacar Barbosa - Brasil 🇧🇷</span>
        <div className="flex justify-center items-center gap-3">
          <a
            href="https://www.instagram.com/issacarbarbosa"
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors shadow-xs"
            title="Instagram"
            aria-label="Instagram"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
          <a
            href="https://www.facebook.com/issacarbarbosa"
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors shadow-xs"
            title="Facebook"
            aria-label="Facebook"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.6 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z" />
            </svg>
          </a>
          <a
            href={siteConfig?.youtubeUrl || 'https://www.youtube.com/@issacarbarbosa'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-600 transition-colors shadow-xs"
            title="YouTube"
            aria-label="YouTube"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
};
