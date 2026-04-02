import { useWebHaptics } from 'web-haptics/react';
import { HAPTIC_PATTERNS } from '@/lib/haptics';

interface UseGameHapticsOptions {
  debug?: boolean;
  showSwitch?: boolean;
}

export function useGameHaptics(options?: UseGameHapticsOptions) {
  const { trigger, ...rest } = useWebHaptics({ 
    debug: options?.debug ?? false, 
    showSwitch: options?.showSwitch ?? true 
  });

  const hapticTick = () => trigger(HAPTIC_PATTERNS.tick);
  const hapticLoser = () => trigger(HAPTIC_PATTERNS.loser);
  const hapticOthers = () => trigger(HAPTIC_PATTERNS.others);
  const hapticSuccess = () => trigger('success');
  const hapticBuzz = () => trigger('buzz');

  return {
    trigger,
    hapticTick,
    hapticLoser,
    hapticOthers,
    hapticSuccess,
    hapticBuzz,
    ...rest,
  };
}
