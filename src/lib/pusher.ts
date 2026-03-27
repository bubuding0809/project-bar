import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

const requireEnv = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

// Server-side Pusher instance
export const serverPusher = new PusherServer({
  appId: requireEnv('PUSHER_APP_ID', process.env.PUSHER_APP_ID),
  key: requireEnv('NEXT_PUBLIC_PUSHER_KEY', process.env.NEXT_PUBLIC_PUSHER_KEY),
  secret: requireEnv('PUSHER_SECRET', process.env.PUSHER_SECRET),
  cluster: requireEnv('NEXT_PUBLIC_PUSHER_CLUSTER', process.env.NEXT_PUBLIC_PUSHER_CLUSTER),
  useTLS: true,
});

// Client-side Pusher instance
// We export a function to get or create the client instance to avoid
// instantiating it on the server where NEXT_PUBLIC vars might not be ready
let clientPusherInstance: PusherClient | null = null;

export const getClientPusher = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!clientPusherInstance) {
    clientPusherInstance = new PusherClient(
      requireEnv('NEXT_PUBLIC_PUSHER_KEY', process.env.NEXT_PUBLIC_PUSHER_KEY),
      {
        cluster: requireEnv('NEXT_PUBLIC_PUSHER_CLUSTER', process.env.NEXT_PUBLIC_PUSHER_CLUSTER),
      }
    );
  }

  return clientPusherInstance;
};
