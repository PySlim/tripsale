// src/app/user/http/user.router.ts
import express, { Router, Request, Response, NextFunction } from 'express';
import { ManageUsersUsecase } from "../usecases/user.usecase";
import {HandlerError} from "../../../utils/error/handler/handlerError";
import {ValidateIdentityMiddleware} from "../../../resources/middlewares/validate.identity.middleware";


export function createUsersRouter(manageUsersUsecase: ManageUsersUsecase): Router {
    const router = express.Router();

    router.get("/users",ValidateIdentityMiddleware(), async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await manageUsersUsecase.getUsers();
            res.status(200).json({
                ok: true,
                message: 'Users retrieved successfully',
                data: users,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.get("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            const user = await manageUsersUsecase.getUser(id);
            if (user) {
                res.status(200).json({
                    ok: true,
                    message: 'User retrieved successfully',
                    data: user,
                    pagination: {},
                    error: null
                });
            } else {
                res.status(404).json({
                    ok: false,
                    message: 'User not found',
                    data: null,
                    pagination: {},
                    error: { message: 'User not found' }
                });
            }
        } catch (error) {
            next(error);
        }
    });

    router.post("/users", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await manageUsersUsecase.createUser(req.body);
            res.status(201).json({
                ok: true,
                message: 'User created successfully',
                data: user,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.put("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            const user = await manageUsersUsecase.updateUser(id, req.body);
            res.status(200).json({
                ok: true,
                message: 'User updated successfully',
                data: user,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.delete("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            await manageUsersUsecase.deleteUser(id);
            res.status(200).json({
                ok: true,
                message: `User ${id} deleted successfully`,
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
