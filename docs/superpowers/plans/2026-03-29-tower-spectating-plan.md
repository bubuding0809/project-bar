# Tower Game Spectating Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Broadcast the active player's bar fill percentage to spectators in real-time via Pusher client events over a private channel.

**Architecture:** The active player (`TowerHoldScreen`) will trigger `client-tower-sync` events on a `private-table-${tableId}` channel at 150ms intervals. Spectators (`TowerWatchScreen`) will listen to this event and update their local `TowerMeter` fill state. A new `/api/pusher/auth` endpoint is required to authorize subscriptions to the `private-` channel.

**Tech Stack:** React, Next.js API Routes, Pusher (client & server)

---

### Task 1: Create Pusher Auth Endpoint with Tests

**Files:**
- Create: `src/app/api/pusher/auth/__tests__/route.test.ts`
- Create: `src/app/api/pusher/auth/route.ts`

- [ ] **Step 1: Write the failing test**
Create `src/app/api/pusher/auth/__tests__/route.test.ts`.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { serverPusher } from '@/lib/pusher-server';

vi.mock('@/lib/pusher-server', () => ({
  serverPusher: {
    authorizeChannel: vi.fn(),
  },
}));

describe('POST /api/pusher/auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 if socket_id or channel_name is missing', async () => {
    const req = new Request('http://localhost/api/pusher/auth', {
      method: 'POST',
      body: new URLSearchParams({ socket_id: '123' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('authorizes private channel', async () => {
    const mockAuthResponse = { auth: 'mock_auth_token' };
    (serverPusher.authorizeChannel as any).mockReturnValue(mockAuthResponse);

    const req = new Request('http://localhost/api/pusher/auth', {
      method: 'POST',
      body: new URLSearchParams({
        socket_id: '123.456',
        channel_name: 'private-table-abc',
        userId: 'user-789',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(mockAuthResponse);
    expect(serverPusher.authorizeChannel).toHaveBeenCalledWith('123.456', 'private-table-abc');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test src/app/api/pusher/auth/__tests__/route.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Write minimal implementation**
Create `src/app/api/pusher/auth/route.ts`.

```typescript
import { NextResponse } from 'next/server';
import { serverPusher } from '@/lib/pusher-server';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const socketId = data.get('socket_id') as string;
    const channelName = data.get('channel_name') as string;
    const userId = data.get('userId') as string;
    
    if (!socketId || !channelName) {
      return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 });
    }

    // Note: userId is extracted here for logging or future session validation.
    console.log(`Pusher Auth: User ${userId} subscribing to ${channelName}`);

    const authResponse = serverPusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test src/app/api/pusher/auth/__tests__/route.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/pusher/auth/route.ts src/app/api/pusher/auth/__tests__/route.test.ts
git commit -m "feat: add Pusher auth endpoint for private channels"
```

### Task 2: Configure Pusher Client AuthEndpoint

**Files:**
- Modify: `src/lib/pusher-client.ts`

- [ ] **Step 1: Set `authEndpoint`**
Modify the Pusher initialization to include the new auth endpoint. You may need to import or configure auth params to pass the `userId` in the future, but currently, Next.js or standard pusher client manages auth payload automatically if it's not custom json. To pass `userId`, we can use `auth.params`.

```typescript
import PusherClient from 'pusher-js';

let pusherInstance: PusherClient | null = null;

export const getClientPusher = (userId?: string) => {
  if (typeof window === 'undefined') return null;
  
  if (!pusherInstance) {
    pusherInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: '/api/pusher/auth',
      auth: {
        params: { userId: userId || 'anonymous' }
      }
    });
  }
  return pusherInstance;
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/pusher-client.ts
git commit -m "chore: configure Pusher client auth endpoint"
```

### Task 3: Emit Sync Events from `TowerHoldScreen`

**Files:**
- Modify: `src/components/TowerHoldScreen.tsx`

- [ ] **Step 1: Subscribe to the private channel**
Import `getClientPusher` and subscribe to `private-table-${tableId}` on mount. 
You will need to pass `tableId` and `userId` as props to `TowerHoldScreen` (ensure they are available).

- [ ] **Step 2: Throttle sync events**
Inside the `tick` loop of `startHolding`, use a throttle to emit the event:

```typescript
  const lastSyncRef = useRef<number>(0);
  const channelRef = useRef<any>(null);

  // In a useEffect, subscribe and set channelRef:
  // channelRef.current = pusher.subscribe(`private-table-${tableId}`);

  // Inside tick():
  const now = performance.now();
  if (now - lastSyncRef.current > 150) {
    channelRef.current?.trigger('client-tower-sync', {
      userId,
      fill
    });
    lastSyncRef.current = now;
  }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/TowerHoldScreen.tsx
git commit -m "feat: broadcast tower-sync events from TowerHoldScreen"
```

### Task 4: Listen to Sync Events in `TowerWatchScreen`

**Files:**
- Modify: `src/components/TowerWatchScreen.tsx`

- [ ] **Step 1: Subscribe and listen**
Import `getClientPusher`. Pass `tableId` as a prop.
Subscribe to `private-table-${tableId}`.
Bind to `client-tower-sync`:

```typescript
  const [fill, setFill] = useState(0);

  useEffect(() => {
    const pusher = getClientPusher();
    if (!pusher) return;

    const channel = pusher.subscribe(`private-table-${tableId}`);
    channel.bind('client-tower-sync', (data: { userId: string, fill: number }) => {
      if (data.userId === currentPlayer.userId) {
        setFill(data.fill);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [tableId, currentPlayer.userId]);
```

- [ ] **Step 2: Pass `fill` to `TowerMeter`**
Change `<TowerMeter fill={0} isActive={false} />` to `<TowerMeter fill={fill} isActive={false} />`

- [ ] **Step 3: Commit**

```bash
git add src/components/TowerWatchScreen.tsx
git commit -m "feat: listen for tower-sync events in TowerWatchScreen"
```

### Task 5: Pass `tableId` and `userId` to Screens

**Files:**
- Modify: `src/components/TowerOverlay.tsx`

- [ ] **Step 1: Update Props**
Ensure `TowerHoldScreen` and `TowerWatchScreen` are passed the `tableId`.
Ensure `TowerHoldScreen` receives `userId` correctly and passes it down.

- [ ] **Step 2: Commit**

```bash
git add src/components/TowerOverlay.tsx
git commit -m "chore: pass required props to tower screens for syncing"
```