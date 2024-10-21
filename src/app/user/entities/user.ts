// src/app/user/entities/user.ts
import { z } from 'zod';

export const UserSchema = z.object({
    id: z.number().optional(),
    firstName: z.string().min(1, { message: 'First name is required' }),
    secondName: z.string().min(1, { message: 'Second name is required' }),
    document: z.number().int().positive({ message: 'Document must be a positive integer' }),
    email: z.string().email({ message: 'Invalid email format' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export type User = z.infer<typeof UserSchema>;

export class UserEntity implements User {
    id?: number;
    firstName: string;
    secondName: string;
    document: number;
    email: string;
    password: string;

    constructor(user: User) {
        this.id = user.id;
        this.firstName = user.firstName;
        this.secondName = user.secondName;
        this.document = user.document;
        this.email = user.email;
        this.password = user.password;
    }

    static create(user: unknown): UserEntity {
        const validatedUser = UserSchema.parse(user);
        return new UserEntity(validatedUser);
    }
}
