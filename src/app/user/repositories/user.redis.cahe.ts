import { Redis } from 'ioredis';
import { User } from '../entities/user';
import {UserCache} from "./cache.interface.user";


export class RedisUserCache implements UserCache {
    private readonly TTL = 3600; // Time to live in seconds (1 hour)

    constructor(private redisClient: Redis) {}

    async getUser(id: number): Promise<User | null> {
        const userData = await this.redisClient.get(`user:${id}`);
        return userData ? JSON.parse(userData) : null;
    }

    async setUser(user: User): Promise<void> {
        await this.redisClient.setex(`user:${user.id}`, this.TTL, JSON.stringify(user));
    }

    async deleteUser(id: number): Promise<void> {
        await this.redisClient.del(`user:${id}`);
    }
}
