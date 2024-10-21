import ExpressReviewsError from "../types/expressReviewError";
import {NextFunction} from "express";

export function ThrowError(error: ExpressReviewsError, next: NextFunction) {
    next(error);
}
