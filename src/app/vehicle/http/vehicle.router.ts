// src/app/vehicle/http/vehicle.router.ts
import express, { Router, Request, Response, NextFunction } from 'express';
import { ManageVehiclesUsecase } from "../usecases/vehicle.usecase";
import { HandlerError } from "../../../utils/error/handler/handlerError";
import { ValidateIdentityMiddleware } from "../../../resources/middlewares/validate.identity.middleware";

export function createVehiclesRouter(manageVehiclesUsecase: ManageVehiclesUsecase): Router {
    const router = express.Router();

    router.get("/vehicles", ValidateIdentityMiddleware(), async (req: Request, res: Response, next: NextFunction) => {
        try {
            const vehicles = await manageVehiclesUsecase.getVehicles();
            res.status(200).json({
                ok: true,
                message: 'Vehicles retrieved successfully',
                data: vehicles,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.get("/vehicles/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            const vehicle = await manageVehiclesUsecase.getVehicle(id);
            if (vehicle) {
                res.status(200).json({
                    ok: true,
                    message: 'Vehicle retrieved successfully',
                    data: vehicle,
                    pagination: {},
                    error: null
                });
            } else {
                res.status(404).json({
                    ok: false,
                    message: 'Vehicle not found',
                    data: null,
                    pagination: {},
                    error: { message: 'Vehicle not found' }
                });
            }
        } catch (error) {
            next(error);
        }
    });

    router.post("/vehicles", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const vehicle = await manageVehiclesUsecase.createVehicle(req.body);
            res.status(201).json({
                ok: true,
                message: 'Vehicle created successfully',
                data: vehicle,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.put("/vehicles/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            const vehicle = await manageVehiclesUsecase.updateVehicle(id, req.body);
            res.status(200).json({
                ok: true,
                message: 'Vehicle updated successfully',
                data: vehicle,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.delete("/vehicles/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            await manageVehiclesUsecase.deleteVehicle(id);
            res.status(200).json({
                ok: true,
                message: `Vehicle ${id} deleted successfully`,
                data: null,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.get("/vehicles/provider/:providerId", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const providerId = parseInt(req.params['providerId'], 10);
            const vehicles = await manageVehiclesUsecase.getVehiclesByProvider(providerId);
            res.status(200).json({
                ok: true,
                message: 'Vehicles retrieved successfully by provider',
                data: vehicles,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.get("/vehicles/category/:categoryId", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const categoryId = parseInt(req.params['categoryId'], 10);
            const vehicles = await manageVehiclesUsecase.getVehiclesByCategory(categoryId);
            res.status(200).json({
                ok: true,
                message: 'Vehicles retrieved successfully by category',
                data: vehicles,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.get("/vehicles/active/:status", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const isActive = req.params['status'] === 'true';
            const vehicles = await manageVehiclesUsecase.getVehiclesByActiveStatus(isActive);
            res.status(200).json({
                ok: true,
                message: `${isActive ? 'Active' : 'Inactive'} vehicles retrieved successfully`,
                data: vehicles,
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
