// src/app/place/usecases/place.usecase.ts
import { Place, PlaceEntity, PlaceSchema } from '../entities/place';
import { PlaceRepository } from "../repositories/repository.interface.place";

import ExpressReviewsError from '../../../utils/error/types/expressReviewError';
import { ZodError } from 'zod';
import { ConstantsResponse } from '../../../constants/constants';

export class ManagePlacesUsecase {
    constructor(
        private placeRepository: PlaceRepository
    ) {}

    async getPlaces(): Promise<Place[]> {
        try {
            const places = await this.placeRepository.getPlaces();
            return places.map(place => PlaceEntity.create(place));
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get places',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManagePlacesUsecase.getPlaces',
                error
            );
        }
    }

    async getPlace(id: number): Promise<Place | null> {
        try {
            const place = await this.placeRepository.getPlace(id);
            return place ? PlaceEntity.create(place) : null;
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get place',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManagePlacesUsecase.getPlace',
                error
            );
        }
    }

    async createPlace(data: Omit<Place, 'id'>): Promise<Place> {
        try {
            const validatedPlace = PlaceSchema.omit({ id: true }).parse(data);
            const id = await this.placeRepository.createPlace(validatedPlace);
            return PlaceEntity.create({ ...validatedPlace, id });
        } catch (error) {
            if (error instanceof ZodError) {
                throw new ExpressReviewsError(
                    'Invalid place data',
                    ConstantsResponse.BAD_REQUEST,
                    'ValidationError',
                    'ManagePlacesUsecase.createPlace',
                    error
                );
            }
            throw new ExpressReviewsError(
                'Failed to create place',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManagePlacesUsecase.createPlace',
                error
            );
        }
    }

    async updatePlace(id: number, data: Omit<Place, 'id'>): Promise<Place> {
        try {
            const existingPlace = await this.placeRepository.getPlace(id);
            if (!existingPlace) {
                throw new ExpressReviewsError(
                    'Place not found',
                    ConstantsResponse.NOT_FOUND,
                    'NotFoundError',
                    'ManagePlacesUsecase.updatePlace'
                );
            }
            const validatedPlace = PlaceSchema.parse({ ...data, id });
            await this.placeRepository.updatePlace(validatedPlace);
            return PlaceEntity.create(validatedPlace);
        } catch (error) {
            if (error instanceof ExpressReviewsError) {
                throw error;
            }
            if (error instanceof ZodError) {
                throw new ExpressReviewsError(
                    'Invalid place data',
                    ConstantsResponse.BAD_REQUEST,
                    'ValidationError',
                    'ManagePlacesUsecase.updatePlace',
                    error
                );
            }
            throw new ExpressReviewsError(
                'Failed to update place',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManagePlacesUsecase.updatePlace',
                error
            );
        }
    }

    async deletePlace(id: number): Promise<void> {
        try {
            await this.placeRepository.deletePlace(id);
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to delete place',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManagePlacesUsecase.deletePlace',
                error
            );
        }
    }

    async getPlacesByType(type: Place['type']): Promise<Place[]> {
        try {
            const places = await this.placeRepository.getPlacesByType(type);
            return places.map(place => PlaceEntity.create(place));
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get places by type',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManagePlacesUsecase.getPlacesByType',
                error
            );
        }
    }

    async getPlacesByActiveStatus(isActive: boolean): Promise<Place[]> {
        try {
            const places = await this.placeRepository.getPlacesByActiveStatus(isActive);
            return places.map(place => PlaceEntity.create(place));
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get places by active status',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManagePlacesUsecase.getPlacesByActiveStatus',
                error
            );
        }
    }
}
