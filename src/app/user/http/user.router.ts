import express, { Router, Request, Response, NextFunction } from 'express';
import { ManageUsersUsecase } from "../usecases/user.usecase";
import { HandlerError } from "../../../utils/error/handler/handlerError";
import { ValidateIdentityMiddleware } from "../../../resources/middlewares/validate.identity.middleware";

export function createUsersRouter(manageUsersUsecase: ManageUsersUsecase): Router {
    const router = express.Router();

    router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    ok: false,
                    message: 'Email and password are required',
                    data: null,
                    pagination: {},
                    error: { message: 'Invalid input data' }
                });
            }

            const userWithToken = await manageUsersUsecase.loginUser(email, password);

            return res.status(200).json({
                ok: true,
                message: 'Login successful',
                data: userWithToken,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
            return;
        }
    });

    router.get("/users", ValidateIdentityMiddleware(), async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await manageUsersUsecase.getUsers();
            return res.status(200).json({
                ok: true,
                message: 'Users retrieved successfully',
                data: users,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
            return;
        }
    });

    router.get("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            const user = await manageUsersUsecase.getUser(id);
            if (user) {
                return res.status(200).json({
                    ok: true,
                    message: 'User retrieved successfully',
                    data: user,
                    pagination: {},
                    error: null
                });
            } else {
                return res.status(404).json({
                    ok: false,
                    message: 'User not found',
                    data: null,
                    pagination: {},
                    error: { message: 'User not found' }
                });
            }
        } catch (error) {
            next(error);
            return;
        }
    });

    router.post("/users", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await manageUsersUsecase.createUser(req.body);
            return res.status(201).json({
                ok: true,
                message: 'User created successfully',
                data: user,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
            return;
        }
    });

    router.put("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            const user = await manageUsersUsecase.updateUser(id, req.body);
            return res.status(200).json({
                ok: true,
                message: 'User updated successfully',
                data: user,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
            return;
        }
    });

    router.delete("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            await manageUsersUsecase.deleteUser(id);
            return res.status(200).json({
                ok: true,
                message: `User ${id} deleted successfully`,
                data: null,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
            return;
        }
    });

    router.use(HandlerError);

    return router;
}

