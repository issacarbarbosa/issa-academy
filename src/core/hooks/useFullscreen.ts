import { useState, useEffect, useCallback, RefObject } from 'react';

interface UseFullscreenOptions {
  /** Se verdadeiro, tenta travar a orientação em paisagem (landscape) ao entrar em tela cheia no mobile */
  lockLandscape?: boolean;
}

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
}

interface FullscreenHTMLElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
}

/**
 * Hook utilitário para gerenciar Tela Cheia (Fullscreen API + fallback CSS imersivo)
 * ocultando barras externas do navegador e a barra inferior do Google AI Studio no mobile.
 */
export function useFullscreen(
  targetRef: RefObject<HTMLElement | null>,
  options?: UseFullscreenOptions,
) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const triggerResizeRecalc = useCallback(() => {
    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 250);
  }, []);

  useEffect(() => {
    const doc = document as FullscreenDocument;
    const handleFullscreenChange = () => {
      const fsElement = doc.fullscreenElement || doc.webkitFullscreenElement || null;
      setIsFullscreen(Boolean(fsElement));
      triggerResizeRecalc();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [triggerResizeRecalc]);

  const exitFullscreen = useCallback(async () => {
    const doc = document as FullscreenDocument;
    try {
      if (doc.fullscreenElement && doc.exitFullscreen) {
        await doc.exitFullscreen();
      } else if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen();
      }
    } catch {
      // Fallback silencioso caso o navegador bloqueie exitFullscreen
    }

    if (options?.lockLandscape) {
      try {
        const orientation = screen.orientation as ScreenOrientation & { unlock?: () => void };
        orientation?.unlock?.();
      } catch {
        // Ignora em navegadores sem suporte a ScreenOrientation.unlock
      }
    }

    setIsFullscreen(false);
    triggerResizeRecalc();
  }, [options?.lockLandscape, triggerResizeRecalc]);

  const toggleFullscreen = useCallback(async () => {
    const doc = document as FullscreenDocument;
    const hasHardwareFullscreen = Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);

    if (hasHardwareFullscreen || isFullscreen) {
      await exitFullscreen();
      return;
    }

    const target = (targetRef.current || document.documentElement) as FullscreenHTMLElement;
    setIsFullscreen(true);

    try {
      if (target.requestFullscreen) {
        await target.requestFullscreen({ navigationUI: 'hide' });
      } else if (target.webkitRequestFullscreen) {
        await target.webkitRequestFullscreen();
      }
    } catch {
      // Fallback CSS imersivo já está ativo via setIsFullscreen(true)
    }

    if (options?.lockLandscape) {
      try {
        const orientation = screen.orientation as ScreenOrientation & {
          lock?: (mode: string) => Promise<void>;
        };
        await orientation?.lock?.('landscape');
      } catch {
        // Ignora quando o dispositivo não suporta trava programática de rotação
      }
    }

    triggerResizeRecalc();
  }, [exitFullscreen, isFullscreen, options?.lockLandscape, targetRef, triggerResizeRecalc]);

  return {
    isFullscreen,
    toggleFullscreen,
    exitFullscreen,
  };
}
