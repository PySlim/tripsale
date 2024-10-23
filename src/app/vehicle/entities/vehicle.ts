import { z } from 'zod';
import {ProviderSchema} from "../../provider/entities/provider";
import {CategorySchema} from "../../category/entities/category";
import {CoverageSchema} from "../../coverage/entities/coverage";

// Importamos los esquemas de Provider, Category y Coverage si los tienes definidos


// Definimos el esquema para Vehicle
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
    // Asociaciones opcionales con entidades
    provider: ProviderSchema.optional(),
    category: CategorySchema.optional(),
    coverages: z.array(CoverageSchema).optional(), // Arreglo de coberturas asociadas
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
    // Asociaciones opcionales con entidades
    provider?: z.infer<typeof ProviderSchema>;
    category?: z.infer<typeof CategorySchema>;
    coverages?: z.infer<typeof CoverageSchema>[];

    constructor(vehicle: Vehicle) {
        this.id = vehicle.id;
        this.name = vehicle.name;
        this.code = vehicle.code;
        this.capacity = vehicle.capacity;
        this.isActive = vehicle.isActive;
        this.description = vehicle.description;
        this.providerId = vehicle.providerId;
        this.categoryId = vehicle.categoryId;
        // Asignamos las asociaciones opcionales si están presentes
        this.provider = vehicle.provider;
        this.category = vehicle.category;
        this.coverages = vehicle.coverages;
    }

    static create(vehicle: unknown): VehicleEntity {
        const validatedVehicle = VehicleSchema.parse(vehicle);
        return new VehicleEntity(validatedVehicle);
    }
}
