'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getClientPusher } from '@/lib/pusher-client';
import { BarrelState } from '@/types/barrel';
import { useGameHaptics } from '@/hooks/useGameHaptics';

interface UseBarrelGameOptions {
  tableId: string;
  onGameOver?: () => void;
}

interface UseBarrelGameReturn {
  barrelState: BarrelState | null;
  userId: string | null;
  isJoining: boolean;
  activePlayerId: string | null;
  insertingSlot: number | null;
  handleJoin: (nickname: string, emoji: string) => Promise<void>;
  handleStart: () => Promise<void>;
  handleInsertSword: (slotIndex: number) => Promise<void>;
  handleClose: () => Promise<void>;
}

export function useBarrelGame({ tableId, onGameOver }: UseBarrelGameOptions): UseBarrelGameReturn {
  const [barrelState, setBarrelState] = useState<BarrelState | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [insertingSlot, setInsertingSlot] = useState<number | null>(null);
  const barrelStateRef = useRef<BarrelState | null>(null);

  const { hapticTick, hapticLoser, hapticOthers } = useGameHaptics();

  useEffect(() => {
    barrelStateRef.current = barrelState;
  }, [barrelState]);

  useEffect(() => {
    let storedId = localStorage.getItem('demo_user_id');
    if (!storedId) {
      storedId = `user_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('demo_user_id', storedId);
    }
    setUserId(storedId);

    const fetchState = async () => {
      try {
        const res = await fetch(`/api/barrel/${tableId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.game) {
            setBarrelState(data.game);
            if (data.game.status === 'PLAYER_TURN') {
              const cp = data.game.players[data.game.currentPlayerIndex];
              setActivePlayerId(cp?.userId ?? null);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch barrel state:', err);
      }
    };
    fetchState();

    const pusher = getClientPusher();
    if (!pusher) return;

    const channel = pusher.subscribe(`table-${tableId}`);

    channel.bind('barrel-updated', (data: BarrelState) => {
      setBarrelState(data);
    });

    channel.bind('barrel-round-start', (data: BarrelState) => {
      setBarrelState(data);
    });

    channel.bind('barrel-turn-start', (data: { playerId: string; playerIndex: number }) => {
      setActivePlayerId(data.playerId);
    });

    channel.bind('barrel-sword-inserted', (data: { slotIndex: number; playerId: string }) => {
      setInsertingSlot(data.slotIndex);
      hapticTick();
      setTimeout(() => setInsertingSlot(null), 500);
    });

    channel.bind('barrel-trigger-hit', (data: { userId: string; slotIndex: number }) => {
      setBarrelState(prev => prev ? { ...prev, loserId: data.userId } : null);
      
      if (data.userId === storedId) {
        hapticLoser();
      } else {
        hapticOthers();
      }
    });

    channel.bind('barrel-game-over', () => {
      setBarrelState(null);
      onGameOver?.();
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [tableId, hapticTick, hapticLoser, hapticOthers, onGameOver]);

  const handleJoin = useCallback(async (nickname: string, emoji: string) => {
    if (!userId || isJoining) return;
    setIsJoining(true);
    try {
      await fetch('/api/barrel/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, playerProfile: { userId, nickname, emoji } }),
      });
    } catch (err) {
      console.error('Failed to join barrel game:', err);
    } finally {
      setIsJoining(false);
    }
  }, [tableId, userId, isJoining]);

  const handleStart = useCallback(async () => {
    if (!userId) return;
    try {
      await fetch('/api/barrel/start-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, userId }),
      });
    } catch (err) {
      console.error('Failed to start barrel round:', err);
    }
  }, [tableId, userId]);

  const handleInsertSword = useCallback(async (slotIndex: number) => {
    if (!userId || !barrelState) return;
    if (barrelState.status !== 'PLAYER_TURN') return;
    
    const currentPlayer = barrelState.players[barrelState.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.userId !== userId) return;
    if (barrelState.filledSlots.includes(slotIndex)) return;

    try {
      await fetch('/api/barrel/insert-sword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, userId, slotIndex }),
      });
    } catch (err) {
      console.error('Failed to insert sword:', err);
    }
  }, [tableId, userId, barrelState]);

  const handleClose = useCallback(async () => {
    await fetch('/api/barrel/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId }),
    });
    setBarrelState(null);
  }, [tableId]);

  return {
    barrelState,
    userId,
    isJoining,
    activePlayerId,
    insertingSlot,
    handleJoin,
    handleStart,
    handleInsertSword,
    handleClose,
  };
}
