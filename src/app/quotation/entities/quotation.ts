import { z } from 'zod';

// Definimos los estados posibles de una cotización
export enum QuotationStatus {
    CREATED = 'CREATED',
    RESERVED = 'RESERVED',
    CANCELLED = 'CANCELLED'
}

export const QuotationSchema = z.object({
    id: z.number().optional(),
    status: z.nativeEnum(QuotationStatus).default(QuotationStatus.CREATED),
    travelDate: z.date(),
    passengerCount: z.number().int().positive(),
    isActive: z.boolean().default(true),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
    // Relaciones
    userId: z.number(),
    originPlaceId: z.number(),
    destinationPlaceId: z.number(),
    categoryId: z.number().optional(),  // Opcional según requerimiento
    coverageId: z.number().optional(),  // Se asigna cuando pasa a estado "reserva"
    priceId: z.number().optional(),     // Se asigna cuando pasa a estado "reserva"
});

export type Quotation = z.infer<typeof QuotationSchema>;

export class QuotationEntity implements Quotation {
    id?: number;
    status: QuotationStatus;
    travelDate: Date;
    passengerCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    originPlaceId: number;
    destinationPlaceId: number;
    categoryId?: number;
    coverageId?: number;
    priceId?: number;

    constructor(quotation: Quotation) {
        this.id = quotation.id;
        this.status = quotation.status;
        this.travelDate = quotation.travelDate;
        this.passengerCount = quotation.passengerCount;
        this.isActive = quotation.isActive;
        this.createdAt = quotation.createdAt;
        this.updatedAt = quotation.updatedAt;
        this.userId = quotation.userId;
        this.originPlaceId = quotation.originPlaceId;
        this.destinationPlaceId = quotation.destinationPlaceId;
        this.categoryId = quotation.categoryId;
        this.coverageId = quotation.coverageId;
        this.priceId = quotation.priceId;
    }

    static create(quotation: unknown): QuotationEntity {
        const validatedQuotation = QuotationSchema.parse(quotation);
        return new QuotationEntity(validatedQuotation);
    }

    /**
     * Verifica si la cotización puede cambiar al estado proporcionado
     */
    canTransitionTo(newStatus: QuotationStatus): boolean {
        switch (this.status) {
            case QuotationStatus.CREATED:
                return newStatus === QuotationStatus.RESERVED;
            case QuotationStatus.RESERVED:
                return newStatus === QuotationStatus.CANCELLED;
            case QuotationStatus.CANCELLED:
                return false;
            default:
                return false;
        }
    }

    /**
     * Actualiza el estado de la cotización si la transición es válida
     */
    updateStatus(newStatus: QuotationStatus): void {
        if (!this.canTransitionTo(newStatus)) {
            throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
        }
        this.status = newStatus;
        this.updatedAt = new Date();
    }

    /**
     * Asigna una cobertura y precio a la cotización cuando se reserva
     */
    assignCoverageAndPrice(coverageId: number, priceId: number): void {
        if (this.status !== QuotationStatus.CREATED) {
            throw new Error('Can only assign coverage and price to a CREATED quotation');
        }
        this.coverageId = coverageId;
        this.priceId = priceId;
        this.updatedAt = new Date();
    }
}
