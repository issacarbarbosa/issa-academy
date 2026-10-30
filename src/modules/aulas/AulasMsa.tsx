import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { contentStore } from '../../core/services/contentStore';
import { MsaLesson, LessonBlock } from './types';
import { useAdmin } from '../../core/contexts/AdminContext';
import { getAssetUrl } from '../../core/utils/paths';
import {
  BookOpen,
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award,
  Video,
  Edit3,
  Plus,
  Trash2,
  Save,
  X,
} from 'lucide-react';

export const AulasMsa: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin, mode } = useAdmin();

  const [selectedPeriodo, setSelectedPeriodo] = useState<number>(1);
  const [selectedFase, setSelectedFase] = useState<number>(1);
  const [lessons, setLessons] = useState<MsaLesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<MsaLesson | null>(null);
  const [editingLesson, setEditingLesson] = useState<MsaLesson | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inicializa fase via search param se presente
  useEffect(() => {
    const faseParam = searchParams.get('fase');
    if (faseParam) {
      const f = parseInt(faseParam, 10);
      if (f >= 1 && f <= 16) {
        setSelectedFase(f);
        if (f <= 3) setSelectedPeriodo(1);
        else if (f <= 5) setSelectedPeriodo(2);
        else if (f <= 9) setSelectedPeriodo(3);
        else setSelectedPeriodo(4);
      }
    }
  }, [searchParams]);

  // Carrega lições concluídas do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('issa_completed_lessons_v1');
      if (stored) setCompletedIds(JSON.parse(stored));
    } catch {
      // Ignora
    }
  }, []);

  // Carrega lições da fase selecionada
  useEffect(() => {
    setIsLoading(true);
    contentStore.getLessons(selectedFase).then((list) => {
      setLessons(list);
      if (list.length > 0) {
        setActiveLesson(list[0]);
      } else {
        setActiveLesson(null);
      }
      setIsLoading(false);
    });
  }, [selectedFase]);

  const toggleLessonComplete = (lessonId: string) => {
    let updated: string[];
    if (completedIds.includes(lessonId)) {
      updated = completedIds.filter((id) => id !== lessonId);
    } else {
      updated = [...completedIds, lessonId];
    }
    setCompletedIds(updated);
    localStorage.setItem('issa_completed_lessons_v1', JSON.stringify(updated));
  };

  const getFasesForPeriodo = (p: number) => {
    if (p === 1) return [1, 2, 3];
    if (p === 2) return [4, 5];
    if (p === 3) return [6, 7, 8, 9];
    return [10, 11, 12, 13, 14, 15, 16];
  };

  const getFaseTitle = (f: number) => {
    const titles: { [k: number]: string } = {
      1: 'Música e Som',
      2: 'Figuras e Ritmo',
      3: 'O Endecagrama',
      4: 'Ligaduras e Ponto',
      5: 'Compassos Compostos',
      6: 'Semitons e Escalas',
      7: 'Armaduras de Clave',
      8: 'Tonalidades Maiores',
      9: 'Barras de Repetição',
      10: 'Dinâmica Natural',
      11: 'Acento Métrico',
      12: 'Síncopa e Contratempo',
      13: 'Ritmos Iniciais',
      14: 'Subdivisão Rítmica',
      15: 'Andamento & Modificações',
      16: 'Fraseologia & Expressão',
    };
    return titles[f] || `Fase ${f}`;
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 animate-in fade-in duration-300">
      {/* ==================== TOPO DO MÓDULO ==================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b-2 border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-wider rounded-lg border border-amber-300">
              Método MSA Oficial CCB
            </span>
            <span className="text-slate-400 text-xs font-bold">• Trilha de Aulas</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1a3c5a] tracking-tight flex items-center gap-2.5">
            <BookOpen className="text-indigo-600" size={28} />
            Aulas & Lições Teóricas
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Estude cada conceito passo a passo com videoaulas oficiais do canal @issacarbarbosa e resumos didáticos do Fufu.
          </p>
        </div>

        {/* Botão de Atalho para o Simulado desta Fase */}
        <button
          onClick={() => navigate(`/simulado?fase=${selectedFase}`)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#58cc02] hover:bg-[#46a302] text-white font-black text-sm rounded-2xl shadow-md border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all cursor-pointer shrink-0"
        >
          <span>🎯 Treinar Fase {selectedFase} no Simulado</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* ==================== SELETOR DE PERÍODOS (1 A 4) ==================== */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {[1, 2, 3, 4].map((p) => (
          <button
            key={p}
            onClick={() => {
              setSelectedPeriodo(p);
              const firstFase = getFasesForPeriodo(p)[0];
              setSelectedFase(firstFase);
            }}
            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border-2 ${
              selectedPeriodo === p
                ? 'bg-[#1a3c5a] text-white border-[#1a3c5a] shadow-md shadow-indigo-100'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {p}º Período (Fases {getFasesForPeriodo(p)[0]} a {getFasesForPeriodo(p).slice(-1)[0]})
          </button>
        ))}
      </div>

      {/* ==================== SELETOR DE FASES ==================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 mb-8">
        {getFasesForPeriodo(selectedPeriodo).map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFase(f)}
            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
              selectedFase === f
                ? 'bg-indigo-50/80 border-indigo-600 shadow-md ring-2 ring-indigo-200'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-[10px] font-black uppercase text-indigo-700">Fase {f}</span>
              {lessons.some((l) => completedIds.includes(l.id)) && (
                <CheckCircle2 size={13} className="text-emerald-500" />
              )}
            </div>
            <div className="text-xs font-black text-slate-800 line-clamp-2 leading-tight">
              {getFaseTitle(f)}
            </div>
          </button>
        ))}
      </div>

      {/* ==================== WORKSPACE PRINCIPAL DA LIÇÃO ==================== */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-400 font-extrabold text-sm gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
          <span>Carregando lições da Fase {selectedFase}...</span>
        </div>
      ) : lessons.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center">
          <p className="text-base font-bold text-slate-600 mb-2">Nenhuma lição cadastrada nesta fase ainda.</p>
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="mt-3 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs cursor-pointer shadow"
            >
              Adicionar Lição pelo Painel Admin
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ==================== LISTA LATERAL DE LIÇÕES ==================== */}
          <div className="lg:col-span-4 bg-[#f7f9fa] rounded-3xl p-4 border-2 border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Lições da Fase {selectedFase} ({lessons.length})
              </h2>
              {isAdmin && mode === 'edicao' && (
                <button
                  onClick={() => {
                    const newId = `fase_${String(selectedFase).padStart(2, '0')}_licao_${Date.now()}`;
                    setEditingLesson({
                      id: newId,
                      periodo: (selectedFase <= 3 ? 1 : selectedFase <= 5 ? 2 : selectedFase <= 9 ? 3 : 4) as 1 | 2 | 3 | 4,
                      fase: selectedFase,
                      ordem: lessons.length + 1,
                      topico: `${selectedFase}.${lessons.length + 1}`,
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
                  data-testid="aulas-inline-new-lesson-btn"
                  className="flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-300 cursor-pointer"
                >
                  <Plus size={12} /> Nova Lição
                </button>
              )}
            </div>

            <div className="space-y-2">
              {lessons.map((lesson) => {
                const isSelected = activeLesson?.id === lesson.id;
                const isDone = completedIds.includes(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-100'
                        : 'bg-white/70 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                            : isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isDone ? <CheckCircle2 size={16} /> : lesson.topico}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 line-clamp-1">
                          {lesson.titulo}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {lesson.youtubeVideoId && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600">
                              <Video size={10} /> Vídeo
                            </span>
                          )}
                          <span className="text-[10px] font-medium text-slate-400">
                            {lesson.blocos.length} tópicos
                          </span>
                        </div>
                      </div>
                    </div>

                    <PlayCircle
                      size={18}
                      className={isSelected ? 'text-indigo-600' : 'text-slate-300'}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ==================== VISUALIZADOR DA LIÇÃO SELECIONADA ==================== */}
          {activeLesson && (
            <div className="lg:col-span-8 bg-white rounded-3xl border-2 border-slate-200 p-6 md:p-8 shadow-sm">
              {/* Cabeçalho da Lição */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-black rounded-lg uppercase">
                      Tópico {activeLesson.topico}
                    </span>
                    <span className="text-slate-400 text-xs font-semibold">
                      Fase {activeLesson.fase}
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-[#1a3c5a] tracking-tight">
                    {activeLesson.titulo}
                  </h2>
                </div>

                {/* Ações do Topo da Lição: Editar In-Loco (Admin) + Marcar como Concluída */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {isAdmin && mode === 'edicao' && (
                    <button
                      type="button"
                      data-testid="aulas-inline-edit-lesson-btn"
                      onClick={() => setEditingLesson({ ...activeLesson })}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs shadow-sm cursor-pointer"
                    >
                      <Edit3 size={14} />
                      <span>✏️ Editar Lição</span>
                    </button>
                  )}

                  <button
                    onClick={() => toggleLessonComplete(activeLesson.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer shrink-0 ${
                      completedIds.includes(activeLesson.id)
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
                        : 'bg-[#f7f9fa] hover:bg-slate-100 text-slate-600 border border-slate-300'
                    }`}
                  >
                    <CheckCircle2 size={16} />
                    <span>
                      {completedIds.includes(activeLesson.id)
                        ? 'Concluída ✓'
                        : 'Marcar como Concluída'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Resumo da Lição */}
              {activeLesson.resumo && (
                <div className="bg-slate-50 border-l-4 border-indigo-500 p-4 rounded-r-2xl mb-6 text-sm text-slate-700 font-medium">
                  {activeLesson.resumo}
                </div>
              )}

              {/* Player do YouTube Embutido (Se houver) */}
              {activeLesson.youtubeVideoId && /^[a-zA-Z0-9_-]{11}$/.test(activeLesson.youtubeVideoId) && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Video size={16} className="text-red-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                      Videoaula Oficial do Canal @issacarbarbosa
                    </span>
                  </div>
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-md aspect-video bg-black border-2 border-slate-200">
                    <iframe
                      src={`https://www.youtube.com/embed/${activeLesson.youtubeVideoId}?rel=0`}
                      title={activeLesson.titulo}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                </div>
              )}

              {/* Blocos Modulares de Conteúdo Didático */}
              <div className="space-y-6">
                {activeLesson.blocos.map((bloco, idx) => {
                  if (bloco.type === 'fufu_tip') {
                    return (
                      <div
                        key={bloco.id || idx}
                        className="bg-amber-50/80 border-2 border-amber-300/80 rounded-2xl p-5 flex items-start gap-4 shadow-sm"
                      >
                        <img
                          src={getAssetUrl('assets/fufu-acerto-joinha.png')}
                          alt="Fufu"
                          className="w-14 h-14 object-contain shrink-0 drop-shadow-sm"
                        />
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 mb-1 flex items-center gap-1.5">
                            <Sparkles size={14} className="text-amber-600" />
                            {bloco.title || 'Dica do Fufu 🎶'}
                          </h4>
                          <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                            {bloco.content}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  if (bloco.type === 'msa_rule') {
                    return (
                      <div
                        key={bloco.id || idx}
                        className="bg-indigo-50/70 border-2 border-indigo-200 rounded-2xl p-5 flex items-start gap-3.5"
                      >
                        <Award size={20} className="text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900 mb-1">
                            {bloco.title || 'Regra Oficial do MSA'}
                          </h4>
                          <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                            {bloco.content}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  // Bloco padrão de Texto
                  return (
                    <div key={bloco.id || idx} className="prose prose-slate max-w-none">
                      {bloco.title && (
                        <h4 className="text-base font-black text-[#1a3c5a] mb-2">{bloco.title}</h4>
                      )}
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                        {bloco.content}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Rodapé da Lição: Treinar no Simulado */}
              <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6 rounded-b-3xl">
                <div className="flex items-center gap-3">
                  <img
                    src={getAssetUrl('assets/fufu-capa-simulado.png')}
                    alt="Simulado"
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                    <h5 className="text-xs font-black text-slate-800">Pronto para testar?</h5>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Responda às questões da Fase {selectedFase} no Simulado Oficial.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/simulado?fase=${selectedFase}`)}
                  className="w-full sm:w-auto px-6 py-3 bg-[#58cc02] hover:bg-[#46a302] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md border-b-4 border-green-700 active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  Iniciar Simulado da Fase {selectedFase} →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Edição In-Loco de Lição (Quando Admin está com Modo Edição ativo) */}
      {editingLesson && (
        <div
          data-testid="aulas-inline-edit-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              type="button"
              onClick={() => setEditingLesson(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-black text-[#1a3c5a] mb-4">
              Editar Lição na Tela (Fase {editingLesson.fase})
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
                  data-testid="aulas-edit-title-input"
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

              {/* Blocos */}
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
                          content: 'Dica amigável do mascote...',
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
                          content: 'Regra oficial do MSA...',
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
                          updatedBlocos[bIdx] = { ...updatedBlocos[bIdx], title: e.target.value };
                          setEditingLesson({ ...editingLesson, blocos: updatedBlocos });
                        }}
                        placeholder="Título do bloco"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold mb-2 bg-white"
                      />
                      <textarea
                        value={bloco.content}
                        onChange={(e) => {
                          const updatedBlocos = [...editingLesson.blocos];
                          updatedBlocos[bIdx] = { ...updatedBlocos[bIdx], content: e.target.value };
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
                  data-testid="aulas-save-lesson-btn"
                  onClick={async () => {
                    await contentStore.saveLesson(editingLesson);
                    const updatedList = await contentStore.getLessons(selectedFase);
                    setLessons(updatedList);
                    const refreshed =
                      updatedList.find((l) => l.id === editingLesson.id) ?? editingLesson;
                    setActiveLesson(refreshed);
                    setEditingLesson(null);
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
  );
};
