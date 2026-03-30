import { Redis } from '@upstash/redis';

let redisInstance: Redis | null = null;

const getRedis = () => {
  if (!redisInstance) {
    redisInstance = Redis.fromEnv();
  }
  return redisInstance;
};

// Create a single instance of the Upstash Redis client lazily
export const redis = new Proxy({} as Redis, {
  get(target, prop) {
    return Reflect.get(getRedis(), prop);
  }
});
