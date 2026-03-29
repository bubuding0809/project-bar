'use client';

import { useWebHaptics } from 'web-haptics/react';
import { useCallback, useEffect } from 'react';

export function useTowerHaptics() {
  const haptics = useWebHaptics();

  const startEngine = useCallback(() => {
    if (!haptics?.trigger) return;
    try {
      haptics.trigger([50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50]);
    } catch (e) { console.warn('Haptics failed', e); }
  }, [haptics]);

  const startDanger = useCallback(() => {
    if (!haptics?.trigger) return;
    try {
      haptics.trigger([25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25]);
    } catch (e) { console.warn('Haptics failed', e); }
  }, [haptics]);

  const bust = useCallback(() => {
    if (!haptics?.trigger || !haptics?.cancel) return;
    try {
      haptics.cancel();
      haptics.trigger([500]);
    } catch (e) { console.warn('Haptics failed', e); }
  }, [haptics]);

  const success = useCallback(() => {
    if (!haptics?.trigger || !haptics?.cancel) return;
    try {
      haptics.cancel();
      haptics.trigger([50, 100, 50]);
    } catch (e) { console.warn('Haptics failed', e); }
  }, [haptics]);

  const stop = useCallback(() => {
    if (!haptics?.cancel) return;
    try {
      haptics.cancel();
    } catch (e) { console.warn('Haptics failed', e); }
  }, [haptics]);

  useEffect(() => {
    return () => {
      if (haptics?.cancel) {
        try { haptics.cancel(); } catch (e) { /* ignore cleanup errors */ }
      }
    };
  }, [haptics]);

  return { startEngine, startDanger, bust, success, stop };
}