import { z } from 'zod';

export const VehicleSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, { message: 'Vehicle name is required' }),
    code: z.string().min(2).max(10, { message: 'Vehicle code must be between 2 and 10 characters' }),
    capacity: z.number().int().positive({ message: 'Capacity must be a positive integer' }),
    isActive: z.boolean().default(true),
    description: z.string().optional(),
    // Relaciones
    providerId: z.number(), // ID del proveedor asociado
    categoryId: z.number(), // ID de la categoría asociada
    coverages: z.array(z.number()).optional(), // IDs de las coberturas relacionadas
});

export type Vehicle = z.infer<typeof VehicleSchema>;

export class VehicleEntity implements Vehicle {
    id?: number;
    name: string;
    code: string;
    capacity: number;
    isActive: boolean;
    description?: string;
    providerId: number;
    categoryId: number;
    coverages?: number[];

    constructor(vehicle: Vehicle) {
        this.id = vehicle.id;
        this.name = vehicle.name;
        this.code = vehicle.code;
        this.capacity = vehicle.capacity;
        this.isActive = vehicle.isActive;
        this.description = vehicle.description;
        this.providerId = vehicle.providerId;
        this.categoryId = vehicle.categoryId;
        this.coverages = vehicle.coverages;
    }

    static create(vehicle: unknown): VehicleEntity {
        const validatedVehicle = VehicleSchema.parse(vehicle);
        return new VehicleEntity(validatedVehicle);
    }
}
