import { z } from 'zod';

export const PriceSchema = z.object({
    id: z.number().optional(),
    amount: z.number().positive(),
    currency: z.string().min(3).max(3),
    validFrom: z.date(),
    validTo: z.date(),
    isActive: z.boolean().default(true),
    // Relación
    coverageId: z.number(),
});

export type Price = z.infer<typeof PriceSchema>;

export class PriceEntity implements Price {
    id?: number;
    amount: number;
    currency: string;
    validFrom: Date;
    validTo: Date;
    isActive: boolean;
    coverageId: number;

    constructor(price: Price) {
        this.id = price.id;
        this.amount = price.amount;
        this.currency = price.currency;
        this.validFrom = price.validFrom;
        this.validTo = price.validTo;
        this.isActive = price.isActive;
        this.coverageId = price.coverageId;
    }

    static create(price: unknown): PriceEntity {
        const validatedPrice = PriceSchema.parse(price);
        return new PriceEntity(validatedPrice);
    }
}
