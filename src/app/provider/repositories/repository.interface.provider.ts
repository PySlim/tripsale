import { Provider } from "../entities/provider";

export interface ProviderRepository {
    /**
     * Obtiene todos los proveedores.
     * @returns Una promesa que resuelve a un array de proveedores.
     */
    getProviders(): Promise<Provider[]>;

    /**
     * Obtiene un proveedor por su ID.
     * @param id El ID del proveedor a obtener.
     * @returns Una promesa que resuelve al proveedor encontrado o null si no existe.
     */
    getProvider(id: number): Promise<Provider | null>;

    /**
     * Crea un nuevo proveedor.
     * @param provider Los datos del proveedor a crear (sin ID).
     * @returns Una promesa que resuelve al ID del proveedor creado.
     */
    createProvider(provider: Omit<Provider, 'id'>): Promise<number>;

    /**
     * Actualiza un proveedor existente.
     * @param provider Los datos actualizados del proveedor (incluyendo ID).
     * @returns Una promesa que se resuelve cuando la actualización se completa.
     */
    updateProvider(provider: Provider): Promise<void>;

    /**
     * Elimina un proveedor por su ID.
     * @param id El ID del proveedor a eliminar.
     * @returns Una promesa que se resuelve cuando la eliminación se completa.
     */
    deleteProvider(id: number): Promise<void>;

    /**
     * Elimina todos los proveedores.
     * @returns Una promesa que se resuelve cuando todos los proveedores han sido eliminados.
     */
    deleteAllProviders(): Promise<void>;

    /**
     * Elimina la tabla de proveedores.
     * @returns Una promesa que se resuelve cuando la tabla ha sido eliminada.
     */
    dropProvidersTable(): Promise<void>;
}
