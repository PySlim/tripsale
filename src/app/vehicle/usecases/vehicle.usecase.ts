// src/app/vehicle/usecases/vehicle.usecase.ts
import { Vehicle, VehicleEntity, VehicleSchema } from '../entities/vehicle';
import { VehicleRepository } from "../repositories/repository.interface.vehicle";

import ExpressReviewsError from '../../../utils/error/types/expressReviewError';
import { ZodError } from 'zod';
import { ConstantsResponse } from '../../../enviroments_variables/constants';

export class ManageVehiclesUsecase {
    constructor(
        private vehicleRepository: VehicleRepository
    ) {}

    async getVehicles(): Promise<Vehicle[]> {
        try {
            const vehicles = await this.vehicleRepository.getVehicles();
            return vehicles.map(vehicle => VehicleEntity.create(vehicle));
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get vehicles',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageVehiclesUsecase.getVehicles',
                error
            );
        }
    }

    async getVehicle(id: number): Promise<Vehicle | null> {
        try {
            const vehicle = await this.vehicleRepository.getVehicle(id);
            return vehicle ? VehicleEntity.create(vehicle) : null;
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get vehicle',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageVehiclesUsecase.getVehicle',
                error
            );
        }
    }

    async createVehicle(data: Omit<Vehicle, 'id'>): Promise<Vehicle> {
        try {
            const validatedVehicle = VehicleSchema.omit({ id: true }).parse(data);
            const id = await this.vehicleRepository.createVehicle(validatedVehicle);
            return VehicleEntity.create({ ...validatedVehicle, id });
        } catch (error) {
            if (error instanceof ZodError) {
                throw new ExpressReviewsError(
                    'Invalid vehicle data',
                    ConstantsResponse.BAD_REQUEST,
                    'ValidationError',
                    'ManageVehiclesUsecase.createVehicle',
                    error
                );
            }
            throw new ExpressReviewsError(
                'Failed to create vehicle',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageVehiclesUsecase.createVehicle',
                error
            );
        }
    }

    async updateVehicle(id: number, data: Omit<Vehicle, 'id'>): Promise<Vehicle> {
        try {
            const existingVehicle = await this.vehicleRepository.getVehicle(id);
            if (!existingVehicle) {
                throw new ExpressReviewsError(
                    'Vehicle not found',
                    ConstantsResponse.NOT_FOUND,
                    'NotFoundError',
                    'ManageVehiclesUsecase.updateVehicle'
                );
            }
            const validatedVehicle = VehicleSchema.parse({ ...data, id });
            await this.vehicleRepository.updateVehicle(validatedVehicle);
            return VehicleEntity.create(validatedVehicle);
        } catch (error) {
            if (error instanceof ExpressReviewsError) {
                throw error;
            }
            if (error instanceof ZodError) {
                throw new ExpressReviewsError(
                    'Invalid vehicle data',
                    ConstantsResponse.BAD_REQUEST,
                    'ValidationError',
                    'ManageVehiclesUsecase.updateVehicle',
                    error
                );
            }
            throw new ExpressReviewsError(
                'Failed to update vehicle',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageVehiclesUsecase.updateVehicle',
                error
            );
        }
    }

    async deleteVehicle(id: number): Promise<void> {
        try {
            await this.vehicleRepository.deleteVehicle(id);
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to delete vehicle',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageVehiclesUsecase.deleteVehicle',
                error
            );
        }
    }

    async getVehiclesByProvider(providerId: number): Promise<Vehicle[]> {
        try {
            const vehicles = await this.vehicleRepository.getVehiclesByProvider(providerId);
            return vehicles.map(vehicle => VehicleEntity.create(vehicle));
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get vehicles by provider',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageVehiclesUsecase.getVehiclesByProvider',
                error
            );
        }
    }

    async getVehiclesByCategory(categoryId: number): Promise<Vehicle[]> {
        try {
            const vehicles = await this.vehicleRepository.getVehiclesByCategory(categoryId);
            return vehicles.map(vehicle => VehicleEntity.create(vehicle));
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get vehicles by category',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageVehiclesUsecase.getVehiclesByCategory',
                error
            );
        }
    }

    async getVehiclesByActiveStatus(isActive: boolean): Promise<Vehicle[]> {
        try {
            const vehicles = await this.vehicleRepository.getVehiclesByActiveStatus(isActive);
            return vehicles.map(vehicle => VehicleEntity.create(vehicle));
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get vehicles by active status',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageVehiclesUsecase.getVehiclesByActiveStatus',
                error
            );
        }
    }
}
