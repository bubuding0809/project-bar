'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { getClientPusher } from '@/lib/pusher-client';
import { BarrelState } from '@/types/barrel';
import LobbyScreen from './LobbyScreen';
import PlayerTurnBanner from './PlayerTurnBanner';
import RoundEndModal from './RoundEndModal';
import { useWebHaptics } from 'web-haptics/react';

const BarrelScene = dynamic(() => import('./BarrelScene'), { ssr: false });

const PIRATE_POP_DELAY_MS = 1500;

interface BarrelGameProps {
  tableId: string;
  onGameActiveChange?: (active: boolean) => void;
}

export default function BarrelGame({ tableId, onGameActiveChange }: BarrelGameProps) {
  const [barrelState, setBarrelState] = useState<BarrelState | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [insertingSlot, setInsertingSlot] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showRoundEndModal, setShowRoundEndModal] = useState(false);
  const barrelStateRef = useRef<BarrelState | null>(null);
  const piratePopTimeRef = useRef<number | null>(null);
  const piratePopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { trigger: haptic } = useWebHaptics({ debug: false, showSwitch: true });

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize userId once
  useEffect(() => {
    let storedId = localStorage.getItem('demo_user_id');
    if (!storedId) {
      storedId = `user_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('demo_user_id', storedId);
    }
    setUserId(storedId);
  }, []);

  // Sync state to parent
  useEffect(() => {
    onGameActiveChange?.(barrelState !== null);
  }, [barrelState, onGameActiveChange]);

  // Sync state to ref
  useEffect(() => {
    barrelStateRef.current = barrelState;
  }, [barrelState]);

  // Initialize game and Pusher subscriptions
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pusherChannel: any = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const init = async () => {
      try {
        const res = await fetch(`/api/barrel/${tableId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.game) {
            setBarrelState(data.game);
          }
        }
      } catch (err) {
        console.error('Failed to fetch barrel game:', err);
      }
      setIsInitialized(true);
    };

    // Pusher setup - subscribe BEFORE init so we don't miss events during fetch
    const pusher = getClientPusher();
    if (pusher) {
      pusherChannel = pusher.subscribe(`table-${tableId}`);

      pusherChannel.bind('barrel-updated', (data: BarrelState) => {
        if (data && typeof data.status === 'string' && Array.isArray(data.players)) {
          setBarrelState(data);
        }
      });

      pusherChannel.bind('barrel-sword-inserted', (data: { slotIndex: number; playerId: string }) => {
        setInsertingSlot(data.slotIndex);
        if (data.playerId === userId && barrelStateRef.current?.triggerSlot === data.slotIndex) {
          haptic('triggerLoser');
        } else {
          haptic('success');
        }
        setTimeout(() => setInsertingSlot(null), 300);
      });

      pusherChannel.bind('barrel-trigger-hit', () => {
        haptic('buzz');
      });

      pusherChannel.bind('barrel-game-over', () => {
        piratePopTimeRef.current = Date.now();
        setShowRoundEndModal(false);
        if (piratePopTimeoutRef.current) {
          clearTimeout(piratePopTimeoutRef.current);
        }
        piratePopTimeoutRef.current = setTimeout(() => {
          setShowRoundEndModal(true);
        }, PIRATE_POP_DELAY_MS);
      });
    } else {
      // No Pusher - poll for updates every 2 seconds
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/barrel/${tableId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.game) {
              setBarrelState(data.game);
            }
          }
        } catch (err) {
          // silent fail on polling
        }
      }, 2000);
    }

    init();

    return () => {
      if (pusherChannel) {
        pusherChannel.unbind_all();
        pusherChannel.unsubscribe();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (piratePopTimeoutRef.current) {
        clearTimeout(piratePopTimeoutRef.current);
      }
    };
  }, [tableId]);

  // Handle page unload
  useEffect(() => {
    const handleUnload = () => {
      const state = barrelStateRef.current;
      if (!state || !userId) return;

      if (state.host === userId && state.status === 'LOBBY') {
        fetch('/api/barrel/close', {
          method: 'POST',
          body: JSON.stringify({ tableId }),
          keepalive: true,
        });
      } else if (state.host !== userId && state.status === 'LOBBY') {
        fetch('/api/barrel/leave', {
          method: 'POST',
          body: JSON.stringify({ tableId, userId }),
          keepalive: true,
        });
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [tableId, userId]);

  const handleJoin = useCallback(async (nickname: string, emoji: string) => {
    if (!userId || isJoining) return;
    setIsJoining(true);
    try {
      const res = await fetch('/api/barrel/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, playerProfile: { userId, nickname, emoji } }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.game) {
          setBarrelState(data.game);
        }
      }
    } catch (err) {
      console.error('Failed to join barrel game:', err);
    } finally {
      setIsJoining(false);
    }
  }, [tableId, userId]);

  const handleStart = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch('/api/barrel/start-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, userId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.game) {
          setBarrelState(data.game);
        }
      }
    } catch (err) {
      console.error('Failed to start barrel round:', err);
    }
  }, [tableId, userId]);

  const handleClose = useCallback(async () => {
    if (piratePopTimeoutRef.current) {
      clearTimeout(piratePopTimeoutRef.current);
      piratePopTimeoutRef.current = null;
    }
    setShowRoundEndModal(false);
    setBarrelState(null);
    setIsInitialized(true);
    try {
      await fetch('/api/barrel/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId }),
      });
    } catch (err) {
      console.error('Failed to close barrel game:', err);
    }
  }, [tableId]);

  const handleInsertSword = useCallback(async (slotIndex: number) => {
    if (!userId || !barrelState) return;
    if (barrelState.status !== 'PLAYER_TURN') return;
    
    const currentPlayer = barrelState.players[barrelState.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.userId !== userId) return;
    if (barrelState.filledSlots.includes(slotIndex)) return;

    try {
      const res = await fetch('/api/barrel/insert-sword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, userId, slotIndex }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.game) {
          setBarrelState(data.game);
        }
      }
    } catch (err) {
      console.error('Failed to insert sword:', err);
    }
  }, [tableId, userId, barrelState]);

  // Show loading until initialized and mounted (prevents hydration mismatch with dynamic ssr:false)
  if (!isInitialized || !isMounted) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // No game state - don't render
  if (!barrelState) {
    return null;
  }

  const currentPlayer = barrelState.players[barrelState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.userId === userId && barrelState.status === 'PLAYER_TURN';
  const loser = barrelState.players.find(p => p.userId === barrelState.loserId);

  return (
    <div className="fixed inset-0 z-50">
      <BarrelScene
        filledSlots={barrelState.filledSlots}
        triggerSlot={barrelState.triggerSlot}
        onSlotTap={handleInsertSword}
        isMyTurn={isMyTurn}
        piratePopped={!!barrelState.loserId}
        insertingSlot={insertingSlot}
      />

      {barrelState.status === 'LOBBY' && userId && (
        <LobbyScreen
          barrelState={barrelState}
          userId={userId}
          onJoin={handleJoin}
          onStart={handleStart}
          isJoining={isJoining}
        />
      )}

      {barrelState.status === 'PLAYER_TURN' && (
        <PlayerTurnBanner
          currentPlayer={currentPlayer ?? null}
          isMyTurn={isMyTurn}
          slotsFilled={barrelState.filledSlots.length}
        />
      )}

      {showRoundEndModal && loser && barrelState.forfeitCategory && barrelState.forfeitText && (
        <RoundEndModal
          loser={loser}
          forfeitCategory={barrelState.forfeitCategory}
          forfeitText={barrelState.forfeitText}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
