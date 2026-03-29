import PusherClient from 'pusher-js';

const requireEnv = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

let clientPusherInstance: PusherClient | null = null;
let lastUserId: string | null = null;

export const getClientPusher = (userId?: string) => {
  if (typeof window === 'undefined') {
    return null;
  }

  // If userId is not provided, try to use the last known one, or default to anonymous.
  const currentUserId = userId || lastUserId || 'anonymous';

  if (clientPusherInstance && lastUserId !== currentUserId) {
    clientPusherInstance.disconnect();
    clientPusherInstance = null;
  }

  if (!clientPusherInstance) {
    lastUserId = currentUserId;
    clientPusherInstance = new PusherClient(
      requireEnv('NEXT_PUBLIC_PUSHER_KEY', process.env.NEXT_PUBLIC_PUSHER_KEY),
      {
        cluster: requireEnv('NEXT_PUBLIC_PUSHER_CLUSTER', process.env.NEXT_PUBLIC_PUSHER_CLUSTER),
        authEndpoint: '/api/pusher/auth',
        auth: {
          params: { userId: currentUserId }
        }
      }
    );
  }

  return clientPusherInstance;
};
