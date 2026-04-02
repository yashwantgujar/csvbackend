import Queue from 'bull';
import Redis from 'ioredis'; 
import dotenv from 'dotenv';
dotenv.config();

const redisOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
};


export const csvQueue = new Queue('csv-processing', {
    redis: redisOptions
});


export const redisClient = new Redis(redisOptions);

export default csvQueue;