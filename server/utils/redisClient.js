import { createClient } from 'redis';

const redisClient = createClient();

redisClient.on('error', err => console.error('❌ Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Redis connected'));

await redisClient.connect();

const CHANNEL_NAME = 'activity_updates';

export const publishLiveUpdate = async (data) => {
  await redisClient.publish(CHANNEL_NAME, JSON.stringify(data));
};

export default redisClient;
