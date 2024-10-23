import {User, UserEntity, UserSchema} from '../entities/user';
import {UserRepository} from "../repositories/repository.interface.user";

import ExpressReviewsError from '../../../utils/error/types/expressReviewError';
import {ZodError} from 'zod';
import {ConstantsResponse} from '../../../constants/constants';
import {UserCache} from "../repositories/cache.interface.user";
import * as argon2 from "argon2";
import {generateToken} from "../../../resources/token/token";

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

    async createUser(data: Omit<User, 'id'> & { password_confirmation: string }): Promise<User & { token?: string }> {
        try {
            // Validar que las contraseñas coincidan
            if (data.password !== data.password_confirmation) {
                throw new ExpressReviewsError(
                    'Password and confirmation do not match. Please try again.',
                    ConstantsResponse.FORBIDDEN,
                    'ValidationError',
                    'ManageUsersUsecase.createUser'
                );
            }

            const validatedUser = UserSchema.omit({ id: true }).parse(data);

            // Verificar si el email ya existe
            const userSearch = await this.userRepository.getUserByEmail(validatedUser.email);
            if (userSearch) {
                throw new ExpressReviewsError(
                    'The email is already in use.',
                    ConstantsResponse.FORBIDDEN,
                    'ValidationError',
                    'ManageUsersUsecase.createUser'
                );
            }

            // Hashear la contraseña
            validatedUser.password = await argon2.hash(validatedUser.password);

            // Crear el usuario
            const id = await this.userRepository.createUser(validatedUser);
            const newUser = UserEntity.create({ ...validatedUser, id });

            // Generar token
            const token = generateToken(newUser);

            // Agregar a cache
            await this.userCache.setUser(newUser);

            // Retornar usuario con token
            return {
                ...newUser,
                token
            };
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
            if (error instanceof ExpressReviewsError) {
                throw error;
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

    async loginUser(email: string, password: string): Promise<User & { token: string }> {
        try {
            // Autenticar al usuario usando el repositorio
            const user = await this.userRepository.authenticateUser(email, password);

            if (!user) {
                throw new ExpressReviewsError(
                    'Invalid credentials',
                    ConstantsResponse.FORBIDDEN,
                    'ValidationError',
                    'ManageUsersUsecase.loginUser'
                );
            }

            // Generar token
            const token = generateToken(user);

            // Retornar usuario con token
            return {
                ...UserEntity.create(user),
                token
            };
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to login user',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'AuthenticationError',
                'ManageUsersUsecase.loginUser',
                error
            );
        }
    }

}
