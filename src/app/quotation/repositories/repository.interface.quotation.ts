import { Quotation, QuotationStatus } from "../entities/quotation";

export interface QuotationRepository {
    /**
     * Obtiene todas las cotizaciones.
     * @returns Una promesa que resuelve a un array de cotizaciones.
     */
    getQuotations(): Promise<Quotation[]>;

    /**
     * Obtiene una cotización por su ID.
     * @param id El ID de la cotización a obtener.
     * @returns Una promesa que resuelve a la cotización encontrada o null si no existe.
     */
    getQuotation(id: number): Promise<Quotation | null>;

    /**
     * Crea una nueva cotización.
     * @param quotation Los datos de la cotización a crear (sin ID).
     * @returns Una promesa que resuelve al ID de la cotización creada.
     */
    createQuotation(quotation: Omit<Quotation, 'id'>): Promise<number>;

    /**
     * Actualiza una cotización existente.
     * @param quotation Los datos actualizados de la cotización (incluyendo ID).
     * @returns Una promesa que se resuelve cuando la actualización se completa.
     */
    updateQuotation(quotation: Quotation): Promise<void>;

    /**
     * Elimina una cotización por su ID.
     * @param id El ID de la cotización a eliminar.
     * @returns Una promesa que se resuelve cuando la eliminación se completa.
     */
    deleteQuotation(id: number): Promise<void>;

    /**
     * Obtiene cotizaciones por ID de usuario.
     * @param userId El ID del usuario.
     * @returns Una promesa que resuelve a un array de cotizaciones del usuario.
     */
    getQuotationsByUser(userId: number): Promise<Quotation[]>;

    /**
     * Obtiene cotizaciones por ID de proveedor.
     * @param providerId El ID del proveedor.
     * @returns Una promesa que resuelve a un array de cotizaciones del proveedor.
     */
    getQuotationsByProvider(providerId: number): Promise<Quotation[]>;

    /**
     * Obtiene cotizaciones por estado.
     * @param status El estado de las cotizaciones a buscar.
     * @returns Una promesa que resuelve a un array de cotizaciones con el estado especificado.
     */
    getQuotationsByStatus(status: QuotationStatus): Promise<Quotation[]>;

    /**
     * Obtiene cotizaciones dentro de un rango de fechas.
     * @param startDate Fecha inicial del rango.
     * @param endDate Fecha final del rango.
     * @returns Una promesa que resuelve a un array de cotizaciones dentro del rango.
     */
    getQuotationsByDateRange(startDate: Date, endDate: Date): Promise<Quotation[]>;

    /**
     * Obtiene cotizaciones por origen y destino.
     * @param originId ID del lugar de origen.
     * @param destinationId ID del lugar de destino.
     * @returns Una promesa que resuelve a un array de cotizaciones con el origen y destino especificados.
     */
    getQuotationsByRoute(originId: number, destinationId: number): Promise<Quotation[]>;

    /**
     * Verifica la capacidad disponible para una cotización.
     * @param coverageId ID de la cobertura.
     * @param travelDate Fecha del viaje.
     * @param passengerCount Cantidad de pasajeros.
     * @returns Una promesa que resuelve a true si hay capacidad disponible, false si no.
     */
    checkAvailableCapacity(coverageId: number, travelDate: Date, passengerCount: number): Promise<boolean>;

    /**
     * Obtiene la cantidad de reservas existentes para una cobertura en una fecha.
     * @param coverageId ID de la cobertura.
     * @param travelDate Fecha del viaje.
     * @returns Una promesa que resuelve al número de reservas existentes.
     */
    getExistingReservations(coverageId: number, travelDate: Date): Promise<number>;

    /**
     * Obtiene todas las cotizaciones activas.
     * @returns Una promesa que resuelve a un array de cotizaciones activas.
     */
    getActiveQuotations(): Promise<Quotation[]>;

    /**
     * Elimina todas las cotizaciones.
     * @returns Una promesa que se resuelve cuando todas las cotizaciones han sido eliminadas.
     */
    deleteAllQuotations(): Promise<void>;

    /**
     * Elimina la tabla de cotizaciones.
     * @returns Una promesa que se resuelve cuando la tabla ha sido eliminada.
     */
    dropQuotationsTable(): Promise<void>;
}
