// src/resources/middlewares/validate.identity.middleware.ts
import ExpressReviewsError from "../../utils/error/types/expressReviewError";
import jwt from 'jsonwebtoken';
import { ConstantsResponse } from "../../enviroments_variables/constants";
import { getEnvVar } from "../../utils/environment/captureVariables/get.var.env";
import { NextFunction, Request, Response } from "express";


declare global {
    namespace Express {
        interface Request {
            email?: string,
            id?: string
        }
    }
}

interface JwtPayload {
    id: number;
    email: string;
}

export function ValidateIdentityMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const token: string | undefined = req.headers['authorization']?.split(" ")[1] || "";
            if (!token) throw new ExpressReviewsError('Token is invalid', ConstantsResponse.UNAUTHORIZED, "Validation Error", 'Middleware Authentications');

            const payload = jwt.verify(token, getEnvVar('SECRET_PASS')) as JwtPayload;

            req.email = payload.email;
            req.id = payload.id.toString();

            next();
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                next(new ExpressReviewsError("Token invalid.", ConstantsResponse.UNAUTHORIZED, 'Middleware Error'));
            } else {
                next(error);
            }
        }
    }
}
