import { Category } from "../entities/category";

export interface CategoryRepository {
    /**
     * Obtiene todas las categorías.
     * @returns Una promesa que resuelve a un array de categorías.
     */
    getCategories(): Promise<Category[]>;

    /**
     * Obtiene una categoría por su ID.
     * @param id El ID de la categoría a obtener.
     * @returns Una promesa que resuelve a la categoría encontrada o null si no existe.
     */
    getCategory(id: number): Promise<Category | null>;

    /**
     * Crea una nueva categoría.
     * @param category Los datos de la categoría a crear (sin ID).
     * @returns Una promesa que resuelve al ID de la categoría creada.
     */
    createCategory(category: Omit<Category, 'id'>): Promise<number>;

    /**
     * Actualiza una categoría existente.
     * @param category Los datos actualizados de la categoría (incluyendo ID).
     * @returns Una promesa que se resuelve cuando la actualización se completa.
     */
    updateCategory(category: Category): Promise<void>;

    /**
     * Elimina una categoría por su ID.
     * @param id El ID de la categoría a eliminar.
     * @returns Una promesa que se resuelve cuando la eliminación se completa.
     */
    deleteCategory(id: number): Promise<void>;

    /**
     * Elimina todas las categorías.
     * @returns Una promesa que se resuelve cuando todas las categorías han sido eliminadas.
     */
    deleteAllCategories(): Promise<void>;

    /**
     * Elimina la tabla de categorías.
     * @returns Una promesa que se resuelve cuando la tabla ha sido eliminada.
     */
    dropCategoriesTable(): Promise<void>;
}
