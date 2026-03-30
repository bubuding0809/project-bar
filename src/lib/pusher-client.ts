import PusherClient from 'pusher-js';

let clientPusherInstance: PusherClient | null = null;

export const getClientPusher = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    console.warn('Pusher env vars missing - real-time updates disabled');
    return null;
  }

  if (!clientPusherInstance) {
    clientPusherInstance = new PusherClient(key, { cluster });
  }

  return clientPusherInstance;
};
