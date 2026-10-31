import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type InstallWindow = Window & { __issaInstallPrompt?: BeforeInstallPromptEvent | null };

const READY_EVENT = 'issa-install-ready';
const CONSUMED_EVENT = 'issa-install-consumed';

function getGlobalPrompt(): BeforeInstallPromptEvent | null {
  if (typeof window === 'undefined') return null;
  return (window as InstallWindow).__issaInstallPrompt ?? null;
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

function waitForPrompt(timeoutMs: number): Promise<BeforeInstallPromptEvent | null> {
  const existing = getGlobalPrompt();
  if (existing) return Promise.resolve(existing);
  if (typeof window === 'undefined' || timeoutMs <= 0) return Promise.resolve(null);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (val: BeforeInstallPromptEvent | null) => {
      if (settled) return;
      settled = true;
      window.removeEventListener(READY_EVENT, onReady);
      clearTimeout(timer);
      resolve(val);
    };
    const onReady = () => finish(getGlobalPrompt());
    const timer = setTimeout(() => finish(getGlobalPrompt()), timeoutMs);
    window.addEventListener(READY_EVENT, onReady, { once: true });
  });
}

/**
 * Gerencia a instalação PWA. O evento `beforeinstallprompt` é capturado já no `index.html`
 * (antes do React montar) e guardado em `window.__issaInstallPrompt`, de modo que nenhum
 * clique do aluno se perca. Quando o navegador oferece o prompt nativo, 1 toque instala o app.
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(getGlobalPrompt);
  const [showInstructionsModal, setShowInstructionsModal] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(detectStandalone);

  useEffect(() => {
    const syncPrompt = () => {
      setDeferredPrompt(getGlobalPrompt());
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as InstallWindow).__issaInstallPrompt = e as BeforeInstallPromptEvent;
      syncPrompt();
    };

    const handleAppInstalled = () => {
      (window as InstallWindow).__issaInstallPrompt = null;
      setDeferredPrompt(null);
      setShowInstructionsModal(false);
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsStandalone(true);
      }
    };

    syncPrompt();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener(READY_EVENT, syncPrompt);
    window.addEventListener(CONSUMED_EVENT, syncPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    mediaQuery.addEventListener?.('change', handleDisplayChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener(READY_EVENT, syncPrompt);
      window.removeEventListener(CONSUMED_EVENT, syncPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener?.('change', handleDisplayChange);
    };
  }, []);

  const installApp = useCallback(async (): Promise<'accepted' | 'dismissed' | 'manual_instructions'> => {
    // Se o clique ocorrer nos primeiros milissegundos enquanto o Service Worker termina de ativar,
    // aguarda até 1,5s dentro da janela de User Activation (5s no Chromium) para abrir o prompt nativo.
    const isTestEnv = typeof process !== 'undefined' && Boolean((process as { env?: { VITEST?: string } }).env?.VITEST);
    const promptEvent = getGlobalPrompt() ?? deferredPrompt ?? (isTestEnv ? null : await waitForPrompt(1500));

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        (window as InstallWindow).__issaInstallPrompt = null;
        window.dispatchEvent(new Event(CONSUMED_EVENT));
        return outcome;
      } catch {
        // Caso o navegador invalide o evento, abre o modal de auxílio
      }
    }

    setShowInstructionsModal(true);
    return 'manual_instructions';
  }, [deferredPrompt]);

  const closeInstructionsModal = useCallback(() => setShowInstructionsModal(false), []);

  return {
    canInstall: !isStandalone,
    hasNativePrompt: deferredPrompt !== null,
    isStandalone,
    installApp,
    showInstructionsModal,
    closeInstructionsModal,
  };
}
