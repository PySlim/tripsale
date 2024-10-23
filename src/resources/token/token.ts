import jwt from 'jsonwebtoken';
import { User } from "../../app/user/entities/user";

export function generateToken(user: User): string {
    const secretKey = process.env['JWT_SECRET'] || 'your-secret-key';  // Cambiar a ['JWT_SECRET']
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            secondName: user.secondName
        },
        secretKey,
        { expiresIn: '24h' }
    );
}
