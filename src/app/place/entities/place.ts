import { z } from 'zod';

const PlaceType = z.enum(['ORIGIN', 'DESTINATION', 'BOTH']);
type PlaceType = z.infer<typeof PlaceType>;

export const PlaceSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, { message: 'Place name is required' }),
    code: z.string().min(2).max(10, { message: 'Place code must be between 2 and 10 characters' }),
    type: PlaceType,
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    isActive: z.boolean().default(true),
    description: z.string().optional(),
    coverages: z.array(z.number()).optional(),
    quotations: z.array(z.number()).optional(),
});

export type Place = z.infer<typeof PlaceSchema>;

export class PlaceEntity implements Place {
    id?: number;
    name: string;
    code: string;
    type: PlaceType;
    latitude?: number;
    longitude?: number;
    isActive: boolean;
    description?: string;
    coverages?: number[];
    quotations?: number[];

    constructor(place: Place) {
        this.id = place.id;
        this.name = place.name;
        this.code = place.code;
        this.type = place.type;
        this.latitude = place.latitude;
        this.longitude = place.longitude;
        this.isActive = place.isActive;
        this.description = place.description;
        this.coverages = place.coverages;
        this.quotations = place.quotations;
    }

    static create(place: unknown): PlaceEntity {
        const validatedPlace = PlaceSchema.parse(place);
        return new PlaceEntity(validatedPlace);
    }
}
