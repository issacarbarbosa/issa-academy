import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScreenWakeLock } from './useScreenWakeLock';

describe('useScreenWakeLock', () => {
  let mockRelease: ReturnType<typeof vi.fn>;
  let mockRequest: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRelease = vi.fn().mockResolvedValue(undefined);
    mockRequest = vi.fn().mockResolvedValue({
      released: false,
      release: mockRelease,
      addEventListener: vi.fn(),
    });

    Object.defineProperty(navigator, 'wakeLock', {
      configurable: true,
      writable: true,
      value: {
        request: mockRequest,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    const fallbackVideo = document.querySelector('[data-testid="screen-wakelock-fallback-video"]');
    if (fallbackVideo?.parentNode) {
      fallbackVideo.parentNode.removeChild(fallbackVideo);
    }
  });

  it('requests screen wake lock and mounts fallback video when player becomes active, and releases when paused', async () => {
    const { rerender, unmount } = renderHook(
      ({ active }) => useScreenWakeLock(active),
      { initialProps: { active: false } }
    );

    expect(mockRequest).not.toHaveBeenCalled();

    // Activate player (isPlaying = true)
    await act(async () => {
      rerender({ active: true });
    });

    expect(mockRequest).toHaveBeenCalledWith('screen');
    expect(document.querySelector('[data-testid="screen-wakelock-fallback-video"]')).not.toBeNull();

    // Pause player (isPlaying = false)
    await act(async () => {
      rerender({ active: false });
    });

    expect(mockRelease).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('gracefully falls back to inline micro-video when navigator.wakeLock.request is blocked by iframe permissions policy', async () => {
    mockRequest.mockRejectedValueOnce(new Error('NotAllowedError: disallowed by permissions policy'));

    const { result, unmount } = renderHook(() => useScreenWakeLock(false));

    await act(async () => {
      await result.current.acquireWakeLock();
    });

    expect(mockRequest).toHaveBeenCalledWith('screen');
    const videoEl = document.querySelector('[data-testid="screen-wakelock-fallback-video"]') as HTMLVideoElement | null;
    expect(videoEl).not.toBeNull();
    expect(videoEl?.muted).toBe(false);
    expect(videoEl?.loop).toBe(true);
    expect(videoEl?.querySelectorAll('source').length).toBe(2);

    unmount();
  });
});
