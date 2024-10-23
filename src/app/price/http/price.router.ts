import express, { Router, Request, Response, NextFunction } from 'express';

import { HandlerError } from "../../../utils/error/handler/handlerError";
import { ValidateIdentityMiddleware } from "../../../resources/middlewares/validate.identity.middleware";
import {ManagePricesUsecase} from "../usercases/price.usecase";

export function createPricesRouter(managePricesUsecase: ManagePricesUsecase): Router {
    const router = express.Router();

    router.get("/prices", ValidateIdentityMiddleware(), async (req: Request, res: Response, next: NextFunction) => {
        try {
            const prices = await managePricesUsecase.getPrices();
            res.status(200).json({
                ok: true,
                message: 'Prices retrieved successfully',
                data: prices,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.get("/prices/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            const price = await managePricesUsecase.getPrice(id);
            if (price) {
                res.status(200).json({
                    ok: true,
                    message: 'Price retrieved successfully',
                    data: price,
                    pagination: {},
                    error: null
                });
            } else {
                res.status(404).json({
                    ok: false,
                    message: 'Price not found',
                    data: null,
                    pagination: {},
                    error: { message: 'Price not found' }
                });
            }
        } catch (error) {
            next(error);
        }
    });

    router.post("/prices", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const price = await managePricesUsecase.createPrice(req.body);
            res.status(201).json({
                ok: true,
                message: 'Price created successfully',
                data: price,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.put("/prices/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            const price = await managePricesUsecase.updatePrice(id, req.body);
            res.status(200).json({
                ok: true,
                message: 'Price updated successfully',
                data: price,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.delete("/prices/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            await managePricesUsecase.deletePrice(id);
            res.status(200).json({
                ok: true,
                message: `Price ${id} deleted successfully`,
                data: null,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.get("/prices/coverage/:coverageId", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const coverageId = parseInt(req.params['coverageId'], 10);
            const prices = await managePricesUsecase.getPricesByCoverage(coverageId);
            res.status(200).json({
                ok: true,
                message: 'Prices retrieved successfully by coverage',
                data: prices,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.get("/prices/valid-date/:date", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const date = new Date(req.params['date']);
            const prices = await managePricesUsecase.getPricesByValidDate(date);
            res.status(200).json({
                ok: true,
                message: 'Prices retrieved successfully by valid date',
                data: prices,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.get("/prices/coverage/:coverageId/date/:date", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const coverageId = parseInt(req.params['coverageId'], 10);
            const date = new Date(req.params['date']);
            const prices = await managePricesUsecase.getValidPricesForCoverage(coverageId, date);
            res.status(200).json({
                ok: true,
                message: 'Valid prices retrieved successfully for coverage and date',
                data: prices,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.get("/prices/active/:status", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const isActive = req.params['status'] === 'true';
            const prices = await managePricesUsecase.getPricesByActiveStatus(isActive);
            res.status(200).json({
                ok: true,
                message: `${isActive ? 'Active' : 'Inactive'} prices retrieved successfully`,
                data: prices,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.use(HandlerError);

    return router;
}
