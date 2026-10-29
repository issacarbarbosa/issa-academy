import React, { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { contentStore, SiteConfig } from '../services/contentStore';
import { X, Save, CheckCircle2 } from 'lucide-react';

export const QuickEditModal: React.FC<{ onUpdated?: () => void }> = ({ onUpdated }) => {
  const { activeEditTarget, closeEditTarget } = useAdmin();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [fieldValue, setFieldValue] = useState<string>('');
  const [secondaryValue, setSecondaryValue] = useState<string>('');
  const [bannerEnabled, setBannerEnabled] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (activeEditTarget) {
      contentStore.getSiteConfig().then((cfg) => {
        setConfig(cfg);
        if (activeEditTarget.type === 'site_text') {
          if (activeEditTarget.key === 'heroTitle') setFieldValue(cfg.heroTitle);
          if (activeEditTarget.key === 'heroSubtitle') setFieldValue(cfg.heroSubtitle);
          if (activeEditTarget.key === 'fufuWelcomeText') setFieldValue(cfg.fufuWelcomeText);
          if (activeEditTarget.key === 'footerText') setFieldValue(cfg.footerText);
          if (activeEditTarget.key === 'youtubeUrl') setFieldValue(cfg.youtubeUrl);
        } else if (activeEditTarget.type === 'announcement') {
          setBannerEnabled(cfg.announcementBanner?.enabled || false);
          setFieldValue(cfg.announcementBanner?.text || '');
          setSecondaryValue(cfg.announcementBanner?.linkUrl || '');
        }
      });
      setSavedSuccess(false);
    }
  }, [activeEditTarget]);

  if (!activeEditTarget || !config) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated = { ...config };
    if (activeEditTarget.type === 'site_text') {
      if (activeEditTarget.key === 'heroTitle') updated.heroTitle = fieldValue;
      if (activeEditTarget.key === 'heroSubtitle') updated.heroSubtitle = fieldValue;
      if (activeEditTarget.key === 'fufuWelcomeText') updated.fufuWelcomeText = fieldValue;
      if (activeEditTarget.key === 'footerText') updated.footerText = fieldValue;
      if (activeEditTarget.key === 'youtubeUrl') updated.youtubeUrl = fieldValue;
    } else if (activeEditTarget.type === 'announcement') {
      updated.announcementBanner = {
        enabled: bannerEnabled,
        text: fieldValue,
        linkUrl: secondaryValue || undefined,
        linkText: 'Saiba mais →',
      };
    }

    await contentStore.saveSiteConfig(updated);
    setIsSaving(false);
    setSavedSuccess(true);
    if (onUpdated) onUpdated();

    setTimeout(() => {
      closeEditTarget();
    }, 600);
  };

  const getTitle = () => {
    if (activeEditTarget.type === 'announcement') return 'Editar Banner de Aviso Global';
    if (activeEditTarget.key === 'heroTitle') return 'Editar Título Principal da Home';
    if (activeEditTarget.key === 'heroSubtitle') return 'Editar Subtítulo da Home';
    if (activeEditTarget.key === 'fufuWelcomeText') return 'Editar Mensagem de Boas-Vindas do Fufu';
    if (activeEditTarget.key === 'footerText') return 'Editar Texto do Rodapé';
    if (activeEditTarget.key === 'youtubeUrl') return 'Editar Link do Canal Oficial do YouTube';
    return 'Editar Informação do Site';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 max-w-lg w-full overflow-hidden p-6 relative">
        <button
          onClick={closeEditTarget}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-black text-[#1a3c5a] mb-4 pr-8">{getTitle()}</h3>

        <form onSubmit={handleSave} className="space-y-4">
          {activeEditTarget.type === 'announcement' && (
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={bannerEnabled}
                onChange={(e) => setBannerEnabled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
              <span>Ativar este banner no topo de todas as páginas</span>
            </label>
          )}

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
              {activeEditTarget.type === 'announcement' ? 'Texto do Aviso' : 'Conteúdo do Texto'}
            </label>
            {fieldValue.length > 80 || activeEditTarget.key === 'fufuWelcomeText' ? (
              <textarea
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-sm font-medium text-slate-800"
                required
              />
            ) : (
              <input
                type="text"
                value={fieldValue}
                onChange={(e) => setFieldValue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-sm font-medium text-slate-800"
                required
              />
            )}
          </div>

          {activeEditTarget.type === 'announcement' && (
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">
                Link de Destino (Opcional, ex: /#/aulas ou https://...)
              </label>
              <input
                type="text"
                value={secondaryValue}
                onChange={(e) => setSecondaryValue(e.target.value)}
                placeholder="/#/aulas ou https://..."
                className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:outline-none text-sm font-medium text-slate-800"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeEditTarget}
              className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1a3c5a] hover:bg-slate-800 text-white rounded-xl font-black text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-400" /> Salvo!
                </>
              ) : (
                <>
                  <Save size={16} /> {isSaving ? 'Salvando...' : 'Salvar Alteração'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
