import { Redis } from '@upstash/redis';

// Create a single instance of the Upstash Redis client
export const redis = Redis.fromEnv();
