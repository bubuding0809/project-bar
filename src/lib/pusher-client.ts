import PusherClient from 'pusher-js';

const requireEnv = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

let clientPusherInstance: PusherClient | null = null;

export const getClientPusher = (userId?: string) => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!clientPusherInstance) {
    clientPusherInstance = new PusherClient(
      requireEnv('NEXT_PUBLIC_PUSHER_KEY', process.env.NEXT_PUBLIC_PUSHER_KEY),
      {
        cluster: requireEnv('NEXT_PUBLIC_PUSHER_CLUSTER', process.env.NEXT_PUBLIC_PUSHER_CLUSTER),
        authEndpoint: '/api/pusher/auth',
        auth: {
          params: { userId: userId || 'anonymous' }
        }
      }
    );
  }

  return clientPusherInstance;
};
