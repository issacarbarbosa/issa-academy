import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePwaInstall } from './usePwaInstall';

describe('usePwaInstall hook', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('initially returns canInstall: true in regular browser tabs', () => {
    const { result } = renderHook(() => usePwaInstall());
    expect(result.current.canInstall).toBe(true);
    expect(result.current.isStandalone).toBe(false);
  });

  it('triggers native prompt when beforeinstallprompt is available', async () => {
    const { result } = renderHook(() => usePwaInstall());

    const mockPromptEvent = new Event('beforeinstallprompt') as any;
    mockPromptEvent.prompt = vi.fn().mockResolvedValue(undefined);
    mockPromptEvent.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });

    act(() => {
      window.dispatchEvent(mockPromptEvent);
    });

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.installApp();
    });

    expect(outcome).toBe('accepted');
  });

  it('shows instructions modal when installApp is called without deferredPrompt', async () => {
    const { result } = renderHook(() => usePwaInstall());

    expect(result.current.showInstructionsModal).toBe(false);

    await act(async () => {
      await result.current.installApp();
    });

    expect(result.current.showInstructionsModal).toBe(true);

    act(() => {
      result.current.closeInstructionsModal();
    });

    expect(result.current.showInstructionsModal).toBe(false);
  });

  it('hides canInstall if app is running in standalone mode (installed app)', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('display-mode: standalone'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => usePwaInstall());
    expect(result.current.isStandalone).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });
});
