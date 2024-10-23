// src/app/quotation/usecases/quotation.usecase.ts
import { Quotation, QuotationEntity, QuotationSchema, QuotationStatus } from '../entities/quotation';
import { QuotationRepository } from "../repositories/repository.interface.quotation";

import ExpressReviewsError from '../../../utils/error/types/expressReviewError';
import { ZodError } from 'zod';
import { ConstantsResponse } from '../../../constants/constants';

export class ManageQuotationsUsecase {
    constructor(
        private quotationRepository: QuotationRepository
    ) {}

    async getQuotations(): Promise<Quotation[]> {
        try {
            const quotations = await this.quotationRepository.getQuotations();
            return quotations.map(quotation => QuotationEntity.create(quotation));
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get quotations',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageQuotationsUsecase.getQuotations',
                error
            );
        }
    }

    async getQuotation(id: number): Promise<Quotation | null> {
        try {
            const quotation = await this.quotationRepository.getQuotation(id);
            return quotation ? QuotationEntity.create(quotation) : null;
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get quotation',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageQuotationsUsecase.getQuotation',
                error
            );
        }
    }

    async createQuotation(data: Omit<Quotation, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Quotation> {
        try {
            // Validar fecha de viaje
            if (new Date(data.travelDate) < new Date()) {
                throw new ExpressReviewsError(
                    'Travel date cannot be in the past',
                    ConstantsResponse.BAD_REQUEST,
                    'ValidationError',
                    'ManageQuotationsUsecase.createQuotation'
                );
            }

            const quotationData = {
                ...data,
                status: QuotationStatus.CREATED,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const validatedQuotation = QuotationSchema.omit({ id: true }).parse(quotationData);
            const id = await this.quotationRepository.createQuotation(validatedQuotation);
            return QuotationEntity.create({ ...validatedQuotation, id });
        } catch (error) {
            if (error instanceof ZodError) {
                throw new ExpressReviewsError(
                    'Invalid quotation data',
                    ConstantsResponse.BAD_REQUEST,
                    'ValidationError',
                    'ManageQuotationsUsecase.createQuotation',
                    error
                );
            }
            throw new ExpressReviewsError(
                'Failed to create quotation',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageQuotationsUsecase.createQuotation',
                error
            );
        }
    }

    async updateQuotationStatus(id: number, newStatus: QuotationStatus, coverageId?: number, priceId?: number): Promise<Quotation> {
        try {
            const existingQuotation = await this.quotationRepository.getQuotation(id);
            if (!existingQuotation) {
                throw new ExpressReviewsError(
                    'Quotation not found',
                    ConstantsResponse.NOT_FOUND,
                    'NotFoundError',
                    'ManageQuotationsUsecase.updateQuotationStatus'
                );
            }

            const quotationEntity = QuotationEntity.create(existingQuotation);

            // Verificar si el cambio de estado es válido
            if (!quotationEntity.canTransitionTo(newStatus)) {
                throw new ExpressReviewsError(
                    `Invalid status transition from ${quotationEntity.status} to ${newStatus}`,
                    ConstantsResponse.BAD_REQUEST,
                    'ValidationError',
                    'ManageQuotationsUsecase.updateQuotationStatus'
                );
            }

            // Si se está cambiando a RESERVED, verificar capacidad y asignar cobertura/precio
            if (newStatus === QuotationStatus.RESERVED) {
                if (!coverageId || !priceId) {
                    throw new ExpressReviewsError(
                        'Coverage and price are required for reservation',
                        ConstantsResponse.BAD_REQUEST,
                        'ValidationError',
                        'ManageQuotationsUsecase.updateQuotationStatus'
                    );
                }

                const hasCapacity = await this.quotationRepository.checkAvailableCapacity(
                    coverageId,
                    quotationEntity.travelDate,
                    quotationEntity.passengerCount
                );

                if (!hasCapacity) {
                    throw new ExpressReviewsError(
                        'No capacity available for this coverage',
                        ConstantsResponse.BAD_REQUEST,
                        'ValidationError',
                        'ManageQuotationsUsecase.updateQuotationStatus'
                    );
                }

                quotationEntity.assignCoverageAndPrice(coverageId, priceId);
            }

            quotationEntity.updateStatus(newStatus);
            await this.quotationRepository.updateQuotation(quotationEntity);
            return quotationEntity;
        } catch (error) {
            if (error instanceof ExpressReviewsError) {
                throw error;
            }
            throw new ExpressReviewsError(
                'Failed to update quotation status',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageQuotationsUsecase.updateQuotationStatus',
                error
            );
        }
    }

    async getQuotationsByUser(userId: number): Promise<Quotation[]> {
        try {
            const quotations = await this.quotationRepository.getQuotationsByUser(userId);
            return quotations.map(quotation => QuotationEntity.create(quotation));
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get quotations by user',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageQuotationsUsecase.getQuotationsByUser',
                error
            );
        }
    }

    async getQuotationsByProvider(providerId: number): Promise<Quotation[]> {
        try {
            const quotations = await this.quotationRepository.getQuotationsByProvider(providerId);
            return quotations.map(quotation => QuotationEntity.create(quotation));
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get quotations by provider',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageQuotationsUsecase.getQuotationsByProvider',
                error
            );
        }
    }

    async getQuotationsByDateRange(startDate: Date, endDate: Date): Promise<Quotation[]> {
        try {
            const quotations = await this.quotationRepository.getQuotationsByDateRange(startDate, endDate);
            return quotations.map(quotation => QuotationEntity.create(quotation));
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get quotations by date range',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageQuotationsUsecase.getQuotationsByDateRange',
                error
            );
        }
    }

    async deleteQuotation(id: number): Promise<void> {
        try {
            const quotation = await this.quotationRepository.getQuotation(id);
            if (!quotation) {
                throw new ExpressReviewsError(
                    'Quotation not found',
                    ConstantsResponse.NOT_FOUND,
                    'NotFoundError',
                    'ManageQuotationsUsecase.deleteQuotation'
                );
            }

            if (quotation.status === QuotationStatus.RESERVED) {
                throw new ExpressReviewsError(
                    'Cannot delete a reserved quotation',
                    ConstantsResponse.BAD_REQUEST,
                    'ValidationError',
                    'ManageQuotationsUsecase.deleteQuotation'
                );
            }

            await this.quotationRepository.deleteQuotation(id);
        } catch (error) {
            if (error instanceof ExpressReviewsError) {
                throw error;
            }
            throw new ExpressReviewsError(
                'Failed to delete quotation',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageQuotationsUsecase.deleteQuotation',
                error
            );
        }
    }
}
