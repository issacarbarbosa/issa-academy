import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { initAudio, playLevelUpFanfare, playRewardChord, playError } from '../../core/utils/audio';
import { getAssetUrl } from '../../core/utils/paths';
import { useLocalStorage } from '../../core/hooks/useLocalStorage';
import {
  FloatText,
  GameParticle,
  GameNote,
  drawStar,
  NOTE_COLORS,
  NOTE_BORDER_COLORS,
  NOTE_DARK_COLORS,
  POS_TO_FREQ,
  PROGRESSION_LIST,
  MUSICAL_KEYS,
  getNewlyUnlockedNote,
} from './engine/gameEntities';

interface MestreDaClaveProps {
  onBack?: () => void;
}

export function MestreDaClave({ onBack }: MestreDaClaveProps) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate('/'));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Estados do Jogo
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'>('START');
  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [pausesLeft, setPausesLeft] = useState<number>(3);
  const [hitsInLevel, setHitsInLevel] = useState<number>(0);
  const [highScore, setHighScore] = useLocalStorage<number>('mestreClave_record', 0);
  const [showRedFlash, setShowRedFlash] = useState<boolean>(false);
  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);

  // Parâmetros dinâmicos de velocidade e spawn
  const [activeSpeed, setActiveSpeed] = useState<number>(150);
  const [spawnInterval, setSpawnInterval] = useState<number>(2000);

  // Refs de estado para acesso no loop de 60fps sem recriar o requestAnimationFrame
  const levelRef = useRef<number>(level);
  levelRef.current = level;
  const activeSpeedRef = useRef<number>(activeSpeed);
  activeSpeedRef.current = activeSpeed;
  const spawnIntervalRef = useRef<number>(spawnInterval);
  spawnIntervalRef.current = spawnInterval;
  const hitsInLevelRef = useRef<number>(hitsInLevel);
  hitsInLevelRef.current = hitsInLevel;

  // Refs de entidades
  const notesRef = useRef<GameNote[]>([]);
  const particlesRef = useRef<GameParticle[]>([]);
  const floatTextsRef = useRef<FloatText[]>([]);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const animationIdRef = useRef<number>(0);
  const shakeIntensityRef = useRef<number>(0);

  const handleRewardChord = useCallback((pos: number) => {
    const rootFreq = POS_TO_FREQ[pos];
    if (rootFreq) {
      playRewardChord(rootFreq);
    }
  }, []);

  const spawnParticles = useCallback((x: number, y: number, color: string) => {
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 260 + 100;
      const speedX = Math.cos(angle) * speed;
      const speedY = Math.sin(angle) * speed - 80;
      const decay = Math.random() * 0.5 + 0.6;
      particlesRef.current.push(new GameParticle(x, y, color, speedX, speedY, decay, 380));
    }
  }, []);

  const spawnConfetti = useCallback(() => {
    if (!canvasRef.current) return;
    const spawnWidth = canvasRef.current.clientWidth || 800;
    const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * spawnWidth;
      const y = -10 - Math.random() * 50;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const speedX = Math.random() * 160 - 80;
      const speedY = Math.random() * 240 + 120;
      const decay = Math.random() * 0.3 + 0.3;
      particlesRef.current.push(new GameParticle(x, y, color, speedX, speedY, decay, 180));
    }
  }, []);

  const showFloatText = useCallback((x: number, y: number, text: string, color: string) => {
    floatTextsRef.current.push({
      x,
      y,
      text,
      color,
      life: 1.0,
      speedY: -75,
    });
  }, []);

  // Processa clique de nota
  const inputNote = useCallback(
    (base: string) => {
      if (gameState !== 'PLAYING' || !canvasRef.current) return;

      const height = canvasRef.current.clientHeight || canvasRef.current.height;
      const staffCenterY = height / 2;
      const lineGap = Math.min(height / 10, 24);
      const hitZoneStart = 90;
      const hitZoneEnd = 320;

      const target = notesRef.current.find((n) => n.x > hitZoneStart && n.x < hitZoneEnd && !n.marked);

      if (target) {
        if (target.baseName === base) {
          setScore((prev) => {
            const next = prev + 10;
            if (next > highScore) {
              setHighScore(next);
            }
            return next;
          });

          const nextHits = hitsInLevelRef.current + 1;
          setHitsInLevel(nextHits);

          handleRewardChord(target.pos);
          target.marked = true;

          const drawY = staffCenterY + (4 - target.pos) * (lineGap / 2);
          spawnParticles(target.x, drawY, target.trueColor);
          showFloatText(target.x, drawY - 30, target.baseName + '!', target.trueColor);
          notesRef.current = notesRef.current.filter((n) => n !== target);

          // Subida de nível ao atingir 10 acertos
          if (nextHits >= 10) {
            setHitsInLevel(0);
            const nextLvl = levelRef.current + 1;
            setLevel(nextLvl);
            setTimeout(() => playLevelUpFanfare(), 220);
            spawnConfetti();

            const newlyUnlocked = getNewlyUnlockedNote(nextLvl);
            let msg = `Nível ${nextLvl}! `;
            if (newlyUnlocked) {
              msg += `Nova Nota: ${newlyUnlocked.label} 🎶`;
            } else {
              msg += `Desafio Máximo de Velocidade! ⚡`;
            }
            setLevelUpMessage(msg);
            setTimeout(() => setLevelUpMessage(null), 3800);

            if (nextLvl <= 12) {
              setActiveSpeed((v) => v + 12);
              setSpawnInterval((v) => Math.max(1000, v - 40));
            }
          }
        } else {
          // Nota errada com feedback pedagógico da nota correta
          playError();
          target.marked = true;
          const drawY = staffCenterY + (4 - target.pos) * (lineGap / 2);
          showFloatText(target.x, drawY - 30, `Era ${target.baseName}!`, '#c0392b');
          target.color = '#e74c3c';

          shakeIntensityRef.current = 15;
          setShowRedFlash(true);
          setTimeout(() => setShowRedFlash(false), 250);

          setLives((prev) => {
            const nextLives = prev - 1;
            if (nextLives <= 0) {
              setGameState('GAMEOVER');
            }
            return nextLives;
          });
        }
      } else {
        // Feedback para clique antecipado antes da nota chegar na zona
        const approaching = notesRef.current.find((n) => n.x >= hitZoneEnd && n.x < hitZoneEnd + 140 && !n.marked);
        if (approaching) {
          showFloatText(hitZoneEnd, staffCenterY - 40, 'Espere na área verde!', '#f59e0b');
        }
      }
    },
    [gameState, highScore, setHighScore, handleRewardChord, spawnParticles, showFloatText, spawnConfetti],
  );

  const handleStartGame = () => {
    initAudio();
    setScore(0);
    setLives(3);
    setLevel(1);
    setPausesLeft(3);
    setHitsInLevel(0);
    setActiveSpeed(150);
    setSpawnInterval(2000);

    notesRef.current = [];
    particlesRef.current = [];
    floatTextsRef.current = [];
    lastTimeRef.current = performance.now();
    spawnTimerRef.current = 0;

    setGameState('PLAYING');
  };

  const handlePauseToggle = useCallback(() => {
    if (gameState === 'PLAYING') {
      if (pausesLeft > 0) {
        setGameState('PAUSED');
        setPausesLeft((prev) => prev - 1);
      }
    } else if (gameState === 'PAUSED') {
      lastTimeRef.current = performance.now();
      setGameState('PLAYING');
    }
  }, [gameState, pausesLeft]);

  // Redimensionamento responsivo do Canvas com suporte a HiDPI (Retina / DPR mobile)
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = Math.round(containerRef.current.clientWidth * dpr);
        canvasRef.current.height = Math.round(containerRef.current.clientHeight * dpr);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [gameState]);

  // Game loop otimizado (dependente apenas de gameState para 60fps sem interrupção de níveis)
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      const dpr = window.devicePixelRatio || 1;
      const logicalWidth = canvas.clientWidth || 800;
      const logicalHeight = canvas.clientHeight || 400;
      const targetWidth = Math.round(logicalWidth * dpr);
      const targetHeight = Math.round(logicalHeight * dpr);

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(dpr, dpr);

      // Aplica tremor de tela em caso de erro
      if (shakeIntensityRef.current > 0) {
        shakeIntensityRef.current = Math.max(0, shakeIntensityRef.current - dt * 35);
        const dx = (Math.random() - 0.5) * shakeIntensityRef.current;
        const dy = (Math.random() - 0.5) * shakeIntensityRef.current;
        ctx.translate(dx, dy);
      }

      const staffCenterY = logicalHeight / 2;
      const lineGap = Math.min(logicalHeight / 10, 24);
      const hitZoneStart = 90;
      const hitZoneEnd = 320;

      // Desenha as 5 linhas da pauta
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      const startY = staffCenterY - 2 * lineGap;
      for (let i = 0; i < 5; i++) {
        const y = startY + i * lineGap;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(logicalWidth, y);
        ctx.stroke();
      }

      // Clave de Sol
      ctx.fillStyle = '#1e293b';
      ctx.font = `${lineGap * 5.5}px Nunito, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('𝄞', 50, staffCenterY + lineGap * 0.8);

      // Zona de acerto
      ctx.fillStyle = 'rgba(34, 197, 94, 0.08)';
      ctx.fillRect(hitZoneStart, 0, hitZoneEnd - hitZoneStart, logicalHeight);
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(hitZoneStart, 0, hitZoneEnd - hitZoneStart, logicalHeight);

      // Spawn de notas
      spawnTimerRef.current += dt * 1000;
      if (spawnTimerRef.current > spawnIntervalRef.current) {
        notesRef.current.push(new GameNote(logicalWidth, levelRef.current));
        spawnTimerRef.current = 0;
      }

      // Atualiza e renderiza partículas
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.update(dt);
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;

          if (p.isStar) {
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            drawStar(ctx, 0, 0, 5, p.size * 1.3, p.size * 0.5);
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // Atualiza e renderiza textos flutuantes
      for (let i = floatTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatTextsRef.current[i];
        ft.y += ft.speedY * dt;
        ft.life -= 0.6 * dt;
        if (ft.life <= 0) {
          floatTextsRef.current.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = ft.life;
          ctx.fillStyle = ft.color;
          ctx.font = 'bold 22px Nunito, sans-serif';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 5;
          ctx.textAlign = 'center';
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.restore();
        }
      }

      // Atualiza e desenha notas com velocidade normalizada por resolução
      const responsiveSpeedMultiplier = Math.max(1, (logicalWidth + 50 - hitZoneEnd) / 574);
      const effectiveSpeed = activeSpeedRef.current * responsiveSpeedMultiplier;

      notesRef.current.forEach((n) => {
        n.x -= effectiveSpeed * dt;

        // Se passar da zona sem marcação, computa erro
        if (n.x < hitZoneStart && !n.marked) {
          n.marked = true;
          playError();
          showFloatText(n.x + 30, staffCenterY + (4 - n.pos) * (lineGap / 2), 'Passou!', '#c0392b');

          shakeIntensityRef.current = 15;
          setShowRedFlash(true);
          setTimeout(() => setShowRedFlash(false), 250);

          setLives((prev) => {
            const nextLives = prev - 1;
            if (nextLives <= 0) {
              setGameState('GAMEOVER');
            }
            return nextLives;
          });
        }

        const y = staffCenterY + (4 - n.pos) * (lineGap / 2);

        // Linhas suplementares desenhadas ANTES da cabeça da nota (não riscam o brilho specular)
        ctx.save();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#475569';
        if (n.pos <= -2) {
          const lineY = staffCenterY + (4 - -2) * (lineGap / 2);
          ctx.beginPath();
          ctx.moveTo(n.x - lineGap * 1.1, lineY);
          ctx.lineTo(n.x + lineGap * 1.1, lineY);
          ctx.stroke();

          if (n.pos === -3) {
            const lineY2 = staffCenterY + (4 - -3) * (lineGap / 2);
            ctx.beginPath();
            ctx.moveTo(n.x - lineGap * 1.1, lineY2);
            ctx.lineTo(n.x + lineGap * 1.1, lineY2);
            ctx.stroke();
          }
        }
        if (n.pos >= 10) {
          const dy = staffCenterY + (4 - 10) * (lineGap / 2);
          ctx.beginPath();
          ctx.moveTo(n.x - lineGap * 1.1, dy);
          ctx.lineTo(n.x + lineGap * 1.1, dy);
          ctx.stroke();
        }
        ctx.restore();

        // Desenho da cabeça da nota com brilho suave
        ctx.save();
        const baseColor = n.color;
        const darkColor = NOTE_DARK_COLORS[n.baseName] || '#1e293b';

        const grad = ctx.createRadialGradient(
          n.x - lineGap * 0.18,
          y - lineGap * 0.15,
          lineGap * 0.05,
          n.x,
          y,
          lineGap * 0.78,
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.18, '#ffffff');
        grad.addColorStop(0.4, baseColor);
        grad.addColorStop(1, darkColor);

        ctx.fillStyle = grad;
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        ctx.beginPath();
        ctx.ellipse(n.x, y, lineGap * 0.75, lineGap * 0.52, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Haste da nota
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = Math.max(2.5, lineGap * 0.13);
        ctx.lineCap = 'round';

        const stemLength = lineGap * 3.1;
        const rxOffset = lineGap * 0.62;
        const ryOffset = lineGap * 0.2;

        ctx.beginPath();
        if (n.pos < 4) {
          ctx.moveTo(n.x + rxOffset, y + ryOffset);
          ctx.lineTo(n.x + rxOffset, y - stemLength);
        } else {
          ctx.moveTo(n.x - rxOffset, y - ryOffset);
          ctx.lineTo(n.x - rxOffset, y + stemLength);
        }
        ctx.stroke();
        ctx.restore();
      });

      notesRef.current = notesRef.current.filter((n) => n.x > -100 && !n.marked);

      ctx.restore();
      animationIdRef.current = requestAnimationFrame(renderLoop);
    };

    animationIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
    };
  }, [gameState, showFloatText]);

  // Atalhos de teclado no Desktop (1 a 7, C a B, e Espaço/Esc para pausa)
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const keyMap: Record<string, string> = {
      '1': 'Dó', 'c': 'Dó', 'C': 'Dó',
      '2': 'Ré', 'd': 'Ré', 'D': 'Ré',
      '3': 'Mi', 'e': 'Mi', 'E': 'Mi',
      '4': 'Fá', 'f': 'Fá', 'F': 'Fá',
      '5': 'Sol', 'g': 'Sol', 'G': 'Sol',
      '6': 'Lá', 'a': 'Lá', 'A': 'Lá',
      '7': 'Si', 'b': 'Si', 'B': 'Si',
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const note = keyMap[e.key];
      if (note) {
        e.preventDefault();
        inputNote(note);
      } else if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        handlePauseToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, inputNote, handlePauseToggle]);

  // Barra de progresso para próximo nível (10 acertos por nível)
  const progressPercent = Math.min(100, (hitsInLevel / 10) * 100);

  // Notas ativas do nível corrente
  const unlockedCount = Math.min(level + 1, PROGRESSION_LIST.length);
  const activeNoteNames = new Set(PROGRESSION_LIST.slice(0, unlockedCount).map((n) => n.base));

  return (
    <div
      className="fixed inset-0 flex flex-col bg-white text-slate-800 font-sans overflow-hidden z-40"
      id="mestre-da-clave-screen"
    >
      {/* XP Bar */}
      <div className="w-full h-3 bg-slate-100 relative z-20">
        <div
          className="h-full bg-[#1cb0f6] transition-all duration-300 shadow-md shadow-sky-500/30"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Header Bar */}
      <div className="flex justify-between items-center px-3 py-1.5 sm:px-4 sm:py-2.5 bg-white border-b border-slate-200 shadow-sm relative z-10">
        <div className="w-8 h-8 sm:w-10 sm:h-10 invisible" />

        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="bg-amber-100 text-amber-800 font-extrabold text-[10px] sm:text-sm px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-amber-200 shadow-sm flex items-center gap-1 sm:gap-1.5">
            ⭐ Nível <span className="text-xs sm:text-base text-amber-600">{level}</span>
          </div>
          <div className="bg-sky-50 text-sky-800 font-extrabold text-[10px] sm:text-sm px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-sky-200 shadow-sm flex items-center gap-1 sm:gap-1.5">
            ⚡ XP <span className="text-xs sm:text-base text-sky-600 font-mono">{hitsInLevel}/10</span>
          </div>
          <div className="bg-indigo-50 text-indigo-800 font-extrabold text-[10px] sm:text-sm px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-indigo-200 shadow-sm flex items-center gap-1 sm:gap-1.5">
            🎯 Pontos <span className="text-xs sm:text-base text-indigo-600">{score}</span>
          </div>
          <div className="bg-red-50 text-red-800 font-extrabold text-[10px] sm:text-sm px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-red-200 shadow-sm flex items-center gap-1 sm:gap-1.5">
            ❤️ Vidas <span className="text-xs sm:text-base text-red-600">{lives}</span>
          </div>
        </div>

        <button
          onClick={handlePauseToggle}
          disabled={gameState !== 'PLAYING'}
          className={`flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-[10px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 min-h-[40px] sm:min-h-[44px] rounded-xl border border-slate-200 transition-all cursor-pointer ${
            gameState !== 'PLAYING' ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <Pause size={12} className="sm:w-3.5 sm:h-3.5" /> <span>Pausa ({pausesLeft})</span>
        </button>
      </div>

      {/* Game/Canvas display container */}
      <div ref={containerRef} className="flex-1 bg-amber-50/20 relative min-h-0">
        <canvas ref={canvasRef} className="block w-full h-full" />

        {/* Sensory Red Flash Overlay */}
        {showRedFlash && (
          <div className="absolute inset-0 bg-red-600/15 pointer-events-none z-30 transition-all duration-100 border-8 border-red-600/35" />
        )}

        {/* LEVEL UP NOTIFICATION BANNER */}
        <AnimatePresence>
          {levelUpMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 40 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="absolute inset-x-0 top-3 mx-auto max-w-sm bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl border border-indigo-500/50 shadow-[0_20px_50px_rgba(99,102,241,0.25)] flex items-center gap-3 z-40 pointer-events-none"
            >
              <img
                src={getAssetUrl('assets/fufu-acerto-joinha.png')}
                alt="Fufu Parabéns"
                className="w-10 h-10 object-contain shrink-0"
              />
              <div className="text-left flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-widest font-black text-amber-400">
                  🎉 Subiu de Nível!
                </div>
                <p className="text-xs sm:text-sm font-bold text-indigo-100 truncate">{levelUpMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OVERLAYS */}

        {/* START SCREEN */}
        {gameState === 'START' && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-50 overflow-y-auto flex flex-col items-center justify-center p-4 py-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl text-center max-w-sm sm:max-w-2xl w-full border-2 border-slate-200 shadow-2xl animate-pop flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center">
              <div className="w-full sm:w-1/2 flex flex-col items-center sm:border-r sm:border-slate-100 sm:pr-6">
                <img
                  src={getAssetUrl('assets/fufu-capa-mestre-da-clave.png')}
                  className="w-20 sm:w-28 h-auto object-contain mx-auto mb-2 drop-shadow-lg"
                  alt="Fufu Mestre da Clave"
                />
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  Mestre da Clave
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 font-bold leading-normal mt-1">
                  Comece com <strong className="text-indigo-600 font-black">Dó e Ré</strong>.<br />
                  Acerte as notas na pauta e suba de nível! 🚀
                </p>
                <div className="mt-3 text-[10px] sm:text-xs text-amber-500 font-black uppercase tracking-wider">
                  🏆 SEU RECORDE: {highScore}
                </div>
              </div>

              <div className="w-full sm:w-1/2 flex flex-col gap-2">
                <button
                  onClick={handleStartGame}
                  className="w-full py-3.5 bg-[#4ade80] hover:bg-[#22c55e] text-white font-extrabold rounded-2xl border-b-4 border-emerald-700 active:border-b-0 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider shadow-md"
                >
                  COMEÇAR
                </button>

                <button
                  onClick={handleBack}
                  className="w-full py-2.5 bg-[#e2e8f0] hover:bg-[#cbd5e1] text-slate-700 font-extrabold rounded-2xl border-b-4 border-slate-400 active:border-b-0 active:translate-y-1 transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
                >
                  VOLTAR AO INÍCIO
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAUSE SCREEN */}
        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 overflow-y-auto flex flex-col items-center justify-center p-4 py-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl text-center max-w-sm sm:max-w-2xl w-full border-2 border-slate-200 shadow-2xl my-auto animate-pop flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center">
              <div className="w-full sm:w-1/2 flex flex-col items-center sm:border-r sm:border-slate-100 sm:pr-6">
                <img
                  src={getAssetUrl('assets/fufu-pensativo.png')}
                  className="w-16 sm:w-24 h-auto object-contain mx-auto mb-2"
                  alt="Fufu Pausado"
                />
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  Jogo Pausado
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 font-bold mt-1">
                  Pausas restantes: <strong className="text-amber-500 font-black">{pausesLeft}</strong>
                </p>
              </div>

              <div className="w-full sm:w-1/2 flex flex-col gap-2">
                <button
                  onClick={handlePauseToggle}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl border-b-4 border-emerald-700 active:border-b-0 transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider shadow-md"
                >
                  Continuar
                </button>

                <button
                  onClick={() => setGameState('START')}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl border-b-4 border-amber-700 active:border-b-0 transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
                >
                  Reiniciar
                </button>

                <button
                  onClick={handleBack}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-2xl border-b-4 border-red-800 active:border-b-0 transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
                >
                  Sair do Jogo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GAME OVER SCREEN */}
        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-50 overflow-y-auto flex flex-col items-center justify-center p-4 py-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl text-center max-w-sm sm:max-w-2xl w-full border-2 border-slate-200 shadow-2xl my-auto animate-pop flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center">
              <div className="w-full sm:w-1/2 flex flex-col items-center sm:border-r sm:border-slate-100 sm:pr-6">
                <img
                  src={getAssetUrl('assets/fufu-erro-acontece.png')}
                  className="w-20 sm:w-28 h-auto object-contain mx-auto mb-2"
                  alt="Fufu Game Over"
                />
                <h2 className="text-lg sm:text-xl font-black text-red-500 leading-tight">
                  Fim de Jogo!
                </h2>
                <div className="text-[10px] text-indigo-500 font-black uppercase tracking-wider mt-2">
                  🏆 Recorde: {highScore} pts
                </div>
              </div>

              <div className="w-full sm:w-1/2 flex flex-col gap-2">
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 shadow-inner">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">
                    Sua Pontuação
                  </p>
                  <div className="text-2xl font-black text-indigo-600">{score}</div>
                  <div className="text-[9px] font-black text-amber-500 mt-1 uppercase">
                    NÍVEL ALCANÇADO: {level}
                  </div>
                </div>

                <button
                  onClick={handleStartGame}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl border-b-4 border-emerald-700 active:border-b-0 transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider shadow-md"
                >
                  Jogar Novamente
                </button>

                <button
                  onClick={handleBack}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold rounded-2xl border-b-4 border-slate-300 active:border-b-0 transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wider"
                >
                  Voltar ao Início
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Piano/Musical buttons footer */}
      {gameState === 'PLAYING' && (
        <div className="p-2 sm:p-4 bg-slate-800 border-t border-slate-700 relative z-10 flex flex-col justify-center animate-fade">
          <div
            className="grid grid-cols-7 gap-1.5 md:gap-3 max-w-3xl w-full mx-auto"
            id="musical-buttons-row"
          >
            {MUSICAL_KEYS.map((note, idx) => {
              const isActive = activeNoteNames.has(note);
              const textColor = note === 'Mi' ? '#b45309' : NOTE_COLORS[note];
              const borderBottomColor = NOTE_BORDER_COLORS[note];

              return (
                <button
                  key={`musical-key-${note}`}
                  onPointerDown={() => inputNote(note)}
                  className={`py-2 sm:py-3.5 md:py-4 min-h-[44px] flex flex-col items-center justify-center border-b-4 font-black rounded-xl transition-all cursor-pointer select-none active:translate-y-1 active:border-b-0 ${
                    isActive
                      ? 'bg-white opacity-100 shadow-md ring-2 ring-white/20 hover:scale-[1.03]'
                      : 'bg-slate-200/90 text-slate-500 border-slate-300 opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    color: isActive ? textColor : undefined,
                    borderBottomColor: isActive ? borderBottomColor : undefined,
                  }}
                  title={isActive ? `Nota ${note} (Ativa no Nível ${level})` : `Nota ${note}`}
                >
                  <span className="text-xs sm:text-sm md:text-lg leading-tight">{note}</span>
                  <span className="hidden md:inline-block text-[10px] font-mono text-slate-400 font-semibold leading-none mt-0.5">
                    [{idx + 1}]
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
