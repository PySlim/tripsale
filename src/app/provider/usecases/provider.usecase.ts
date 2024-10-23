import { Provider, ProviderEntity, ProviderSchema } from '../entities/provider';
import { ProviderRepository } from "../repositories/repository.interface.provider";

import ExpressReviewsError from '../../../utils/error/types/expressReviewError';
import { ZodError } from 'zod';
import { ConstantsResponse } from '../../../constants/constants';

export class ManageProvidersUsecase {
    constructor(
        private providerRepository: ProviderRepository
    ) {}

    async getProviders(): Promise<Provider[]> {
        try {
            const providers = await this.providerRepository.getProviders();
            return providers.map(provider => ProviderEntity.create(provider));
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get providers',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageProvidersUsecase.getProviders',
                error
            );
        }
    }

    async getProvider(id: number): Promise<Provider | null> {
        try {
            const provider = await this.providerRepository.getProvider(id);
            return provider ? ProviderEntity.create(provider) : null;
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get provider',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageProvidersUsecase.getProvider',
                error
            );
        }
    }

    async createProvider(data: Omit<Provider, 'id'>): Promise<Provider> {
        try {
            const validatedProvider = ProviderSchema.omit({ id: true }).parse(data);
            const id = await this.providerRepository.createProvider(validatedProvider);
            return ProviderEntity.create({ ...validatedProvider, id });
        } catch (error) {
            if (error instanceof ZodError) {
                throw new ExpressReviewsError(
                    'Invalid provider data',
                    ConstantsResponse.BAD_REQUEST,
                    'ValidationError',
                    'ManageProvidersUsecase.createProvider',
                    error
                );
            }
            throw new ExpressReviewsError(
                'Failed to create provider',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageProvidersUsecase.createProvider',
                error
            );
        }
    }

    async updateProvider(id: number, data: Omit<Provider, 'id'>): Promise<Provider> {
        try {
            const existingProvider = await this.providerRepository.getProvider(id);
            if (!existingProvider) {
                throw new ExpressReviewsError(
                    'Provider not found',
                    ConstantsResponse.NOT_FOUND,
                    'NotFoundError',
                    'ManageProvidersUsecase.updateProvider'
                );
            }
            const validatedProvider = ProviderSchema.parse({ ...data, id });
            await this.providerRepository.updateProvider(validatedProvider);
            return ProviderEntity.create(validatedProvider);
        } catch (error) {
            if (error instanceof ExpressReviewsError) {
                throw error;
            }
            if (error instanceof ZodError) {
                throw new ExpressReviewsError(
                    'Invalid provider data',
                    ConstantsResponse.BAD_REQUEST,
                    'ValidationError',
                    'ManageProvidersUsecase.updateProvider',
                    error
                );
            }
            throw new ExpressReviewsError(
                'Failed to update provider',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageProvidersUsecase.updateProvider',
                error
            );
        }
    }

    async deleteProvider(id: number): Promise<void> {
        try {
            await this.providerRepository.deleteProvider(id);
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to delete provider',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageProvidersUsecase.deleteProvider',
                error
            );
        }
    }
}
