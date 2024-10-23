import { Price } from "../entities/price";

export interface PriceRepository {
    /**
     * Obtiene todos los precios.
     * @returns Una promesa que resuelve a un array de precios.
     */
    getPrices(): Promise<Price[]>;

    /**
     * Obtiene un precio por su ID.
     * @param id El ID del precio a obtener.
     * @returns Una promesa que resuelve al precio encontrado o null si no existe.
     */
    getPrice(id: number): Promise<Price | null>;

    /**
     * Crea un nuevo precio.
     * @param price Los datos del precio a crear (sin ID).
     * @returns Una promesa que resuelve al ID del precio creado.
     */
    createPrice(price: Omit<Price, 'id'>): Promise<number>;

    /**
     * Actualiza un precio existente.
     * @param price Los datos actualizados del precio (incluyendo ID).
     * @returns Una promesa que se resuelve cuando la actualización se completa.
     */
    updatePrice(price: Price): Promise<void>;

    /**
     * Elimina un precio por su ID.
     * @param id El ID del precio a eliminar.
     * @returns Una promesa que se resuelve cuando la eliminación se completa.
     */
    deletePrice(id: number): Promise<void>;

    /**
     * Obtiene precios por ID de cobertura.
     * @param coverageId El ID de la cobertura.
     * @returns Una promesa que resuelve a un array de precios de la cobertura especificada.
     */
    getPricesByCoverage(coverageId: number): Promise<Price[]>;

    /**
     * Obtiene precios válidos para una fecha específica.
     * @param date La fecha para la cual se buscan precios válidos.
     * @returns Una promesa que resuelve a un array de precios válidos para la fecha.
     */
    getPricesByValidDate(date: Date): Promise<Price[]>;

    /**
     * Obtiene precios por su estado activo.
     * @param isActive Boolean que indica si se buscan precios activos (true) o inactivos (false).
     * @returns Una promesa que resuelve a un array de precios según su estado activo.
     */
    getPricesByActiveStatus(isActive: boolean): Promise<Price[]>;

    /**
     * Obtiene precios válidos para una cobertura en una fecha específica.
     * @param coverageId El ID de la cobertura.
     * @param date La fecha para la cual se buscan precios válidos.
     * @returns Una promesa que resuelve a un array de precios válidos.
     */
    getValidPricesForCoverage(coverageId: number, date: Date): Promise<Price[]>;

    /**
     * Elimina todos los precios.
     * @returns Una promesa que se resuelve cuando todos los precios han sido eliminados.
     */
    deleteAllPrices(): Promise<void>;

    /**
     * Elimina la tabla de precios.
     * @returns Una promesa que se resuelve cuando la tabla ha sido eliminada.
     */
    dropPricesTable(): Promise<void>;
}
