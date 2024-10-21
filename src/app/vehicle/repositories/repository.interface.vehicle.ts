import { Vehicle } from "../entities/vehicle";

export interface VehicleRepository {
    /**
     * Obtiene todos los vehículos.
     * @returns Una promesa que resuelve a un array de vehículos.
     */
    getVehicles(): Promise<Vehicle[]>;

    /**
     * Obtiene un vehículo por su ID.
     * @param id El ID del vehículo a obtener.
     * @returns Una promesa que resuelve al vehículo encontrado o null si no existe.
     */
    getVehicle(id: number): Promise<Vehicle | null>;

    /**
     * Crea un nuevo vehículo.
     * @param vehicle Los datos del vehículo a crear (sin ID).
     * @returns Una promesa que resuelve al ID del vehículo creado.
     */
    createVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<number>;

    /**
     * Actualiza un vehículo existente.
     * @param vehicle Los datos actualizados del vehículo (incluyendo ID).
     * @returns Una promesa que se resuelve cuando la actualización se completa.
     */
    updateVehicle(vehicle: Vehicle): Promise<void>;

    /**
     * Elimina un vehículo por su ID.
     * @param id El ID del vehículo a eliminar.
     * @returns Una promesa que se resuelve cuando la eliminación se completa.
     */
    deleteVehicle(id: number): Promise<void>;

    /**
     * Obtiene vehículos por ID de proveedor.
     * @param providerId El ID del proveedor.
     * @returns Una promesa que resuelve a un array de vehículos del proveedor especificado.
     */
    getVehiclesByProvider(providerId: number): Promise<Vehicle[]>;

    /**
     * Obtiene vehículos por ID de categoría.
     * @param categoryId El ID de la categoría.
     * @returns Una promesa que resuelve a un array de vehículos de la categoría especificada.
     */
    getVehiclesByCategory(categoryId: number): Promise<Vehicle[]>;

    /**
     * Obtiene vehículos por su estado activo.
     * @param isActive Boolean que indica si se buscan vehículos activos (true) o inactivos (false).
     * @returns Una promesa que resuelve a un array de vehículos según su estado activo.
     */
    getVehiclesByActiveStatus(isActive: boolean): Promise<Vehicle[]>;

    /**
     * Elimina todos los vehículos.
     * @returns Una promesa que se resuelve cuando todos los vehículos han sido eliminados.
     */
    deleteAllVehicles(): Promise<void>;

    /**
     * Elimina la tabla de vehículos.
     * @returns Una promesa que se resuelve cuando la tabla ha sido eliminada.
     */
    dropVehiclesTable(): Promise<void>;
}
