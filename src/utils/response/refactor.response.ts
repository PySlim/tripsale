import {NextFunction} from "express";
import {Schema} from "zod";
import ExpressReviewsError from "../error/types/expressReviewError";
import {ConstantsResponse} from "../../enviroments_variables/constants";


export function RefactorResponse(schema: Schema, dataObject: Object | Object[], message: string, next: NextFunction, pagination?: Object):Object | any{
    try {
        let parsedData;

        if (Array.isArray(dataObject)) {
            parsedData = dataObject.map(obj => schema.parse(obj));
        } else {
            parsedData = [schema.parse(dataObject)];
        }
        return {
            ok: true,
            message: message,
            data: parsedData,
            pagination: pagination ? pagination : {}
        };

    } catch (error) {
        next(new ExpressReviewsError('Error parsing response', ConstantsResponse.INTERNAL_SERVER_ERROR,'ParserError','Without details',error));
    }
}
