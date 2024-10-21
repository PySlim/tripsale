import {NextFunction, Request, Response} from "express";
import {Schema} from "zod";


export function ValidateRequestMiddleware(schemaBody: Schema) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schemaBody.parse(req.body);
            next();
        } catch (error) {
            next(error);
        }
    };
};
