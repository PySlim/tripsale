import Redis from 'ioredis';
import { getEnvVar } from '../../utils/environment/captureVariables/get.var.env';

export function createRedisClient(): Redis {
    return new Redis({
        host: getEnvVar('REDIS_HOST') || 'localhost',
        port: parseInt(getEnvVar('REDIS_PORT') || '6379', 10),
    });
}
