import { User } from "../entities/user";

export interface UserRepository {
    /**
     * Obtiene todos los usuarios.
     * @returns Una promesa que resuelve a un array de usuarios.
     */
    getUsers(): Promise<User[]>;

    /**
     * Obtiene un usuario por su ID.
     * @param id El ID del usuario a obtener.
     * @returns Una promesa que resuelve al usuario encontrado o null si no existe.
     */
    getUser(id: number): Promise<User | null>;

    /**
     * Crea un nuevo usuario.
     * @param user Los datos del usuario a crear (sin ID).
     * @returns Una promesa que resuelve al ID del usuario creado.
     */
    createUser(user: Omit<User, 'id'>): Promise<number>;

    /**
     * Actualiza un usuario existente.
     * @param user Los datos actualizados del usuario (incluyendo ID).
     * @returns Una promesa que se resuelve cuando la actualización se completa.
     */
    updateUser(user: User): Promise<void>;

    /**
     * Elimina un usuario por su ID.
     * @param id El ID del usuario a eliminar.
     * @returns Una promesa que se resuelve cuando la eliminación se completa.
     */
    deleteUser(id: number): Promise<void>;

    /**
     * Elimina todos los usuarios.
     * @returns Una promesa que se resuelve cuando todos los usuarios han sido eliminados.
     */
    deleteAllUsers(): Promise<void>;

    /**
     * Elimina la tabla de usuarios.
     * @returns Una promesa que se resuelve cuando la tabla ha sido eliminada.
     */
    dropUsersTable(): Promise<void>;

    getUserByEmail(email: string): Promise<User | null>;

    /**
     * Autentica a un usuario.
     * @param email El email del usuario.
     * @param password La contraseña del usuario.
     * @returns Una promesa que resuelve al usuario autenticado o null si las credenciales son incorrectas.
     */
    authenticateUser(email: string, password: string): Promise<User | null>;
}
