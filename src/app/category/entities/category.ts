import { z } from 'zod';

export const CategorySchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, { message: 'Category name is required' }),
    description: z.string().optional(),
    comfortLevel: z.number().int().min(1).max(5).optional(),
    isActive: z.boolean().default(true),
    // Relación
    vehicles: z.array(z.number()).optional(), // IDs de los vehículos relacionados
});

export type Category = z.infer<typeof CategorySchema>;

export class CategoryEntity implements Category {
    id?: number;
    name: string;
    description?: string;
    comfortLevel?: number;
    isActive: boolean;
    vehicles?: number[];

    constructor(category: Category) {
        this.id = category.id;
        this.name = category.name;
        this.description = category.description;
        this.comfortLevel = category.comfortLevel;
        this.isActive = category.isActive;
        this.vehicles = category.vehicles;
    }

    static create(category: unknown): CategoryEntity {
        const validatedCategory = CategorySchema.parse(category);
        return new CategoryEntity(validatedCategory);
    }
}
