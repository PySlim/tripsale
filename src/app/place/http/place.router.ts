import express, { Router, Request, Response, NextFunction } from 'express';
import { ManagePlacesUsecase } from "../usecases/place.usecase";
import { HandlerError } from "../../../utils/error/handler/handlerError";
import { ValidateIdentityMiddleware } from "../../../resources/middlewares/validate.identity.middleware";
import { Place } from '../entities/place';

export function createPlacesRouter(managePlacesUsecase: ManagePlacesUsecase): Router {
    const router = express.Router();

    router.get("/places", ValidateIdentityMiddleware(), async (req: Request, res: Response, next: NextFunction) => {
        try {
            const places = await managePlacesUsecase.getPlaces();
            res.status(200).json({
                ok: true,
                message: 'Places retrieved successfully',
                data: places,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.get("/places/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            const place = await managePlacesUsecase.getPlace(id);
            if (place) {
                res.status(200).json({
                    ok: true,
                    message: 'Place retrieved successfully',
                    data: place,
                    pagination: {},
                    error: null
                });
            } else {
                res.status(404).json({
                    ok: false,
                    message: 'Place not found',
                    data: null,
                    pagination: {},
                    error: { message: 'Place not found' }
                });
            }
        } catch (error) {
            next(error);
        }
    });

    router.post("/places", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const place = await managePlacesUsecase.createPlace(req.body);
            res.status(201).json({
                ok: true,
                message: 'Place created successfully',
                data: place,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.put("/places/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            const place = await managePlacesUsecase.updatePlace(id, req.body);
            res.status(200).json({
                ok: true,
                message: 'Place updated successfully',
                data: place,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.delete("/places/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            await managePlacesUsecase.deletePlace(id);
            res.status(200).json({
                ok: true,
                message: `Place ${id} deleted successfully`,
                data: null,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.get("/places/type/:type", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const type = req.params['type'] as Place['type'];
            const places = await managePlacesUsecase.getPlacesByType(type);
            res.status(200).json({
                ok: true,
                message: `Places of type ${type} retrieved successfully`,
                data: places,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.get("/places/active/:status", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const isActive = req.params['status'] === 'true';
            const places = await managePlacesUsecase.getPlacesByActiveStatus(isActive);
            res.status(200).json({
                ok: true,
                message: `${isActive ? 'Active' : 'Inactive'} places retrieved successfully`,
                data: places,
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
