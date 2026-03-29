# Tower Game Haptics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tactile feedback using the `web-haptics` library abstracted behind a custom hook `useTowerHaptics` to enhance the Tower Game's hold-to-fill mechanic.

**Architecture:** A single new custom React hook `useTowerHaptics` will wrap the `web-haptics` logic, exposing high-level semantic methods (`startEngine`, `startDanger`, `bust`, `success`, `stop`). The `TowerHoldScreen` component will call these methods based on the current fill percentage and game phase.

**Tech Stack:** React, Next.js, `web-haptics`

---

### Task 1: Install `web-haptics`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the library**

```bash
npm install web-haptics
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install web-haptics dependency"
```

### Task 2: Create `useTowerHaptics` Hook

**Files:**
- Create: `src/hooks/useTowerHaptics.ts`
- Create: `src/hooks/__tests__/useTowerHaptics.test.ts`

- [ ] **Step 1: Write the failing test**
Create `src/hooks/__tests__/useTowerHaptics.test.ts`.

```typescript
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTowerHaptics } from '../useTowerHaptics';
import * as webHaptics from 'web-haptics/react';

vi.mock('web-haptics/react', () => ({
  useWebHaptics: vi.fn(),
}));

describe('useTowerHaptics', () => {
  const triggerMock = vi.fn();
  const cancelMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (webHaptics.useWebHaptics as any).mockReturnValue({
      trigger: triggerMock,
      cancel: cancelMock,
    });
  });

  it('startEngine triggers repeating pattern', () => {
    const { result } = renderHook(() => useTowerHaptics());
    result.current.startEngine();
    expect(triggerMock).toHaveBeenCalledWith(expect.any(Array));
  });

  it('startDanger triggers sharper repeating pattern', () => {
    const { result } = renderHook(() => useTowerHaptics());
    result.current.startDanger();
    expect(triggerMock).toHaveBeenCalledWith(expect.any(Array));
  });

  it('bust cancels and triggers heavy pattern', () => {
    const { result } = renderHook(() => useTowerHaptics());
    result.current.bust();
    expect(cancelMock).toHaveBeenCalled();
    expect(triggerMock).toHaveBeenCalledWith([500]);
  });

  it('success cancels and triggers pleasant sequence', () => {
    const { result } = renderHook(() => useTowerHaptics());
    result.current.success();
    expect(cancelMock).toHaveBeenCalled();
    expect(triggerMock).toHaveBeenCalledWith([50, 100, 50]);
  });

  it('handles useWebHaptics returning undefined/null gracefully', () => {
    (webHaptics.useWebHaptics as any).mockReturnValue(undefined);
    const { result } = renderHook(() => useTowerHaptics());
    
    expect(() => result.current.startEngine()).not.toThrow();
    expect(() => result.current.bust()).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/hooks/__tests__/useTowerHaptics.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Write minimal implementation**

Create `src/hooks/useTowerHaptics.ts`.

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/hooks/__tests__/useTowerHaptics.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useTowerHaptics.ts src/hooks/__tests__/useTowerHaptics.test.ts
git commit -m "feat: add useTowerHaptics hook with tests and error boundaries"
```

### Task 3: Integrate Haptics into `TowerHoldScreen`

**Files:**
- Modify: `src/components/TowerHoldScreen.tsx`

- [ ] **Step 1: Import and use the hook**
Open `src/components/TowerHoldScreen.tsx`.

Add import:
```typescript
import { useTowerHaptics } from '@/hooks/useTowerHaptics';
```

Add to component body near `const rafIdRef = useRef<number | null>(null);`:
```typescript
  const { startEngine, startDanger, bust, success, stop } = useTowerHaptics();
  const dangerTriggeredRef = useRef(false);
```

- [ ] **Step 2: Trigger `startEngine` on hold start**
Modify `startHolding`:
```typescript
  const startHolding = useCallback(() => {
    if (phase !== 'idle' || submitted) return;
    holdStartRef.current = performance.now();
    dangerTriggeredRef.current = false;
    setPhase('holding');
    startEngine();
    // ... rest of startHolding
```

- [ ] **Step 3: Trigger `startDanger` and `bust` during the loop**
Inside the `tick` function:
```typescript
      const fill = computeFill(elapsed);
      fillRef.current = fill;
      setDisplayFill(fill);

      if (fill > 0.80 && !dangerTriggeredRef.current) {
        dangerTriggeredRef.current = true;
        startDanger();
      }

      if (fill >= 1.0) {
        bust();
        submit(fill);
        return;
      }
```

- [ ] **Step 4: Trigger `success` and `stop` on release**
Modify `stopHolding`:
```typescript
  const stopHolding = useCallback(() => {
    if (phase !== 'holding') return;
    const finalFill = fillRef.current;
    if (finalFill < 1.0) {
      success();
    }
    stop();
    submit(finalFill);
  }, [phase, submit, success, stop]);
```

- [ ] **Step 5: Run component tests (if any)**
Run existing test suite: `npm test`
Expected: PASS (Ensure haptics don't break existing renders).

- [ ] **Step 6: Commit**

```bash
git add src/components/TowerHoldScreen.tsx
git commit -m "feat: integrate haptics into TowerHoldScreen"
```