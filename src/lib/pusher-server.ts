import PusherServer from 'pusher';

const requireEnv = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

let pusherInstance: PusherServer | null = null;

const getPusher = () => {
  if (!pusherInstance) {
    pusherInstance = new PusherServer({
      appId: requireEnv('PUSHER_APP_ID', process.env.PUSHER_APP_ID),
      key: requireEnv('NEXT_PUBLIC_PUSHER_KEY', process.env.NEXT_PUBLIC_PUSHER_KEY),
      secret: requireEnv('PUSHER_SECRET', process.env.PUSHER_SECRET),
      cluster: requireEnv('NEXT_PUBLIC_PUSHER_CLUSTER', process.env.NEXT_PUBLIC_PUSHER_CLUSTER),
      useTLS: true,
    });
  }
  return pusherInstance;
};

// Server-side Pusher instance
export const serverPusher = new Proxy({} as PusherServer, {
  get(target, prop) {
    return Reflect.get(getPusher(), prop);
  }
});
