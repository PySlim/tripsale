import { User } from '../entities/user';

export interface UserCache {
    getUser(id: number): Promise<User | null>;
    setUser(user: User): Promise<void>;
    deleteUser(id: number): Promise<void>;
}
