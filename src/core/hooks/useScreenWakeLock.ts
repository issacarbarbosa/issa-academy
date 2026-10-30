import { useCallback, useEffect, useRef } from 'react';

/**
 * Standards-compliant 2-second 32x32 10fps moving-frame video + silent audio track
 * generated via ffmpeg:
 * - MP4: H.264 Constrained Baseline (avc1.42E01E, yuv420p) + AAC-LC (mp4a.40.2) for iOS Safari & mobile WebKit/Chrome
 * - WebM: VP8 + Opus for Chromium/Android/Firefox
 */
const KEEPAWAKE_MP4_DATA_URI = 'data:video/mp4;base64,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AA50AAAOgQAADqIAAA6zAAAOwAAAABpzZ3BkAQAAAHJvbGwAAAACAAAAAf//AAAAHHNiZ3AAAAAAcm9sbAAAAAEAAAAhAAAAAQAAAGJ1ZHRhAAAAWm1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAALWlsc3QAAAAlqXRvbwAAAB1kYXRhAAAAAQAAAABMYXZmNTguNzYuMTAwAAAACGZyZWUAAAcNbWRhdN4EAExhdmM1OC4xMzQuMTAwAAIwQA4AAAJvBgX//2vcRem95tlIt5Ys2CDZI+7veDI2NCAtIGNvcmUgMTYzIHIzMDYwIDVkYjZhYTYgLSBILjI2NC9NUEVHLTQgQVZDIGNvZGVjIC0gQ29weWxlZnQgMjAwMy0yMDIxIC0gaHR0cDovL3d3dy52aWRlb2xhbi5vcmcveDI2NC5odG1sIC0gb3B0aW9uczogY2FiYWM9MCByZWY9MyBkZWJsb2NrPTE6MDowIGFuYWx5c2U9MHgxOjB4MTExIG1lPWhleCBzdWJtZT03IHBzeT0xIHBzeV9yZD0xLjAwOjAuMDAgbWl4ZWRfcmVmPTEgbWVfcmFuZ2U9MTYgY2hyb21hX21lPTEgdHJlbGxpcz0xIDh4OGRjdD0wIGNxbT0wIGRlYWR6b25lPTIxLDExIGZhc3RfcHNraXA9MSBjaHJvbWFfcXBfb2Zmc2V0PS0yIHRocmVhZHM9MSBsb29rYWhlYWRfdGhyZWFkcz0xIHNsaWNlZF90aHJlYWRzPTAgbnI9MCBkZWNpbWF0ZT0xIGludGVybGFjZWQ9MCBibHVyYXlfY29tcGF0PTAgY29uc3RyYWluZWRfaW50cmE9MCBiZnJhbWVzPTAgd2VpZ2h0cD0wIGtleWludD0xMCBrZXlpbnRfbWluPTEgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD0xMCByYz1jcmYgbWJ0cmVlPTEgY3JmPTMyLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MToxLjAwAIAAAAEyZYiEJ8QiKgDAhD8OAAEe6D6IAEm5KcbJ3+BoSMisJleuv+V/VvLnq+0Yc7S/tTLcWT+dcdCnj1PPLLLjzilTDp2e1/Nih2e0IAIxTwMAJAgAzlI4THjdj8qbjHH/vA/pCsg8d0EBf0Y3H/jF8KEcXeOCsz7RpYmIjCDbU5wABnCKWVUE2pre3v//hr+DSEygEvS48V9npFvy09irpp1PSPKjx15s6VpskHUYqSVTzSpNILTtdNEg6n7LKPegMAAUwAQDAzjY+kCf71K4W2AutNSCn//flcHfDif/vye8jtnN/LWcCnMm/8Z+/vOzTTn/35AA+EPsNHTf/888QQBRIAc8Y5oCjHNAkiuMAD7hRFcKAD7nw/+g0U8AAn4P888QgACA1GD55lWbuFoEwVu4OgTEARggBwEYIAcAAAAFQZo4TlgBGCAHARggBwAAAChBmlQT/DOA1JqlwgX/IQDQYceJDw0ykRKXeABTk1EaYpkDf4/90eSAARggBwAAACVBmmCeq88IWeCKABJUUYemOE6qUv/L7LQ2OAGdS/EYfOsGBrJAARggBwEYIAcAAAALQZqAn+edI1NXH8kBGCAHAAAABUGaoJywARggBwEYIAcAAAASQZrAn+eNTAmasRZGypfBsJJAARggBwAAABFBmuCf4cvb7JHo+uNHimhTyQEYIAcBGCAHAAAABUGbAJywARggBwEYIAcAAAAFQZsgnLABGCAHAAABYmWIgh/EIioAwIQ/AXUgA6o2UZVXgDCJyJw1I/e2ZkVCIy7lqy38v/sjclOH2d/oHU6h7dtf9CxXGguR/OutWEi8WNXolHtyLT0g5ElGA+/v/aHNOYFJf7YCSAAIAIQTjDAHt+WZng1woK57kHH/++hHQok1ycADjmgyVME977OW3qMMp/9GvhIRxd4orZ40VdYjCDXYU48AAQB8BZErVW8tIyzef/6BvciVCIykAQRcinD7d/p1MJFUVruwzK0aMtXqG6JQdLf7Z0lpjyDqDXKbvUrcPIrN9adpyZNB1SNOiwo82AwABpAAMBgYsaA3ogn/vYq4SXMJaakCkq/vrOm3oOVv/3Jd2R2zm/llnAU4yjw3jj/5xJekmTn/35AAxwh+Gi3/+e8QhRAAgDyYu5yVF3JIAOBrjwLAcA4GuHAsR8P/QaKeAAZ6/7PDxAgACANEj7Q5dCWZ3CxAJgrO4OIBMQEYIAcBGCAHAAAAFkGaOE/nlTx//rhqfA+9yKzI2jwxH1ABGCAHAAAABUGaVBOWARggBwEYIAcAAAAZQZpg3fhUsvy4GXuAsrCHmwMe5k/8NPqvqAEYIAcAAAAWQZqA3+HJPl66nUeieqWP+CIt6nErUAEYIAcBGCAHAAAAG0GaoN/hzzd/6ngif1r4aK+fAUXGjjiB75f9QAEYIAcAAAAFQZrARywBGCAHARggBwAAABVBmuBXfho5PJoNtlFgnLPN4GvrOoABGCAHARggBwAAAAVBmwBnLAEYIAcAAAAFQZsgIcsBGCAHARggBw==';
const KEEPAWAKE_WEBM_DATA_URI = 'data:video/webm;base64,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';

interface WakeLockSentinelLike {
  released?: boolean;
  release: () => Promise<void>;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

interface NavigatorWithWakeLock {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinelLike>;
  };
}

export interface ScreenWakeLockControls {
  /** Call synchronously inside a user click/tap handler (e.g. Play button) to satisfy mobile gesture policies */
  acquireWakeLock: () => Promise<void>;
  /** Call when playback stops or pauses to allow the screen to sleep normally */
  releaseWakeLock: () => Promise<void>;
}

/**
 * Multi-layer Screen Wake Lock manager designed to prevent 30-second mobile screen auto-lock
 * both in standalone mode AND inside cross-origin iframes (such as Google AI Studio mobile preview):
 *
 * Layer 1: W3C Screen Wake Lock API (`navigator.wakeLock.request("screen")`)
 * Layer 2: Pre-mounted foreground HTML5 `<video>` playing a real H.264+AAC MP4 / VP8+Opus WebM loop
 *          positioned inside the visible viewport (`24x24px`, `z-index: 9999`, `opacity: 0.02`)
 *          so Chromium `VideoVisibilityTracker` and iOS WebKit never downgrade the display wake lock.
 * Layer 3: Live `canvas.captureStream(10)` + `AudioContext.createMediaStreamDestination()` stream
 *          actively painting frames every 250ms while playing.
 * Layer 4: `navigator.mediaSession.playbackState = "playing"` + 1.5s watchdog timer.
 */
export function useScreenWakeLock(isActive: boolean): ScreenWakeLockControls {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);
  const fileVideoRef = useRef<HTMLVideoElement | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const liveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const liveAudioCtxRef = useRef<AudioContext | null>(null);
  const frameCounterRef = useRef<number>(0);
  const isActiveRef = useRef<boolean>(isActive);
  isActiveRef.current = isActive;

  // Pre-mount the file-based <video> in the foreground viewport so it buffers immediately
  const ensureFileVideo = useCallback((): HTMLVideoElement | null => {
    if (typeof document === 'undefined') return null;
    if (fileVideoRef.current && document.body.contains(fileVideoRef.current)) {
      return fileVideoRef.current;
    }

    try {
      const video = document.createElement('video');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('loop', '');
      video.setAttribute('preload', 'auto');
      video.setAttribute('aria-hidden', 'true');
      video.setAttribute('data-testid', 'screen-wakelock-fallback-video');
      video.playsInline = true;
      video.loop = true;
      // Unmuted with silent audio track so Android Chrome & iOS Safari hold full display wake lock
      video.muted = false;
      video.volume = 0.02;
      if ('disablePictureInPicture' in video) {
        (video as HTMLVideoElement & { disablePictureInPicture: boolean }).disablePictureInPicture = true;
      }

      // Position inside the visible viewport in the foreground (bottom-left over dark TransportBar)
      // so Chromium VideoVisibilityTracker sees 100% intersection ratio and never drops the lock
      video.style.position = 'fixed';
      video.style.bottom = '4px';
      video.style.left = '4px';
      video.style.width = '24px';
      video.style.height = '24px';
      video.style.opacity = '0.015';
      video.style.pointerEvents = 'none';
      video.style.zIndex = '9999';

      const sourceMp4 = document.createElement('source');
      sourceMp4.src = KEEPAWAKE_MP4_DATA_URI;
      sourceMp4.type = 'video/mp4';

      const sourceWebm = document.createElement('source');
      sourceWebm.src = KEEPAWAKE_WEBM_DATA_URI;
      sourceWebm.type = 'video/webm';

      video.appendChild(sourceMp4);
      video.appendChild(sourceWebm);

      // Ensure seamless looping even on mobile browsers where loop attribute has a gap
      video.addEventListener('timeupdate', () => {
        if (isActiveRef.current && video.duration > 0.5 && video.currentTime >= video.duration - 0.18) {
          video.currentTime = 0;
          void video.play().catch(() => {});
        }
      });

      video.addEventListener('ended', () => {
        if (isActiveRef.current) {
          video.currentTime = 0;
          void video.play().catch(() => {});
        }
      });

      document.body.appendChild(video);
      try {
        video.load();
      } catch {
        // Ignore load errors in non-browser test runners (jsdom)
      }
      fileVideoRef.current = video;
      return video;
    } catch {
      return null;
    }
  }, []);

  // Paint a fresh frame onto the live canvas so the hardware video decoder stays active
  const paintLiveCanvasFrame = useCallback(() => {
    const canvas = liveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    frameCounterRef.current = (frameCounterRef.current + 1) % 32;
    ctx.fillStyle = frameCounterRef.current % 2 === 0 ? '#2B2C30' : '#2D2E33';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#35373D';
    ctx.fillRect(frameCounterRef.current, 4, 6, 6);
  }, []);

  // Ensure live MediaStream (Canvas video track + WebAudio silent audio track)
  const startLiveStreamVideo = useCallback(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    try {
      if (!liveCanvasRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        liveCanvasRef.current = canvas;
      }
      paintLiveCanvasFrame();

      const canvas = liveCanvasRef.current;
      if (typeof canvas.captureStream !== 'function') return;

      if (!liveVideoRef.current || !document.body.contains(liveVideoRef.current)) {
        const stream = canvas.captureStream(10);

        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          liveAudioCtxRef.current = audioCtx;
          const dest = audioCtx.createMediaStreamDestination();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.frequency.value = 40;
          gain.gain.value = 0.00005;
          osc.connect(gain);
          gain.connect(dest);
          osc.start();
          for (const track of dest.stream.getAudioTracks()) {
            stream.addTrack(track);
          }
        }

        const liveVid = document.createElement('video');
        liveVid.setAttribute('playsinline', '');
        liveVid.setAttribute('webkit-playsinline', '');
        liveVid.setAttribute('aria-hidden', 'true');
        liveVid.setAttribute('data-testid', 'screen-wakelock-live-video');
        liveVid.playsInline = true;
        liveVid.muted = false;
        liveVid.volume = 0.02;
        if ('disablePictureInPicture' in liveVid) {
          (liveVid as HTMLVideoElement & { disablePictureInPicture: boolean }).disablePictureInPicture = true;
        }
        liveVid.style.position = 'fixed';
        liveVid.style.bottom = '4px';
        liveVid.style.left = '30px';
        liveVid.style.width = '24px';
        liveVid.style.height = '24px';
        liveVid.style.opacity = '0.015';
        liveVid.style.pointerEvents = 'none';
        liveVid.style.zIndex = '9999';
        liveVid.srcObject = stream;
        document.body.appendChild(liveVid);
        liveVideoRef.current = liveVid;
      }

      if (liveAudioCtxRef.current && liveAudioCtxRef.current.state === 'suspended') {
        void liveAudioCtxRef.current.resume().catch(() => {});
      }

      const lv = liveVideoRef.current;
      if (lv && lv.paused) {
        const p = lv.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {
            lv.muted = true;
            void lv.play().catch(() => {});
          });
        }
      }
    } catch {
      // Ignore in environments without CanvasCaptureMediaStream
    }
  }, [paintLiveCanvasFrame]);

  const startFileVideo = useCallback(() => {
    const video = ensureFileVideo();
    if (!video) return;
    try {
      video.muted = false;
      video.volume = 0.02;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // If unmuted play is blocked, fall back to muted play immediately
          video.muted = true;
          void video.play().catch(() => {});
        });
      }
    } catch {
      // Ignore in headless/jsdom environments
    }
  }, [ensureFileVideo]);

  const stopAllFallbackVideos = useCallback(() => {
    const fv = fileVideoRef.current;
    if (fv) {
      try {
        fv.pause();
      } catch {
        // Ignore
      }
    }
    const lv = liveVideoRef.current;
    if (lv) {
      try {
        lv.pause();
      } catch {
        // Ignore
      }
    }
    if (liveAudioCtxRef.current && liveAudioCtxRef.current.state === 'running') {
      void liveAudioCtxRef.current.suspend().catch(() => {});
    }
  }, []);

  const requestNativeWakeLock = useCallback(async () => {
    if (typeof navigator === 'undefined') return;
    const nav = navigator as unknown as NavigatorWithWakeLock;
    if (nav.wakeLock && typeof nav.wakeLock.request === 'function') {
      if (sentinelRef.current && !sentinelRef.current.released) {
        return;
      }
      try {
        const sentinel = await nav.wakeLock.request('screen');
        sentinelRef.current = sentinel;
        sentinel.addEventListener?.('release', () => {
          if (sentinelRef.current === sentinel) {
            sentinelRef.current = null;
          }
        });
      } catch {
        // Disallowed by iframe permissions policy -> Layer 2 & Layer 3 foreground videos handle it
      }
    }
  }, []);

  const acquireWakeLock = useCallback(async () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    // 1. Start pre-loaded foreground file video synchronously inside user gesture
    startFileVideo();

    // 2. Start live Canvas + WebAudio MediaStream foreground video
    startLiveStreamVideo();

    // 3. Set MediaSession state to playing
    try {
      if ('mediaSession' in navigator && navigator.mediaSession) {
        navigator.mediaSession.playbackState = 'playing';
      }
    } catch {
      // Ignore
    }

    // 4. Request native W3C Screen Wake Lock
    await requestNativeWakeLock();
  }, [startFileVideo, startLiveStreamVideo, requestNativeWakeLock]);

  const releaseWakeLock = useCallback(async () => {
    stopAllFallbackVideos();

    try {
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator && navigator.mediaSession) {
        navigator.mediaSession.playbackState = 'paused';
      }
    } catch {
      // Ignore
    }

    const current = sentinelRef.current;
    sentinelRef.current = null;
    if (current && !current.released) {
      try {
        await current.release();
      } catch {
        // Ignore
      }
    }
  }, [stopAllFallbackVideos]);

  // Pre-mount the file video on initial hook mount so it is already buffered before Play is tapped
  useEffect(() => {
    ensureFileVideo();
  }, [ensureFileVideo]);

  // Synchronize wake lock state with isActive + run active watchdog timer
  useEffect(() => {
    if (!isActive) {
      void releaseWakeLock();
      return;
    }

    void acquireWakeLock();

    // Watchdog every 400ms to repaint live canvas frames and ensure videos stay playing past 30s
    const intervalId = window.setInterval(() => {
      if (!isActiveRef.current) return;
      paintLiveCanvasFrame();

      const fv = fileVideoRef.current;
      if (fv && fv.paused) {
        void fv.play().catch(() => {
          fv.muted = true;
          void fv.play().catch(() => {});
        });
      }

      const lv = liveVideoRef.current;
      if (lv && lv.paused) {
        void lv.play().catch(() => {
          lv.muted = true;
          void lv.play().catch(() => {});
        });
      }

      if (!sentinelRef.current || sentinelRef.current.released) {
        void requestNativeWakeLock();
      }
    }, 400);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isActive, acquireWakeLock, releaseWakeLock, paintLiveCanvasFrame, requestNativeWakeLock]);

  // Re-acquire wake lock on visibilitychange or any screen touch while active
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityOrTouch = () => {
      if (document.visibilityState === 'visible' && isActiveRef.current) {
        void acquireWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrTouch);
    document.addEventListener('touchstart', handleVisibilityOrTouch, { passive: true });
    document.addEventListener('pointerdown', handleVisibilityOrTouch, { passive: true });
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrTouch);
      document.removeEventListener('touchstart', handleVisibilityOrTouch);
      document.removeEventListener('pointerdown', handleVisibilityOrTouch);
    };
  }, [acquireWakeLock]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      void releaseWakeLock();
      if (fileVideoRef.current?.parentNode) {
        fileVideoRef.current.parentNode.removeChild(fileVideoRef.current);
        fileVideoRef.current = null;
      }
      if (liveVideoRef.current?.parentNode) {
        liveVideoRef.current.parentNode.removeChild(liveVideoRef.current);
        liveVideoRef.current = null;
      }
      if (liveAudioCtxRef.current) {
        void liveAudioCtxRef.current.close().catch(() => {});
        liveAudioCtxRef.current = null;
      }
    };
  }, [releaseWakeLock]);

  return { acquireWakeLock, releaseWakeLock };
}
