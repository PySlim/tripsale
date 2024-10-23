import express, { Router, Request, Response, NextFunction } from 'express';
import { HandlerError } from "../../../utils/error/handler/handlerError";
import { ValidateIdentityMiddleware } from "../../../resources/middlewares/validate.identity.middleware";
import { QuotationStatus } from '../entities/quotation';
import { ManageQuotationsUsecase } from "../usercases/quotation.usecase";

export function createQuotationsRouter(manageQuotationsUsecase: ManageQuotationsUsecase): Router {
    const router = express.Router();

    router.get("/quotations", ValidateIdentityMiddleware(), async (req: Request, res: Response, next: NextFunction) => {
        try {
            const quotations = await manageQuotationsUsecase.getQuotations();
            return res.status(200).json({
                ok: true,
                message: 'Quotations retrieved successfully',
                data: quotations,
                pagination: {},
                error: null
            });
        } catch (error) {
            return next(error);
        }
    });

    router.get("/quotations/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            const quotation = await manageQuotationsUsecase.getQuotation(id);
            if (quotation) {
                return res.status(200).json({
                    ok: true,
                    message: 'Quotation retrieved successfully',
                    data: quotation,
                    pagination: {},
                    error: null
                });
            }
            return res.status(404).json({
                ok: false,
                message: 'Quotation not found',
                data: null,
                pagination: {},
                error: { message: 'Quotation not found' }
            });
        } catch (error) {
            return next(error);
        }
    });

    router.post("/quotations", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const quotation = await manageQuotationsUsecase.createQuotation(req.body);
            return res.status(201).json({
                ok: true,
                message: 'Quotation created successfully',
                data: quotation,
                pagination: {},
                error: null
            });
        } catch (error) {
            return next(error);
        }
    });

    router.patch("/quotations/:id/status", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            const { status, coverageId, priceId } = req.body;

            if (!Object.values(QuotationStatus).includes(status)) {
                return res.status(400).json({
                    ok: false,
                    message: 'Invalid status',
                    data: null,
                    pagination: {},
                    error: { message: 'Invalid status provided' }
                });
            }

            const quotation = await manageQuotationsUsecase.updateQuotationStatus(
                id,
                status,
                coverageId,
                priceId
            );

            return res.status(200).json({
                ok: true,
                message: 'Quotation status updated successfully',
                data: quotation,
                pagination: {},
                error: null
            });
        } catch (error) {
            return next(error);
        }
    });

    router.get("/quotations/user/:userId", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = parseInt(req.params['userId'], 10);
            const quotations = await manageQuotationsUsecase.getQuotationsByUser(userId);
            return res.status(200).json({
                ok: true,
                message: 'Quotations retrieved successfully by user',
                data: quotations,
                pagination: {},
                error: null
            });
        } catch (error) {
            return next(error);
        }
    });

    router.get("/quotations/provider/:providerId", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const providerId = parseInt(req.params['providerId'], 10);
            const quotations = await manageQuotationsUsecase.getQuotationsByProvider(providerId);
            return res.status(200).json({
                ok: true,
                message: 'Quotations retrieved successfully by provider',
                data: quotations,
                pagination: {},
                error: null
            });
        } catch (error) {
            return next(error);
        }
    });

    router.get("/quotations/date-range", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const startDate = new Date(req.query['startDate'] as string);
            const endDate = new Date(req.query['endDate'] as string);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({
                    ok: false,
                    message: 'Invalid date format',
                    data: null,
                    pagination: {},
                    error: { message: 'Invalid date format provided' }
                });
            }

            const quotations = await manageQuotationsUsecase.getQuotationsByDateRange(startDate, endDate);
            return res.status(200).json({
                ok: true,
                message: 'Quotations retrieved successfully by date range',
                data: quotations,
                pagination: {},
                error: null
            });
        } catch (error) {
            return next(error);
        }
    });

    router.delete("/quotations/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            await manageQuotationsUsecase.deleteQuotation(id);
            return res.status(200).json({
                ok: true,
                message: `Quotation ${id} deleted successfully`,
                data: null,
                pagination: {},
                error: null
            });
        } catch (error) {
            return next(error);
        }
    });

    router.use(HandlerError);

    return router;
}
