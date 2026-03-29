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