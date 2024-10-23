import { Price, PriceEntity, PriceSchema } from '../entities/price';
import { PriceRepository } from "../repositories/repository.interface.price";

import ExpressReviewsError from '../../../utils/error/types/expressReviewError';
import { ZodError } from 'zod';
import { ConstantsResponse } from '../../../constants/constants';

export class ManagePricesUsecase {
    constructor(
        private priceRepository: PriceRepository
    ) {}

    async getPrices(): Promise<Price[]> {
        try {
            const prices = await this.priceRepository.getPrices();
            return prices.map(price => PriceEntity.create(price));
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get prices',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManagePricesUsecase.getPrices',
                error
            );
        }
    }

    async getPrice(id: number): Promise<Price | null> {
        try {
            const price = await this.priceRepository.getPrice(id);
            return price ? PriceEntity.create(price) : null;
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get price',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManagePricesUsecase.getPrice',
                error
            );
        }
    }

    async createPrice(data: Omit<Price, 'id'>): Promise<Price> {
        try {
            this.validateDateRange(data.validFrom, data.validTo);
            const validatedPrice = PriceSchema.omit({ id: true }).parse(data);
            const id = await this.priceRepository.createPrice(validatedPrice);
            return PriceEntity.create({ ...validatedPrice, id });
        } catch (error) {
            if (error instanceof ZodError) {
                throw new ExpressReviewsError(
                    'Invalid price data',
                    ConstantsResponse.BAD_REQUEST,
                    'ValidationError',
                    'ManagePricesUsecase.createPrice',
                    error
                );
            }
            throw new ExpressReviewsError(
                'Failed to create price',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManagePricesUsecase.createPrice',
                error
            );
        }
    }

    async updatePrice(id: number, data: Omit<Price, 'id'>): Promise<Price> {
        try {
            const existingPrice = await this.priceRepository.getPrice(id);
            if (!existingPrice) {
                throw new ExpressReviewsError(
                    'Price not found',
                    ConstantsResponse.NOT_FOUND,
                    'NotFoundError',
                    'ManagePricesUsecase.updatePrice'
                );
            }
            this.validateDateRange(data.validFrom, data.validTo);
            const validatedPrice = PriceSchema.parse({ ...data, id });
            await this.priceRepository.updatePrice(validatedPrice);
            return PriceEntity.create(validatedPrice);
        } catch (error) {
            if (error instanceof ExpressReviewsError) {
                throw error;
            }
            if (error instanceof ZodError) {
                throw new ExpressReviewsError(
                    'Invalid price data',
                    ConstantsResponse.BAD_REQUEST,
                    'ValidationError',
                    'ManagePricesUsecase.updatePrice',
                    error
                );
            }
            throw new ExpressReviewsError(
                'Failed to update price',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManagePricesUsecase.updatePrice',
                error
            );
        }
    }

    async deletePrice(id: number): Promise<void> {
        try {
            await this.priceRepository.deletePrice(id);
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to delete price',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManagePricesUsecase.deletePrice',
                error
            );
        }
    }

    async getPricesByCoverage(coverageId: number): Promise<Price[]> {
        try {
            const prices = await this.priceRepository.getPricesByCoverage(coverageId);
            return prices.map(price => PriceEntity.create(price));
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get prices by coverage',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManagePricesUsecase.getPricesByCoverage',
                error
            );
        }
    }

    async getPricesByValidDate(date: Date): Promise<Price[]> {
        try {
            const prices = await this.priceRepository.getPricesByValidDate(date);
            return prices.map(price => PriceEntity.create(price));
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get prices by valid date',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManagePricesUsecase.getPricesByValidDate',
                error
            );
        }
    }

    async getValidPricesForCoverage(coverageId: number, date: Date): Promise<Price[]> {
        try {
            const prices = await this.priceRepository.getValidPricesForCoverage(coverageId, date);
            return prices.map(price => PriceEntity.create(price));
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get valid prices for coverage',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManagePricesUsecase.getValidPricesForCoverage',
                error
            );
        }
    }

    async getPricesByActiveStatus(isActive: boolean): Promise<Price[]> {
        try {
            const prices = await this.priceRepository.getPricesByActiveStatus(isActive);
            return prices.map(price => PriceEntity.create(price));
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get prices by active status',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManagePricesUsecase.getPricesByActiveStatus',
                error
            );
        }
    }

    private validateDateRange(validFrom: Date, validTo: Date): void {
        if (validFrom > validTo) {
            throw new ExpressReviewsError(
                'Valid from date must be before valid to date',
                ConstantsResponse.BAD_REQUEST,
                'ValidationError',
                'ManagePricesUsecase.validateDateRange'
            );
        }

        if (validFrom < new Date()) {
            throw new ExpressReviewsError(
                'Valid from date cannot be in the past',
                ConstantsResponse.BAD_REQUEST,
                'ValidationError',
                'ManagePricesUsecase.validateDateRange'
            );
        }
    }
}
