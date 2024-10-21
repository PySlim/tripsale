import { ZodError } from "zod";
import ExpressReviewsError from "../types/expressReviewError";
import {NextFunction, Request, Response} from "express";

export const HandlerError =
    (error: Error | ZodError | ExpressReviewsError, req: Request, res: Response, next: NextFunction)=>{
        if(error instanceof ZodError){
            res.status(400).json({
                ok:false,
                message:'Validation Error',
                data:[],
                pagination:{},
                error:error.formErrors.fieldErrors

            });
        } else if(error instanceof ExpressReviewsError){
            res.status(error.statusCode).json({
                ok:false,
                message:'Functional Error',
                data:[],
                pagination:{},
                error:{
                    message: error.message,
                    type: error.type,
                    details: error.details,
                    timestamp: error.timesTamp,
                    techInfo: error.techInfo
                }
            });
        }else{
            res.status(500).send(error.message);
        }
    }
