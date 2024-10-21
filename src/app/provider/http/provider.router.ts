// src/app/provider/http/provider.router.ts
import express, { Router, Request, Response, NextFunction } from 'express';
import { ManageProvidersUsecase } from "../usecases/provider.usecase";
import { HandlerError } from "../../../utils/error/handler/handlerError";
import { ValidateIdentityMiddleware } from "../../../resources/middlewares/validate.identity.middleware";

export function createProvidersRouter(manageProvidersUsecase: ManageProvidersUsecase): Router {
    const router = express.Router();

    router.get("/providers", ValidateIdentityMiddleware(), async (req: Request, res: Response, next: NextFunction) => {
        try {
            const providers = await manageProvidersUsecase.getProviders();
            res.status(200).json({
                ok: true,
                message: 'Providers retrieved successfully',
                data: providers,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.get("/providers/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            const provider = await manageProvidersUsecase.getProvider(id);
            if (provider) {
                res.status(200).json({
                    ok: true,
                    message: 'Provider retrieved successfully',
                    data: provider,
                    pagination: {},
                    error: null
                });
            } else {
                res.status(404).json({
                    ok: false,
                    message: 'Provider not found',
                    data: null,
                    pagination: {},
                    error: { message: 'Provider not found' }
                });
            }
        } catch (error) {
            next(error);
        }
    });

    router.post("/providers", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const provider = await manageProvidersUsecase.createProvider(req.body);
            res.status(201).json({
                ok: true,
                message: 'Provider created successfully',
                data: provider,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.put("/providers/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            const provider = await manageProvidersUsecase.updateProvider(id, req.body);
            res.status(200).json({
                ok: true,
                message: 'Provider updated successfully',
                data: provider,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.delete("/providers/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            await manageProvidersUsecase.deleteProvider(id);
            res.status(200).json({
                ok: true,
                message: `Provider ${id} deleted successfully`,
                data: null,
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
