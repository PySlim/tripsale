import { Place } from "../entities/place";

export interface PlaceRepository {
    /**
     * Obtiene todos los lugares.
     * @returns Una promesa que resuelve a un array de lugares.
     */
    getPlaces(): Promise<Place[]>;

    /**
     * Obtiene un lugar por su ID.
     * @param id El ID del lugar a obtener.
     * @returns Una promesa que resuelve al lugar encontrado o null si no existe.
     */
    getPlace(id: number): Promise<Place | null>;

    /**
     * Crea un nuevo lugar.
     * @param place Los datos del lugar a crear (sin ID).
     * @returns Una promesa que resuelve al ID del lugar creado.
     */
    createPlace(place: Omit<Place, 'id'>): Promise<number>;

    /**
     * Actualiza un lugar existente.
     * @param place Los datos actualizados del lugar (incluyendo ID).
     * @returns Una promesa que se resuelve cuando la actualización se completa.
     */
    updatePlace(place: Place): Promise<void>;

    /**
     * Elimina un lugar por su ID.
     * @param id El ID del lugar a eliminar.
     * @returns Una promesa que se resuelve cuando la eliminación se completa.
     */
    deletePlace(id: number): Promise<void>;

    /**
     * Elimina todos los lugares.
     * @returns Una promesa que se resuelve cuando todos los lugares han sido eliminados.
     */
    deleteAllPlaces(): Promise<void>;

    /**
     * Elimina la tabla de lugares.
     * @returns Una promesa que se resuelve cuando la tabla ha sido eliminada.
     */
    dropPlacesTable(): Promise<void>;

    /**
     * Obtiene lugares por tipo.
     * @param type El tipo de lugar ('ORIGIN', 'DESTINATION', o 'BOTH').
     * @returns Una promesa que resuelve a un array de lugares del tipo especificado.
     */
    getPlacesByType(type: Place['type']): Promise<Place[]>;

    /**
     * Obtiene lugares por su estado activo.
     * @param isActive Boolean que indica si se buscan lugares activos (true) o inactivos (false).
     * @returns Una promesa que resuelve a un array de lugares según su estado activo.
     */
    getPlacesByActiveStatus(isActive: boolean): Promise<Place[]>;
}
