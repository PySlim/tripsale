// src/app/user/usecases/user.usecase.ts
import { User, UserEntity, UserSchema } from '../entities/user';
import { UserRepository } from "../repositories/repository.interface.user";

import ExpressReviewsError from '../../../utils/error/types/expressReviewError';
import { ZodError } from 'zod';
import { ConstantsResponse } from '../../../enviroments_variables/constants';
import {UserCache} from "../repositories/cache.interface.user";

export class ManageUsersUsecase {
    constructor(
        private userRepository: UserRepository,
        private userCache: UserCache
    ) {}

    async getUsers(): Promise<User[]> {
        try {
            const users = await this.userRepository.getUsers();
            return users.map(user => UserEntity.create(user));
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get users',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageUsersUsecase.getUsers',
                error
            );
        }
    }

    async getUser(id: number): Promise<User | null> {
        try {
            // Try to get user from cache first
            let user = await this.userCache.getUser(id);
            if (user) {
                return UserEntity.create(user);
            }

            // If not in cache, get from repository
            user = await this.userRepository.getUser(id);
            if (user) {
                // Store in cache for future requests
                await this.userCache.setUser(user);
                return UserEntity.create(user);
            }
            return null;
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get user',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageUsersUsecase.getUser',
                error
            );
        }
    }

    async createUser(data: Omit<User, 'id'>): Promise<User> {
        try {
            const validatedUser = UserSchema.omit({ id: true }).parse(data);
            const id = await this.userRepository.createUser(validatedUser);
            const newUser = UserEntity.create({ ...validatedUser, id });
            // Add to cache
            await this.userCache.setUser(newUser);
            return newUser;
        } catch (error) {
            if (error instanceof ZodError) {
                throw new ExpressReviewsError(
                    'Invalid user data',
                    ConstantsResponse.BAD_REQUEST,
                    'ValidationError',
                    'ManageUsersUsecase.createUser',
                    error
                );
            }
            throw new ExpressReviewsError(
                'Failed to create user',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageUsersUsecase.createUser',
                error
            );
        }
    }

    async updateUser(id: number, data: Omit<User, 'id'>): Promise<User> {
        try {
            const existingUser = await this.userRepository.getUser(id);
            if (!existingUser) {
                throw new ExpressReviewsError(
                    'User not found',
                    ConstantsResponse.NOT_FOUND,
                    'NotFoundError',
                    'ManageUsersUsecase.updateUser'
                );
            }
            const validatedUser = UserSchema.parse({ ...data, id });
            await this.userRepository.updateUser(validatedUser);
            const updatedUser = UserEntity.create(validatedUser);
            // Update cache
            await this.userCache.setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            if (error instanceof ExpressReviewsError) {
                throw error;
            }
            if (error instanceof ZodError) {
                throw new ExpressReviewsError(
                    'Invalid user data',
                    ConstantsResponse.BAD_REQUEST,
                    'ValidationError',
                    'ManageUsersUsecase.updateUser',
                    error
                );
            }
            throw new ExpressReviewsError(
                'Failed to update user',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageUsersUsecase.updateUser',
                error
            );
        }
    }

    async deleteUser(id: number): Promise<void> {
        try {
            await this.userRepository.deleteUser(id);
            // Remove from cache
            await this.userCache.deleteUser(id);
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to delete user',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageUsersUsecase.deleteUser',
                error
            );
        }
    }
}
