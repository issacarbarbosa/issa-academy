import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  FolderOpen,
  RefreshCw,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import {
  MsaClefType,
  PresetScore,
  UserRoleMode,
} from '../types/music';
import {
  HYMNAL_EDITION_SHORT_LABELS,
  MSA_OFFICIAL_CLEFS,
} from '../utils/musicMath';

interface TopBarProps {
  presets: PresetScore[];
  activePresetId: string;
  scoreTitle: string;
  isCustomUpload: boolean;
  activeMsaClef: MsaClefType;
  userRole: UserRoleMode;
  isAdmin?: boolean;
  onUserRoleChange: (role: UserRoleMode) => void;
  onOpenRepertoirePanel: () => void;
  onSelectPreset: (presetId: string, preferredClef?: MsaClefType) => void;
  onReimportScoreXml: (
    scoreId: string,
    newXml: string,
    targetClef?: MsaClefType,
    fileName?: string
  ) => void;
  onMsaClefChange: (clef: MsaClefType) => void;
  onBackToHome?: () => void;
  onOpenAdminDashboard?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  presets,
  activePresetId,
  scoreTitle,
  isCustomUpload,
  activeMsaClef,
  userRole,
  isAdmin = false,
  onUserRoleChange,
  onOpenRepertoirePanel,
  onSelectPreset,
  onReimportScoreXml,
  onMsaClefChange,
  onBackToHome,
  onOpenAdminDashboard,
}) => {
  const quickReimportInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  const activePreset = useMemo(
    () => presets.find((p) => p.id === activePresetId),
    [presets, activePresetId]
  );

  // Navegação sequencial escopada à coleção atual (MSA ou Hinário 5)
  const scopedNavigationList = useMemo(() => {
    if (!activePreset) return presets;
    if (activePreset.collection === 'msa') {
      return presets
        .filter((p) => p.collection === 'msa')
        .sort((a, b) => a.number - b.number);
    }
    const byNumber = new Map<number, PresetScore>();
    const sorted = presets
      .filter((p) => p.collection === 'hinario5')
      .sort((a, b) => a.number - b.number);
    for (const h of sorted) {
      if (!byNumber.has(h.number) || h.edition === activePreset.edition) {
        byNumber.set(h.number, h);
      }
    }
    return Array.from(byNumber.values()).sort((a, b) => a.number - b.number);
  }, [presets, activePreset]);

  const currentNavIndex = useMemo(() => {
    if (!activePreset) return -1;
    if (activePreset.collection === 'hinario5') {
      return scopedNavigationList.findIndex((p) => p.number === activePreset.number);
    }
    return scopedNavigationList.findIndex((p) => p.id === activePresetId);
  }, [scopedNavigationList, activePreset, activePresetId]);

  // Todas as edições disponíveis para o mesmo número de hino quando em Hinário 5
  const siblingHymnEditions = useMemo(() => {
    if (!activePreset || activePreset.collection !== 'hinario5') return [];
    return presets.filter(
      (p) => p.collection === 'hinario5' && p.number === activePreset.number
    );
  }, [presets, activePreset]);

  const handlePrevPreset = () => {
    if (scopedNavigationList.length === 0) return;
    const prevIdx =
      currentNavIndex > 0 ? currentNavIndex - 1 : scopedNavigationList.length - 1;
    onSelectPreset(scopedNavigationList[prevIdx].id);
  };

  const handleNextPreset = () => {
    if (scopedNavigationList.length === 0) return;
    const nextIdx =
      currentNavIndex >= 0 && currentNavIndex < scopedNavigationList.length - 1
        ? currentNavIndex + 1
        : 0;
    onSelectPreset(scopedNavigationList[nextIdx].id);
  };

  const processMusicXmlFile = async (
    file: File,
    scoreId: string,
    targetClef?: MsaClefType
  ) => {
    const text = await file.text();
    if (!text.includes('<score-partwise') && !text.includes('<score-timewise')) {
      return;
    }
    onReimportScoreXml(scoreId, text, targetClef, file.name);
  };

  const handleQuickReimportFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !activePreset) return;
    try {
      const targetClef =
        activePreset.collection === 'msa' && activePreset.msaPhase === 'solfejo'
          ? activeMsaClef
          : undefined;
      await processMusicXmlFile(file, activePreset.id, targetClef);
    } finally {
      e.target.value = '';
    }
  };

  const handleDropXml = async (
    e: React.DragEvent,
    scoreId: string,
    targetClef?: MsaClefType
  ) => {
    if (!isAdmin || userRole !== 'admin') return;
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(null);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processMusicXmlFile(file, scoreId, targetClef);
  };

  const isMsaLesson = activePreset?.collection === 'msa';
  const isMsaSolfejo = isMsaLesson && activePreset?.msaPhase === 'solfejo';
  const isEffectiveAdmin = isAdmin && userRole === 'admin';

  return (
    <header className="sticky top-0 z-30 h-12 bg-white border-b border-neutral-200 select-none">
      {/* Input oculto para atualização rápida de MusicXML pelo Administrador */}
      <input
        ref={quickReimportInputRef}
        type="file"
        accept=".musicxml,.xml,application/xml,text/xml"
        onChange={handleQuickReimportFileChange}
        className="hidden"
      />

      {/* Barra Superior Única e Compacta (48px — "Menos é mais") */}
      <div className="h-full px-2 sm:px-5 flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
        {/* Esquerda: Voltar ao Portal + Anterior/Próxima + Repertório + Título da Obra */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              data-testid="topbar-back-home-btn"
              title="Voltar ao início da Issa Academy"
              aria-label="Voltar ao início"
              className="h-7 sm:h-7.5 px-1.5 sm:px-2 rounded border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-950 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Início</span>
            </button>
          )}
          <div className="flex items-center border border-neutral-200 rounded bg-white shrink-0">
            <button
              type="button"
              onClick={handlePrevPreset}
              title={
                activePreset?.collection === 'msa'
                  ? 'Lição anterior do MSA'
                  : 'Hino anterior'
              }
              aria-label="Partitura anterior"
              className="w-6.5 h-7 sm:w-7 sm:h-7 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-neutral-200" />
            <button
              type="button"
              onClick={handleNextPreset}
              title={
                activePreset?.collection === 'msa'
                  ? 'Próxima lição do MSA'
                  : 'Próximo hino'
              }
              aria-label="Próxima partitura"
              className="w-6.5 h-7 sm:w-7 sm:h-7 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Botão Repertório */}
          <button
            type="button"
            onClick={onOpenRepertoirePanel}
            data-testid="open-repertoire-panel-btn"
            aria-label="Repertório"
            title="Abrir Repertório"
            className="h-7 sm:h-7.5 px-2 sm:px-2.5 rounded bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className={isMsaSolfejo ? 'hidden min-[420px]:inline' : ''}>
              Repertório
            </span>
          </button>

          {/* Título Clicável (oculto em telas pequenas para preservar espaço das claves/edições sem sobreposição) */}
          <button
            type="button"
            onClick={onOpenRepertoirePanel}
            data-testid="score-selector-trigger"
            className="hidden md:flex items-center gap-2 px-2 py-1 rounded hover:bg-neutral-100 transition-colors text-left min-w-0 cursor-pointer"
          >
            <span
              className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                activePreset?.collection === 'msa'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-neutral-200 text-neutral-800'
              }`}
            >
              {activePreset?.collection === 'msa'
                ? `Lição ${activePreset.number}`
                : `Hino ${activePreset?.number ?? ''}`}
            </span>
            <h1 className="text-xs sm:text-sm font-semibold text-neutral-800 truncate max-w-[180px] lg:max-w-[340px]">
              {scoreTitle}
            </h1>
            {isCustomUpload && (
              <span className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-medium bg-neutral-100 text-neutral-600 rounded">
                Local
              </span>
            )}
          </button>
        </div>

        {/* Direita: Pílulas de Clave (𝄞 Sol | 𝄡 Dó | 𝄢 Fá) ou Edição + Botão MusicXML Admin + Chave Aluno/Admin (apenas se isAdmin) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Seletor de 3 Claves com Símbolos Musicais Universais (Solfejo MSA) */}
          {isMsaSolfejo && activePreset && (
            <div
              className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200"
              data-testid="msa-clef-selector-bar"
            >
              {MSA_OFFICIAL_CLEFS.map((clefOpt) => {
                const isSelected = activeMsaClef === clefOpt.value;
                const dragKey = `topbar-clef-${clefOpt.value}`;
                const isDraggedOver = dragOverTarget === dragKey;
                return (
                  <button
                    key={clefOpt.value}
                    type="button"
                    onClick={() => onMsaClefChange(clefOpt.value)}
                    onDragOver={(e) => {
                      if (!isEffectiveAdmin) return;
                      e.preventDefault();
                      setDragOverTarget(dragKey);
                    }}
                    onDragLeave={() => setDragOverTarget(null)}
                    onDrop={(e) => handleDropXml(e, activePreset.id, clefOpt.value)}
                    data-testid={`clef-btn-${clefOpt.value}`}
                    title={
                      isEffectiveAdmin
                        ? `${clefOpt.label} (${clefOpt.staffLineLabel}) — Clique para abrir ou arraste um arquivo .musicxml aqui`
                        : `${clefOpt.label} (${clefOpt.staffLineLabel})`
                    }
                    className={`h-6.5 px-1.5 sm:px-2 rounded-md text-[11px] sm:text-xs font-semibold transition-all cursor-pointer flex items-center gap-0.5 sm:gap-1 whitespace-nowrap ${
                      isDraggedOver
                        ? 'ring-2 ring-amber-400 bg-amber-100 text-amber-950'
                        : isSelected
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'text-neutral-700 hover:text-neutral-950 hover:bg-white/60'
                    }`}
                  >
                    <span className="text-sm leading-none">{clefOpt.glyph}</span>
                    <span>{clefOpt.referenceNoteName}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Seletor enxuto de Edição do Hinário 5 */}
          {activePreset?.collection === 'hinario5' && siblingHymnEditions.length > 0 && (
            <div className="flex items-center gap-0.5 sm:gap-1 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
              {siblingHymnEditions.map((edScore) => {
                const isCurrent = edScore.id === activePreset.id;
                const edKey = edScore.edition ?? 'do';
                const dragKey = `topbar-ed-${edScore.id}`;
                const isDraggedOver = dragOverTarget === dragKey;
                return (
                  <button
                    key={edScore.id}
                    type="button"
                    onClick={() => onSelectPreset(edScore.id)}
                    onDragOver={(e) => {
                      if (!isEffectiveAdmin) return;
                      e.preventDefault();
                      setDragOverTarget(dragKey);
                    }}
                    onDragLeave={() => setDragOverTarget(null)}
                    onDrop={(e) => handleDropXml(e, edScore.id)}
                    data-testid={`topbar-edition-btn-${edKey}`}
                    title={
                      isEffectiveAdmin
                        ? `${HYMNAL_EDITION_SHORT_LABELS[edKey] ?? edKey} — Clique para abrir ou arraste um .musicxml aqui`
                        : HYMNAL_EDITION_SHORT_LABELS[edKey] ?? edKey
                    }
                    className={`h-6.5 px-1.5 sm:px-2 rounded-md text-[11px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      isDraggedOver
                        ? 'ring-2 ring-amber-400 bg-amber-100 text-amber-950'
                        : isCurrent
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'text-neutral-700 hover:text-neutral-950 hover:bg-white/60'
                    }`}
                  >
                    {HYMNAL_EDITION_SHORT_LABELS[edKey] ?? edKey}
                  </button>
                );
              })}
            </div>
          )}

          {/* Botão rápido MusicXML (exclusivo Admin autenticado em modo Edição) */}
          {isEffectiveAdmin && activePreset && (
            <button
              type="button"
              onClick={() => quickReimportInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverTarget('topbar-xml-btn');
              }}
              onDragLeave={() => setDragOverTarget(null)}
              onDrop={(e) =>
                handleDropXml(
                  e,
                  activePreset.id,
                  isMsaSolfejo ? activeMsaClef : undefined
                )
              }
              data-testid="topbar-quick-reimport-btn"
              title="Clique ou arraste um arquivo .musicxml aqui para atualizar esta partitura"
              aria-label="Importar MusicXML"
              className={`h-7 px-2 sm:px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                dragOverTarget === 'topbar-xml-btn'
                  ? 'ring-2 ring-amber-400 bg-amber-100 border-amber-400 text-amber-950'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
              }`}
            >
              <RefreshCw className="w-3 h-3 text-amber-700" />
              <span className="hidden sm:inline">MusicXML</span>
            </button>
          )}

          {/* Alternador Direto Aluno/Admin + Atalho para Central Admin (Exclusivo quando Administrador está autenticado) */}
          {isAdmin && (
            <>
              <div
                className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200"
                data-testid="topbar-role-switcher"
              >
                <button
                  type="button"
                  onClick={() => onUserRoleChange('student')}
                  data-testid="topbar-role-student-btn"
                  title="Visão do Aluno"
                  className={`h-6.5 px-2 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    userRole === 'student'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span className="hidden sm:inline">Aluno</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUserRoleChange('admin')}
                  data-testid="topbar-role-admin-btn"
                  title="Modo de Edição do Administrador"
                  className={`h-6.5 px-2 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                    userRole === 'admin'
                      ? 'bg-amber-500 text-neutral-950 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              </div>

              {onOpenAdminDashboard && (
                <button
                  type="button"
                  onClick={onOpenAdminDashboard}
                  data-testid="topbar-open-admin-dashboard-btn"
                  title="Abrir Central de Administração (/admin)"
                  aria-label="Abrir Central de Administração"
                  className="w-7 h-7 rounded-lg border border-neutral-200 bg-neutral-900 hover:bg-neutral-800 text-amber-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

