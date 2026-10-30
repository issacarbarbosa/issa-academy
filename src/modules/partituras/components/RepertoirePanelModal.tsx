import React, { useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Download,
  Edit2,
  Eye,
  FileUp,
  Music2,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  HymnalEdition,
  MsaClefType,
  MsaPhaseCategory,
  PresetScore,
  UserRoleMode,
} from '../types/music';
import {
  clampBpm,
  extractMusicXmlMetadata,
  groupHymnsByNumber,
  HYMNAL_EDITION_LABELS,
  HYMNAL_EDITION_SHORT_LABELS,
  MSA_OFFICIAL_CLEFS,
  normalizeRhythmicMusicXmlToFirstSpace,
  ScoreMetadataUpdate,
} from '../utils/musicMath';
import { downloadScoreMusicXmlFile } from '../data/sampleScores';

interface RepertoirePanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogScores: PresetScore[];
  activePresetId: string;
  activeMsaClef: MsaClefType;
  userRole: UserRoleMode;
  isAdmin?: boolean;
  hiddenFactoryCount?: number;
  onUserRoleChange: (role: UserRoleMode) => void;
  onSelectScore: (scoreId: string, preferredClef?: MsaClefType) => void;
  onReimportScoreXml: (
    scoreId: string,
    newXml: string,
    targetClef?: MsaClefType,
    fileName?: string
  ) => void;
  onAddNewScore: (newScore: PresetScore) => void;
  onRestoreDefaultScore: (scoreId: string) => void;
  onDeleteCustomScore: (scoreId: string) => void;
  onUpdateScoreMetadata?: (scoreId: string, updates: ScoreMetadataUpdate) => void;
  onRemoveScoreClef?: (scoreId: string, clef: MsaClefType) => void;
  onRestoreHiddenFactoryScores?: () => void;
}

const EDITION_OPTIONS: { value: HymnalEdition; label: string }[] = [
  { value: 'cordas', label: 'Cordas' },
  { value: 'orgao', label: 'Órgão' },
  { value: 'do', label: 'Dó' },
  { value: 'sib', label: 'Si♭' },
  { value: 'mib', label: 'Mi♭' },
  { value: 'fa', label: 'Fá' },
  { value: 'tubas', label: 'Tubas' },
];

export const RepertoirePanelModal: React.FC<RepertoirePanelModalProps> = ({
  isOpen,
  onClose,
  catalogScores,
  activePresetId,
  activeMsaClef,
  userRole,
  isAdmin = false,
  hiddenFactoryCount = 0,
  onUserRoleChange,
  onSelectScore,
  onReimportScoreXml,
  onAddNewScore,
  onRestoreDefaultScore,
  onDeleteCustomScore,
  onUpdateScoreMetadata,
  onRemoveScoreClef,
  onRestoreHiddenFactoryScores,
}) => {
  const [mainTab, setMainTab] = useState<'msa' | 'hinario5' | 'new-import'>('msa');
  const [editionFilter, setEditionFilter] = useState<'all' | HymnalEdition>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  // Confirmação Inline sem window.confirm / window.alert
  const [inlineConfirmKey, setInlineConfirmKey] = useState<string | null>(null);

  // Estado de Edição de Metadados Inline (Admin)
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editNumber, setEditNumber] = useState<number>(1);
  const [editTimeSig, setEditTimeSig] = useState<string>('4/4');
  const [editBpm, setEditBpm] = useState<number>(72);
  const [editMsaPhase, setEditMsaPhase] = useState<MsaPhaseCategory>('solfejo');
  const [editEdition, setEditEdition] = useState<HymnalEdition>('cordas');

  // Hidden file input for re-importing MusicXML on existing lessons/hymns
  const reimportInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingReimportTarget, setPendingReimportTarget] = useState<{
    scoreId: string;
    scoreTitle: string;
    clef?: MsaClefType;
  } | null>(null);

  // New MusicXML Import Form State (Admin Only)
  const [newCollection, setNewCollection] = useState<'msa' | 'hinario5'>('msa');
  const [newMsaPhase, setNewMsaPhase] = useState<MsaPhaseCategory>('solfejo');
  const [newNumber, setNewNumber] = useState<number>(23);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newTimeSignature, setNewTimeSignature] = useState<string>('4/4');
  const [newBpm, setNewBpm] = useState<number>(72);
  const [newEdition, setNewEdition] = useState<HymnalEdition>('cordas');
  const [autoDetectedNotice, setAutoDetectedNotice] = useState<string | null>(null);

  // Uploaded XML strings for New Import
  const [newSingleXml, setNewSingleXml] = useState<{ name: string; content: string } | null>(null);
  const [newClefXmls, setNewClefXmls] = useState<
    Partial<Record<MsaClefType, { name: string; content: string }>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);

  const isEffectiveAdmin = isAdmin && userRole === 'admin';

  const msaLessons = useMemo(() => {
    return catalogScores
      .filter((s) => s.collection === 'msa')
      .filter((s) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = s.title.toLowerCase().includes(q);
          const matchNum = String(s.number) === q || `lição ${s.number}`.includes(q);
          const matchDesc = s.description.toLowerCase().includes(q);
          return matchTitle || matchNum || matchDesc;
        }
        return true;
      })
      .sort((a, b) => a.number - b.number);
  }, [catalogScores, searchQuery]);

  const groupedHymns = useMemo(() => {
    const filteredHymnScores = catalogScores
      .filter((s) => s.collection === 'hinario5')
      .filter((s) => {
        if (editionFilter !== 'all' && s.edition !== editionFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = s.title.toLowerCase().includes(q);
          const matchNum = String(s.number) === q || `hino ${s.number}`.includes(q);
          const matchComp = s.composer.toLowerCase().includes(q);
          return matchTitle || matchNum || matchComp;
        }
        return true;
      });
    return groupHymnsByNumber(filteredHymnScores);
  }, [catalogScores, editionFilter, searchQuery]);

  if (!isOpen) return null;

  const showTemporaryFeedback = (msg: string) => {
    setFeedbackBanner(msg);
    window.setTimeout(() => {
      setFeedbackBanner((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const openMetadataEditor = (score: PresetScore) => {
    setEditingScoreId(score.id);
    setEditTitle(score.title);
    setEditNumber(score.number);
    setEditTimeSig(score.timeSignature || '4/4');
    setEditBpm(score.defaultBpm || 72);
    setEditMsaPhase(score.msaPhase || 'solfejo');
    setEditEdition(score.edition || 'cordas');
    setInlineConfirmKey(null);
  };

  const handleSaveMetadataEdit = (scoreId: string) => {
    if (!onUpdateScoreMetadata) return;
    onUpdateScoreMetadata(scoreId, {
      title: editTitle,
      number: editNumber,
      timeSignature: editTimeSig,
      defaultBpm: editBpm,
      msaPhase: editMsaPhase,
      edition: editEdition,
    });
    setEditingScoreId(null);
    showTemporaryFeedback(`Metadados de "${editTitle}" atualizados com sucesso!`);
  };

  const triggerReimportFilePicker = (
    scoreId: string,
    scoreTitle: string,
    clef?: MsaClefType
  ) => {
    setPendingReimportTarget({ scoreId, scoreTitle, clef });
    reimportInputRef.current?.click();
  };

  const applyFileContentToTarget = (
    file: File,
    scoreId: string,
    scoreTitle: string,
    clef?: MsaClefType
  ) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (
        typeof content === 'string' &&
        (content.includes('<score-partwise') || content.includes('<score-timewise'))
      ) {
        onReimportScoreXml(scoreId, content, clef, file.name);
        const clefLabel = clef
          ? ` (${
              MSA_OFFICIAL_CLEFS.find((c) => c.value === clef)?.shortLabel ?? clef
            })`
          : '';
        showTemporaryFeedback(
          `MusicXML atualizado em "${scoreTitle}"${clefLabel}!`
        );
      } else {
        setFeedbackBanner(
          `Arquivo "${file.name}" inválido. Selecione um arquivo .musicxml ou .xml válido.`
        );
      }
      setPendingReimportTarget(null);
    };
    reader.readAsText(file);
  };

  const handleReimportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingReimportTarget) return;
    applyFileContentToTarget(
      file,
      pendingReimportTarget.scoreId,
      pendingReimportTarget.scoreTitle,
      pendingReimportTarget.clef
    );
    e.target.value = '';
  };

  const handleDropXmlOnTarget = (
    e: React.DragEvent,
    scoreId: string,
    scoreTitle: string,
    clef?: MsaClefType
  ) => {
    if (!isEffectiveAdmin) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOverKey(null);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    applyFileContentToTarget(file, scoreId, scoreTitle, clef);
  };

  const applyAutoDetectedMetadata = (xmlContent: string, fileName: string) => {
    const meta = extractMusicXmlMetadata(xmlContent, fileName);
    const detectedItems: string[] = [];

    if (meta.detectedCollection) {
      setNewCollection(meta.detectedCollection);
    }
    if (meta.isRhythmicUnpitched && meta.detectedCollection !== 'hinario5') {
      setNewMsaPhase('ritmica');
      detectedItems.push('Leitura Rítmica');
    }
    if (meta.detectedNumber) {
      setNewNumber(meta.detectedNumber);
      detectedItems.push(`Nº ${meta.detectedNumber}`);
    }
    if (meta.title) {
      setNewTitle(meta.title);
      detectedItems.push(`"${meta.title}"`);
    }
    if (meta.timeSignature) {
      setNewTimeSignature(meta.timeSignature);
      detectedItems.push(`Compasso ${meta.timeSignature}`);
    }
    if (meta.defaultBpm) {
      setNewBpm(meta.defaultBpm);
      detectedItems.push(`♩ = ${meta.defaultBpm}`);
    }
    if (detectedItems.length > 0) {
      setAutoDetectedNotice(
        `Metadados detectados automaticamente: ${detectedItems.join(' · ')}`
      );
    }
    return meta;
  };

  const handleNewSingleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (
        typeof text === 'string' &&
        (text.includes('<score-partwise') || text.includes('<score-timewise'))
      ) {
        setNewSingleXml({ name: file.name, content: text });
        applyAutoDetectedMetadata(text, file.name);
        setFormError(null);
      } else {
        setFormError(`O arquivo "${file.name}" não contém um MusicXML válido (<score-partwise>).`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleNewClefFileChange = (
    clef: MsaClefType,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (
        typeof text === 'string' &&
        (text.includes('<score-partwise') || text.includes('<score-timewise'))
      ) {
        setNewClefXmls((prev) => ({
          ...prev,
          [clef]: { name: file.name, content: text },
        }));
        applyAutoDetectedMetadata(text, file.name);
        setFormError(null);
      } else {
        setFormError(`O arquivo "${file.name}" não contém um MusicXML válido (<score-partwise>).`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Upload inteligente em lote (Múltiplos arquivos de uma só vez: atribui cada arquivo à sua clave detectada Sol/Dó/Fá)
  const handleBatchClefFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    if (fileArr.length === 0) return;

    const nextClefs: Partial<Record<MsaClefType, { name: string; content: string }>> = {
      ...newClefXmls,
    };

    for (const file of fileArr) {
      const text = await file.text();
      if (!text.includes('<score-partwise') && !text.includes('<score-timewise')) {
        continue;
      }
      const meta = applyAutoDetectedMetadata(text, file.name);
      const targetClef: MsaClefType =
        meta.detectedClef ??
        (!nextClefs.sol ? 'sol' : !nextClefs.do ? 'do' : 'fa');
      nextClefs[targetClef] = { name: file.name, content: text };
      setNewSingleXml({ name: file.name, content: text });
    }

    setNewClefXmls(nextClefs);
    setFormError(null);
  };

  const handleCreateNewImportedScore = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const safeNum = Math.max(1, Math.round(newNumber));
    const safeBpm = clampBpm(newBpm);

    if (newCollection === 'msa') {
      const computedTitle =
        newTitle.trim() || `MSA — Lição ${safeNum}`;

      if (newMsaPhase === 'ritmica') {
        if (!newSingleXml) {
          setFormError('Selecione o arquivo MusicXML da Lição.');
          return;
        }
        const scoreObj: PresetScore = {
          id: `msa-licao-${String(safeNum).padStart(3, '0')}`,
          title: computedTitle,
          composer: 'MSA CCB · Importado pelo Administrador',
          difficulty: `MSA · ${newTimeSignature}`,
          defaultBpm: safeBpm,
          tempoLabel: `♩ = ${safeBpm}`,
          timeSignature: newTimeSignature,
          keySignature: 'Sem Clave',
          description: 'Lição do MSA importada via MusicXML.',
          collection: 'msa',
          number: safeNum,
          msaPhase: 'ritmica',
          defaultTimbre: 'acoustic-grand',
          isCustomCreated: true,
          hasAdminOverride: true,
          xml: normalizeRhythmicMusicXmlToFirstSpace(newSingleXml.content),
        };
        onAddNewScore(scoreObj);
        showTemporaryFeedback(`"${computedTitle}" importada com sucesso!`);
        setMainTab('msa');
        return;
      }

      // MSA (3 Claves: Sol, Dó, Fá)
      const solXml = newClefXmls.sol?.content;
      const doXml = newClefXmls.do?.content;
      const faXml = newClefXmls.fa?.content;

      if (!solXml && !doXml && !faXml) {
        setFormError(
          'Importe o arquivo MusicXML de pelo menos uma das 3 Claves (Clave de Sol, Clave de Dó ou Clave de Fá).'
        );
        return;
      }

      const primaryXml = solXml || doXml || faXml || '';
      const defaultClef: MsaClefType = solXml ? 'sol' : doXml ? 'do' : 'fa';

      const scoreObj: PresetScore = {
        id: `msa-licao-${String(safeNum).padStart(3, '0')}`,
        title: computedTitle,
        composer: 'MSA CCB · Importado pelo Administrador',
        difficulty: `MSA · ${newTimeSignature}`,
        defaultBpm: safeBpm,
        tempoLabel: `♩ = ${safeBpm}`,
        timeSignature: newTimeSignature,
        keySignature: '3 Claves (Sol, Dó, Fá)',
        description:
          'Lição do MSA com MusicXML dedicado para as 3 claves (Sol, Dó e Fá).',
        collection: 'msa',
        number: safeNum,
        msaPhase: 'solfejo',
        defaultClef,
        defaultTimbre: 'acoustic-grand',
        isCustomCreated: true,
        hasAdminOverride: true,
        xml: primaryXml,
        xmlByClef: {
          ...(solXml ? { sol: solXml } : {}),
          ...(doXml ? { do: doXml } : {}),
          ...(faXml ? { fa: faXml } : {}),
        },
      };
      onAddNewScore(scoreObj);
      showTemporaryFeedback(`"${computedTitle}" importada com sucesso!`);
      setMainTab('msa');
      return;
    }

    // Hinário 5 CCB
    if (!newSingleXml) {
      setFormError('Selecione o arquivo MusicXML do Hino.');
      return;
    }
    const editionLabel = HYMNAL_EDITION_LABELS[newEdition] || newEdition;
    const baseHymnTitle = newTitle.trim() || `Hino ${safeNum}`;
    const fullHymnTitle = baseHymnTitle.includes('(')
      ? baseHymnTitle
      : `${baseHymnTitle} (${editionLabel})`;

    const scoreObj: PresetScore = {
      id: `hino-${String(safeNum).padStart(3, '0')}-${newEdition}`,
      title: fullHymnTitle,
      composer: `Hinário 5 CCB · ${editionLabel}`,
      difficulty: `${editionLabel} · ${newTimeSignature}`,
      defaultBpm: safeBpm,
      tempoLabel: `♩ = ${safeBpm}`,
      timeSignature: newTimeSignature,
      keySignature: editionLabel,
      description: `Hino ${safeNum} (${editionLabel}) importado via MusicXML pelo administrador.`,
      collection: 'hinario5',
      number: safeNum,
      edition: newEdition,
      defaultTimbre: 'acoustic-grand',
      isCustomCreated: true,
      hasAdminOverride: true,
      xml: newSingleXml.content,
    };
    onAddNewScore(scoreObj);
    showTemporaryFeedback(`"${fullHymnTitle}" importado com sucesso!`);
    setMainTab('hinario5');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Painel de Navegação do MSA e Hinário 5"
      data-testid="repertoire-panel-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-2 sm:p-4"
    >
      {/* Hidden input for re-importing MusicXML */}
      <input
        ref={reimportInputRef}
        type="file"
        accept=".xml,.musicxml"
        onChange={handleReimportFileChange}
        className="hidden"
        aria-label="Selecionar arquivo MusicXML para substituir o anterior"
      />

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-zinc-900">
        {/* Top Modal Header + Role Switcher (Exibido apenas para Administrador autenticado) */}
        <div className="px-4 sm:px-6 py-4 border-b border-zinc-200 bg-zinc-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1 flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900">
              Biblioteca Musical — MSA &amp; Hinário 5 CCB
            </h2>

            {isEffectiveAdmin && hiddenFactoryCount > 0 && onRestoreHiddenFactoryScores && (
              <button
                type="button"
                data-testid="restore-hidden-factory-scores-btn"
                onClick={() => {
                  onRestoreHiddenFactoryScores();
                  showTemporaryFeedback('Partituras de fábrica restauradas ao catálogo!');
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar {hiddenFactoryCount} oculta(s)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Switcher between Student View and Admin Panel (Exclusivo para Administrador) */}
            {isAdmin && (
              <div
                role="group"
                aria-label="Alternar entre Visão do Aluno e Painel do Administrador"
                className="inline-flex items-center p-1 rounded-xl bg-zinc-200/80 border border-zinc-300/70"
              >
                <button
                  type="button"
                  data-testid="modal-role-student-btn"
                  onClick={() => {
                    onUserRoleChange('student');
                    if (mainTab === 'new-import') setMainTab('msa');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    userRole === 'student'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Visão do Aluno</span>
                </button>
                <button
                  type="button"
                  data-testid="modal-role-admin-btn"
                  onClick={() => onUserRoleChange('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    userRole === 'admin'
                      ? 'bg-[#2B2C30] text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Painel Admin</span>
                </button>
              </div>
            )}

            <button
              type="button"
              data-testid="close-repertoire-modal-btn"
              onClick={onClose}
              aria-label="Fechar painel de repertório"
              className="w-8.5 h-8.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback Banner after Re-import, Metadata Edit, or New Import */}
        {feedbackBanner && (
          <div
            role="status"
            data-testid="admin-feedback-banner"
            className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedbackBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackBanner(null)}
              className="text-emerald-700 hover:text-emerald-950 font-semibold cursor-pointer"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Inline Metadata Editor Bar when editing a score's metadata */}
        {isEffectiveAdmin && editingScoreId && (() => {
          const targetScore = catalogScores.find((s) => s.id === editingScoreId);
          if (!targetScore) return null;
          return (
            <div
              data-testid="inline-score-metadata-editor"
              className="px-4 sm:px-6 py-3.5 bg-amber-50/90 border-b border-amber-300 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Editando Metadados: {targetScore.title}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setEditingScoreId(null)}
                  className="text-xs font-semibold text-amber-800 hover:text-amber-950 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-end">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-amber-900 mb-0.5">
                    Título
                  </label>
                  <input
                    type="text"
                    data-testid="edit-score-title-input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg border border-amber-300 bg-white text-xs font-medium text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-amber-900 mb-0.5">
                    {targetScore.collection === 'msa' ? 'Nº Lição' : 'Nº Hino'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={480}
                    data-testid="edit-score-number-input"
                    value={editNumber}
                    onChange={(e) => setEditNumber(Number(e.target.value))}
                    className="w-full h-8 px-2.5 rounded-lg border border-amber-300 bg-white text-xs font-mono text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-amber-900 mb-0.5">
                    Compasso
                  </label>
                  <select
                    data-testid="edit-score-timesig-select"
                    value={editTimeSig}
                    onChange={(e) => setEditTimeSig(e.target.value)}
                    className="w-full h-8 px-2 rounded-lg border border-amber-300 bg-white text-xs font-mono text-zinc-900"
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
                  <label className="block text-[10px] font-bold uppercase text-amber-900 mb-0.5">
                    BPM (♩)
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={240}
                    data-testid="edit-score-bpm-input"
                    value={editBpm}
                    onChange={(e) => setEditBpm(Number(e.target.value))}
                    className="w-full h-8 px-2.5 rounded-lg border border-amber-300 bg-white text-xs font-mono text-zinc-900"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    data-testid="save-score-metadata-btn"
                    onClick={() => handleSaveMetadataEdit(targetScore.id)}
                    className="w-full h-8 px-3 rounded-lg bg-[#2B2C30] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-400" />
                    <span>Salvar</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Primary Section Tabs + Search Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-zinc-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              data-testid="repertoire-tab-msa"
              onClick={() => setMainTab('msa')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                mainTab === 'msa'
                  ? 'bg-[#2B2C30] text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Lições do MSA ({catalogScores.filter((s) => s.collection === 'msa').length})</span>
            </button>

            <button
              type="button"
              data-testid="repertoire-tab-hinario5"
              onClick={() => setMainTab('hinario5')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                mainTab === 'hinario5'
                  ? 'bg-[#2B2C30] text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              <Music2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Hinário 5 CCB ({groupedHymns.length} Hinos)</span>
            </button>

            {isEffectiveAdmin && (
              <button
                type="button"
                data-testid="repertoire-tab-new-import"
                onClick={() => setMainTab('new-import')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  mainTab === 'new-import'
                    ? 'bg-amber-500 text-zinc-950'
                    : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Nova Importação MusicXML</span>
              </button>
            )}
          </div>

          {mainTab !== 'new-import' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                data-testid="repertoire-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  mainTab === 'msa'
                    ? 'Buscar lição por número ou título...'
                    : 'Buscar hino por número ou título...'
                }
                className="w-full h-8.5 pl-8.5 pr-3 rounded-xl border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:border-zinc-400"
              />
            </div>
          )}
        </div>

        {/* Sub-filters for Hinário 5 */}
        {mainTab === 'hinario5' && (
          <div className="px-4 sm:px-6 py-2.5 bg-zinc-50/70 border-b border-zinc-200/80 flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setEditionFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
                editionFilter === 'all'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Todas as Edições
            </button>
            {EDITION_OPTIONS.map((ed) => (
              <button
                key={ed.value}
                type="button"
                onClick={() => setEditionFilter(ed.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
                  editionFilter === ed.value
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {ed.label}
              </button>
            ))}
          </div>
        )}

        {/* Main Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-white">
          {/* ============================================================== */}
          {/* TAB 1: MSA LESSONS (Grade Compacta Multi-Colunas em Linha Única) */}
          {/* ============================================================== */}
          {mainTab === 'msa' && (
            <>
              {msaLessons.length === 0 ? (
                <div className="py-12 text-center text-sm text-zinc-400">
                  Nenhuma lição do MSA encontrada.
                </div>
              ) : (
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 ${
                    isEffectiveAdmin ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
                  } gap-2.5`}
                >
                  {msaLessons.map((lesson) => {
                    const isCurrentLesson = lesson.id === activePresetId;
                    const isRhythmic = lesson.msaPhase === 'ritmica';
                    const cardDragKey = `msa-card-${lesson.id}`;
                    const isCardDraggedOver = dragOverKey === cardDragKey;
                    const deleteConfirmKey = `del-${lesson.id}`;
                    const restoreConfirmKey = `rest-${lesson.id}`;

                    const activeClefCount = !isRhythmic
                      ? MSA_OFFICIAL_CLEFS.filter((c) =>
                          Boolean(
                            lesson.xmlByClef?.[c.value] ||
                              (c.value === 'sol' && lesson.xml)
                          )
                        ).length
                      : 0;

                    return (
                      <div
                        key={lesson.id}
                        data-testid={`repertoire-msa-card-${lesson.id}`}
                        onClick={() => {
                          if (isRhythmic) {
                            onSelectScore(lesson.id);
                            onClose();
                          }
                        }}
                        onDragOver={(e) => {
                          if (!isEffectiveAdmin || !isRhythmic) return;
                          e.preventDefault();
                          setDragOverKey(cardDragKey);
                        }}
                        onDragLeave={() => setDragOverKey(null)}
                        onDrop={(e) => {
                          if (!isRhythmic) return;
                          handleDropXmlOnTarget(e, lesson.id, lesson.title);
                        }}
                        className={`rounded-xl border px-2.5 sm:px-3 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 sm:gap-2 transition-all ${
                          isRhythmic ? 'cursor-pointer' : ''
                        } ${
                          isCardDraggedOver
                            ? 'ring-2 ring-amber-400 bg-amber-50 border-amber-400'
                            : isCurrentLesson
                            ? 'border-amber-400 bg-amber-50/40 shadow-2xs'
                            : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/60'
                        }`}
                      >
                        {/* Esquerda: Tag clicável "Lição N" */}
                        <button
                          type="button"
                          data-testid={`open-lesson-btn-${lesson.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectScore(
                              lesson.id,
                              isRhythmic ? undefined : lesson.defaultClef ?? 'sol'
                            );
                            onClose();
                          }}
                          className="flex items-center gap-1.5 shrink-0 text-left cursor-pointer group"
                        >
                          <span
                            className={`text-xs font-bold font-mono px-2 sm:px-2.5 py-1 rounded-md tabular-nums whitespace-nowrap shrink-0 transition-colors ${
                              isCurrentLesson
                                ? 'bg-[#2B2C30] text-white'
                                : 'bg-zinc-100 text-zinc-900 group-hover:bg-zinc-200'
                            }`}
                          >
                            Lição {lesson.number}
                          </span>
                          {isEffectiveAdmin && lesson.hasAdminOverride && (
                            <span
                              title="MusicXML ou metadados personalizados ativos"
                              className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"
                            />
                          )}
                        </button>

                        {/* Direita: Pílulas de Clave (𝄞 Sol | 𝄡 Dó | 𝄢 Fá) + Ações Admin Inline */}
                        <div
                          className="flex items-center gap-1 flex-wrap justify-end min-w-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {!isRhythmic &&
                            MSA_OFFICIAL_CLEFS.map((clefOpt) => {
                              const hasClefXml = Boolean(
                                lesson.xmlByClef?.[clefOpt.value] ||
                                  (clefOpt.value === 'sol' && lesson.xml)
                              );
                              const isSelectedClef =
                                isCurrentLesson && activeMsaClef === clefOpt.value;
                              const clefDragKey = `msa-clef-${lesson.id}-${clefOpt.value}`;
                              const isClefDraggedOver = dragOverKey === clefDragKey;

                              return (
                                <div
                                  key={clefOpt.value}
                                  onDragOver={(e) => {
                                    if (!isEffectiveAdmin) return;
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDragOverKey(clefDragKey);
                                  }}
                                  onDragLeave={() => setDragOverKey(null)}
                                  onDrop={(e) =>
                                    handleDropXmlOnTarget(
                                      e,
                                      lesson.id,
                                      lesson.title,
                                      clefOpt.value
                                    )
                                  }
                                  className={`inline-flex items-center rounded-lg border transition-all ${
                                    isClefDraggedOver
                                      ? 'ring-2 ring-amber-400 bg-amber-100 border-amber-400'
                                      : isSelectedClef
                                      ? 'bg-[#2B2C30] border-[#2B2C30] text-white'
                                      : 'bg-zinc-100 border-zinc-200/80 text-zinc-800 hover:bg-zinc-200/80'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    disabled={!hasClefXml}
                                    data-testid={`open-lesson-${lesson.id}-clef-${clefOpt.value}`}
                                    onClick={() => {
                                      onSelectScore(lesson.id, clefOpt.value);
                                      onClose();
                                    }}
                                    title={
                                      isEffectiveAdmin
                                        ? `${clefOpt.label} (${clefOpt.staffLineLabel}) — Clique para abrir ou arraste .musicxml aqui`
                                        : `${clefOpt.label} (${clefOpt.staffLineLabel})`
                                    }
                                    className={`px-1.5 sm:px-2 py-1 text-[11px] sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1 whitespace-nowrap ${
                                      !hasClefXml
                                        ? 'opacity-40 cursor-not-allowed'
                                        : 'cursor-pointer'
                                    }`}
                                  >
                                    <span className="text-sm leading-none">
                                      {clefOpt.glyph}
                                    </span>
                                    <span>{clefOpt.referenceNoteName}</span>
                                  </button>

                                  {isEffectiveAdmin && (
                                    <>
                                      <button
                                        type="button"
                                        data-testid={`reimport-xml-btn-${lesson.id}-${clefOpt.value}`}
                                        onClick={() =>
                                          triggerReimportFilePicker(
                                            lesson.id,
                                            lesson.title,
                                            clefOpt.value
                                          )
                                        }
                                        title={`Substituir MusicXML (${clefOpt.shortLabel})`}
                                        className={`px-1 py-1 border-l text-[10px] font-semibold flex items-center cursor-pointer transition-colors ${
                                          isSelectedClef
                                            ? 'border-white/20 text-amber-300 hover:bg-white/10'
                                            : 'border-zinc-300/80 text-amber-700 hover:bg-amber-100/70'
                                        }`}
                                      >
                                        <Upload className="w-3 h-3" />
                                      </button>

                                      {hasClefXml && activeClefCount > 1 && onRemoveScoreClef && (
                                        <button
                                          type="button"
                                          data-testid={`remove-clef-btn-${lesson.id}-${clefOpt.value}`}
                                          onClick={() => {
                                            onRemoveScoreClef(lesson.id, clefOpt.value);
                                            showTemporaryFeedback(
                                              `Clave ${clefOpt.shortLabel} removida de "${lesson.title}".`
                                            );
                                          }}
                                          title={`Remover clave ${clefOpt.shortLabel}`}
                                          className={`px-1 py-1 border-l text-[10px] flex items-center cursor-pointer ${
                                            isSelectedClef
                                              ? 'border-white/20 text-red-300 hover:bg-white/10'
                                              : 'border-zinc-300/80 text-red-500 hover:bg-red-50'
                                          }`}
                                        >
                                          <X className="w-2.5 h-2.5" />
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            })}

                          {/* Botão MusicXML Inline nas Lições Rítmicas (Modo Admin) */}
                          {isEffectiveAdmin && isRhythmic && (
                            <button
                              type="button"
                              data-testid={`reimport-xml-btn-${lesson.id}`}
                              onClick={() =>
                                triggerReimportFilePicker(lesson.id, lesson.title)
                              }
                              title="Clique ou arraste um arquivo .musicxml no cartão"
                              className="px-2 py-1 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                            >
                              <RefreshCw className="w-3 h-3 text-blue-600" />
                              <span>MusicXML</span>
                            </button>
                          )}

                          {/* Ações Admin: Editar Metadados (✏️), Download XML (⬇️), Restaurar (↺) e Excluir (🗑️) com confirmação inline */}
                          {isEffectiveAdmin && (
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                data-testid={`edit-metadata-btn-${lesson.id}`}
                                onClick={() => openMetadataEditor(lesson)}
                                title="Editar título, número, compasso e BPM"
                                className="p-1 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                data-testid={`download-xml-btn-${lesson.id}`}
                                onClick={() => downloadScoreMusicXmlFile(lesson)}
                                title="Baixar arquivo .musicxml"
                                className="p-1 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>

                              {lesson.hasAdminOverride && !lesson.isCustomCreated && (
                                <>
                                  {inlineConfirmKey === restoreConfirmKey ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-[10px] font-bold text-amber-950">
                                      <span>Padrão?</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onRestoreDefaultScore(lesson.id);
                                          setInlineConfirmKey(null);
                                          showTemporaryFeedback(
                                            `Padrão de "${lesson.title}" restaurado.`
                                          );
                                        }}
                                        className="px-1 rounded bg-amber-600 text-white cursor-pointer"
                                      >
                                        Sim
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setInlineConfirmKey(null)}
                                        className="px-1 text-zinc-600 cursor-pointer"
                                      >
                                        Não
                                      </button>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setInlineConfirmKey(restoreConfirmKey)}
                                      title="Restaurar padrão de fábrica"
                                      className="p-1 rounded text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </>
                              )}

                              {inlineConfirmKey === deleteConfirmKey ? (
                                <span
                                  data-testid={`confirm-delete-pill-${lesson.id}`}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 border border-red-300 text-[10px] font-bold text-red-900"
                                >
                                  <span>Excluir?</span>
                                  <button
                                    type="button"
                                    data-testid={`confirm-delete-yes-${lesson.id}`}
                                    onClick={() => {
                                      onDeleteCustomScore(lesson.id);
                                      setInlineConfirmKey(null);
                                      showTemporaryFeedback(`"${lesson.title}" removida.`);
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-red-600 text-white cursor-pointer"
                                  >
                                    Sim
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setInlineConfirmKey(null)}
                                    className="px-1 text-zinc-600 cursor-pointer"
                                  >
                                    Não
                                  </button>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  data-testid={`delete-score-btn-${lesson.id}`}
                                  onClick={() => setInlineConfirmKey(deleteConfirmKey)}
                                  title="Excluir lição"
                                  className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ============================================================== */}
          {/* TAB 2: HINÁRIO 5 CCB (Linha Única + Drag-and-Drop por Edição)  */}
          {/* ============================================================== */}
          {mainTab === 'hinario5' && (
            <>
              {groupedHymns.length === 0 ? (
                <div className="py-12 text-center text-sm text-zinc-400">
                  Nenhum hino encontrado para o filtro selecionado.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {groupedHymns.map((group) => {
                    const isGroupActive = group.editions.some(
                      (e) => e.id === activePresetId
                    );

                    return (
                      <div
                        key={`hymn_group_${group.hymnNumber}`}
                        data-testid={`repertoire-hymn-group-${group.hymnNumber}`}
                        className={`rounded-xl border px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                          isGroupActive
                            ? 'border-blue-400 bg-blue-50/25'
                            : 'border-zinc-200 bg-white hover:border-zinc-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1 flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-md tabular-nums shrink-0">
                            Hino {group.hymnNumber}
                          </span>
                          <h3 className="text-sm font-bold text-zinc-900 truncate">
                            {group.baseTitle}
                          </h3>
                        </div>

                        {/* Pílulas de Edição (com Upload / Edição / Exclusão Inline no modo Admin) */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {group.editions.map((edScore) => {
                            const isSelected = edScore.id === activePresetId;
                            const edLabel = edScore.edition
                              ? HYMNAL_EDITION_SHORT_LABELS[edScore.edition]
                              : edScore.title;
                            const edDragKey = `hymn-ed-${edScore.id}`;
                            const isEdDraggedOver = dragOverKey === edDragKey;
                            const delHymnKey = `del-${edScore.id}`;

                            return (
                              <div
                                key={edScore.id}
                                onDragOver={(e) => {
                                  if (!isEffectiveAdmin) return;
                                  e.preventDefault();
                                  setDragOverKey(edDragKey);
                                }}
                                onDragLeave={() => setDragOverKey(null)}
                                onDrop={(e) =>
                                  handleDropXmlOnTarget(
                                    e,
                                    edScore.id,
                                    edScore.title
                                  )
                                }
                                className={`inline-flex items-center rounded-lg border transition-all ${
                                  isEdDraggedOver
                                    ? 'ring-2 ring-amber-400 bg-amber-100 border-amber-400'
                                    : isSelected
                                    ? 'bg-[#2B2C30] border-[#2B2C30] text-white shadow-xs'
                                    : 'bg-zinc-100 border-zinc-200/80 text-zinc-800 hover:bg-zinc-200'
                                }`}
                              >
                                <button
                                  type="button"
                                  data-testid={`open-hymn-edition-${edScore.id}`}
                                  onClick={() => {
                                    onSelectScore(edScore.id);
                                    onClose();
                                  }}
                                  title={
                                    isEffectiveAdmin
                                      ? `${edLabel} — Clique para abrir ou arraste um .musicxml aqui`
                                      : edLabel
                                  }
                                  className="px-2.5 py-1 text-xs font-semibold cursor-pointer whitespace-nowrap"
                                >
                                  {edLabel}
                                </button>

                                {isEffectiveAdmin && (
                                  <>
                                    <button
                                      type="button"
                                      data-testid={`reimport-hymn-btn-${edScore.id}`}
                                      onClick={() =>
                                        triggerReimportFilePicker(
                                          edScore.id,
                                          edScore.title
                                        )
                                      }
                                      title={`Substituir MusicXML (${edLabel})`}
                                      className={`px-1.5 py-1 border-l text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                                        isSelected
                                          ? 'border-white/20 text-amber-300 hover:bg-white/10'
                                          : 'border-zinc-300/80 text-blue-700 hover:bg-blue-50'
                                      }`}
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                      <span className="hidden md:inline">MusicXML</span>
                                    </button>

                                    <button
                                      type="button"
                                      data-testid={`edit-hymn-metadata-btn-${edScore.id}`}
                                      onClick={() => openMetadataEditor(edScore)}
                                      title={`Editar metadados (${edLabel})`}
                                      className={`px-1 py-1 border-l cursor-pointer ${
                                        isSelected
                                          ? 'border-white/20 text-zinc-300 hover:text-white'
                                          : 'border-zinc-300/80 text-zinc-500 hover:text-zinc-900'
                                      }`}
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>

                                    {edScore.hasAdminOverride &&
                                      !edScore.isCustomCreated && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            onRestoreDefaultScore(edScore.id);
                                            showTemporaryFeedback(
                                              `Edição ${edLabel} restaurada.`
                                            );
                                          }}
                                          title="Restaurar padrão"
                                          className="px-1 py-1 text-zinc-400 hover:text-zinc-900 cursor-pointer"
                                        >
                                          <RotateCcw className="w-3 h-3" />
                                        </button>
                                      )}

                                    {inlineConfirmKey === delHymnKey ? (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-50 text-red-900 text-[10px] font-bold rounded-r-lg">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            onDeleteCustomScore(edScore.id);
                                            setInlineConfirmKey(null);
                                            showTemporaryFeedback(
                                              `Edição ${edLabel} removida.`
                                            );
                                          }}
                                          className="px-1 rounded bg-red-600 text-white cursor-pointer"
                                        >
                                          Sim
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setInlineConfirmKey(null)}
                                          className="px-1 text-zinc-600 cursor-pointer"
                                        >
                                          Não
                                        </button>
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setInlineConfirmKey(delHymnKey)}
                                        title="Excluir edição"
                                        className="px-1 py-1 text-red-500 hover:text-red-700 cursor-pointer"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ============================================================== */}
          {/* TAB 3: NOVA IMPORTAÇÃO MUSICXML (Exclusivo Administrador)      */}
          {/* ============================================================== */}
          {mainTab === 'new-import' && isEffectiveAdmin && (
            <form
              onSubmit={handleCreateNewImportedScore}
              data-testid="admin-new-xml-import-form"
              className="max-w-2xl mx-auto space-y-5 py-2"
            >
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-bold text-zinc-900">
                    Importar Nova Lição do MSA ou Hino via MusicXML
                  </h3>
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Auto-detecção de compasso, BPM e clave
                  </span>
                </div>

                {autoDetectedNotice && (
                  <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium flex items-center justify-between">
                    <span>{autoDetectedNotice}</span>
                    <button
                      type="button"
                      onClick={() => setAutoDetectedNotice(null)}
                      className="text-blue-700 font-bold cursor-pointer ml-2"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Destino: MSA vs Hinário 5 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Coleção de Destino
                    </label>
                    <select
                      value={newCollection}
                      onChange={(e) =>
                        setNewCollection(e.target.value as 'msa' | 'hinario5')
                      }
                      className="w-full h-9 px-3 rounded-lg border border-zinc-300 bg-white text-xs font-medium text-zinc-800"
                    >
                      <option value="msa">MSA — Método Simplificado (Lições 1 a 113)</option>
                      <option value="hinario5">Hinário 5 CCB (Hinos 1 a 480)</option>
                    </select>
                  </div>

                  {newCollection === 'msa' ? (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Modalidade da Lição do MSA
                      </label>
                      <select
                        value={newMsaPhase}
                        onChange={(e) =>
                          setNewMsaPhase(e.target.value as MsaPhaseCategory)
                        }
                        className="w-full h-9 px-3 rounded-lg border border-zinc-300 bg-white text-xs font-medium text-zinc-800"
                      >
                        <option value="solfejo">
                          Solfejo (3 Claves: Clave de Sol, Clave de Dó, Clave de Fá)
                        </option>
                        <option value="ritmica">
                          Leitura Rítmica (Sem Clave e Sem Pentagrama)
                        </option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Edição do Hinário
                      </label>
                      <select
                        value={newEdition}
                        onChange={(e) =>
                          setNewEdition(e.target.value as HymnalEdition)
                        }
                        className="w-full h-9 px-3 rounded-lg border border-zinc-300 bg-white text-xs font-medium text-zinc-800"
                      >
                        {EDITION_OPTIONS.map((ed) => (
                          <option key={ed.value} value={ed.value}>
                            {ed.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Número, Título, Compasso e BPM */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      {newCollection === 'msa' ? 'Nº da Lição' : 'Nº do Hino'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={480}
                      value={newNumber}
                      onChange={(e) => setNewNumber(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-lg border border-zinc-300 bg-white text-xs font-mono"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-1">
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Compasso
                    </label>
                    <select
                      value={newTimeSignature}
                      onChange={(e) => setNewTimeSignature(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono"
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
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Andamento (BPM)
                    </label>
                    <input
                      type="number"
                      min={30}
                      max={240}
                      value={newBpm}
                      onChange={(e) => setNewBpm(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-lg border border-zinc-300 bg-white text-xs font-mono"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Título (Opcional)
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder={
                        newCollection === 'msa'
                          ? `Ex.: MSA Lição ${newNumber}`
                          : `Ex.: Hino ${newNumber}`
                      }
                      className="w-full h-9 px-3 rounded-lg border border-zinc-300 bg-white text-xs"
                    />
                  </div>
                </div>

                {/* Upload de Arquivos MusicXML */}
                {newCollection === 'msa' && newMsaPhase === 'solfejo' ? (
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="block text-xs font-bold text-zinc-800">
                        Arquivos MusicXML para as 3 Claves Oficiais (Sol, Dó e Fá)
                      </label>
                      <label className="px-2.5 py-1 rounded-lg bg-zinc-200/80 hover:bg-zinc-300 text-zinc-800 text-[11px] font-semibold cursor-pointer flex items-center gap-1">
                        <FileUp className="w-3 h-3" />
                        <span>Selecionar múltiplos arquivos de uma vez</span>
                        <input
                          type="file"
                          multiple
                          accept=".xml,.musicxml"
                          onChange={(e) => {
                            if (e.target.files) {
                              void handleBatchClefFiles(e.target.files);
                            }
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {MSA_OFFICIAL_CLEFS.map((clefOpt) => {
                        const uploaded = newClefXmls[clefOpt.value];
                        return (
                          <label
                            key={clefOpt.value}
                            className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-2 cursor-pointer transition-colors ${
                              uploaded
                                ? 'border-emerald-400 bg-emerald-50/50'
                                : 'border-zinc-300 bg-white hover:bg-zinc-50'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-zinc-900">
                                {clefOpt.label}
                              </div>
                              <div className="text-[11px] text-zinc-500">
                                {clefOpt.staffLineLabel} · {clefOpt.referenceNoteName}
                              </div>
                            </div>
                            <div className="text-[11px] font-medium truncate text-blue-700 flex items-center gap-1">
                              <FileUp className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">
                                {uploaded ? uploaded.name : 'Selecionar .musicxml'}
                              </span>
                            </div>
                            <input
                              type="file"
                              accept=".xml,.musicxml"
                              onChange={(e) => handleNewClefFileChange(clefOpt.value, e)}
                              className="hidden"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-bold text-zinc-800">
                      Arquivo MusicXML (.musicxml ou .xml)
                    </label>
                    <label className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-dashed border-zinc-300 bg-white hover:bg-zinc-50 cursor-pointer">
                      <div className="flex items-center gap-2.5 text-xs">
                        <FileUp className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="font-medium text-zinc-800">
                          {newSingleXml
                            ? `Arquivo carregado: ${newSingleXml.name}`
                            : 'Clique para selecionar o arquivo .musicxml ou .xml'}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 text-[11px] font-semibold">
                        Procurar...
                      </span>
                      <input
                        type="file"
                        accept=".xml,.musicxml"
                        onChange={handleNewSingleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {formError && (
                  <div
                    role="alert"
                    className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium"
                  >
                    {formError}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMainTab('msa')}
                    className="px-4 py-2 rounded-lg border border-zinc-300 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    data-testid="submit-new-xml-import-btn"
                    className="px-4 py-2 rounded-lg bg-[#2B2C30] hover:bg-black text-white text-xs font-semibold cursor-pointer"
                  >
                    Salvar no Catálogo
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
