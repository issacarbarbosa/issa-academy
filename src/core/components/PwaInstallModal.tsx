import React from 'react';
import { Smartphone, X, MoreVertical, Share2, PlusSquare, Zap } from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkInstalled?: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  onMarkInstalled,
}) => {
  if (!isOpen) return null;

  const isIos =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const handleDone = () => {
    if (onMarkInstalled) {
      onMarkInstalled();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-5 relative animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Fechar modal"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1a3c5a] to-[#2563eb] flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Smartphone size={26} />
          </div>
          <div>
            <h2 id="pwa-install-title" className="text-lg font-black text-slate-800 leading-tight">
              Instalar Aplicativo
            </h2>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              Oculte a barra do navegador e tenha tela cheia nativa
            </p>
          </div>
        </div>

        {isIos ? (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3 text-xs text-slate-700">
            <p className="font-extrabold text-slate-900">
              No Safari (iPhone / iPad), siga estes 2 passos:
            </p>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center shrink-0">
                1
              </span>
              <span>
                Toque no botão <strong>Compartilhar</strong> (<Share2 size={14} className="inline text-blue-600" />) na barra inferior do Safari.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center shrink-0">
                2
              </span>
              <span>
                Role para baixo e selecione <strong>Adicionar à Tela de Início</strong> (<PlusSquare size={14} className="inline text-slate-700" />).
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-3 text-xs text-slate-700">
            <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <Zap size={14} className="text-amber-500" /> Criação Instantânea do Atalho:
            </p>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center shrink-0">
                1
              </span>
              <span>
                Toque nos <strong>3 pontinhos</strong> (<MoreVertical size={14} className="inline text-slate-700" />) no canto superior direito do Chrome.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center shrink-0">
                2
              </span>
              <span>
                Toque em <strong>"Adicionar à tela inicial"</strong> (ou <strong>"Instalar aplicativo"</strong>).
              </span>
            </div>
            <p className="text-[11px] text-slate-500 italic mt-1">
              💡 O atalho será adicionado à sua tela de início e abrirá direto em tela cheia sem a barra de navegação!
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={handleDone}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            Entendi, vou adicionar
          </button>
        </div>
      </div>
    </div>
  );
};
