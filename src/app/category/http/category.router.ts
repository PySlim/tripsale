import express, { Router, Request, Response, NextFunction } from 'express';
import { ManageCategoriesUsecase } from "../usecases/category.usecase";
import { HandlerError } from "../../../utils/error/handler/handlerError";
import { ValidateIdentityMiddleware } from "../../../resources/middlewares/validate.identity.middleware";

export function createCategoriesRouter(manageCategoriesUsecase: ManageCategoriesUsecase): Router {
    const router = express.Router();

    router.get("/categories", ValidateIdentityMiddleware(), async (req: Request, res: Response, next: NextFunction) => {
        try {
            const categories = await manageCategoriesUsecase.getCategories();
            res.status(200).json({
                ok: true,
                message: 'Categories retrieved successfully',
                data: categories,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.get("/categories/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            const category = await manageCategoriesUsecase.getCategory(id);
            if (category) {
                res.status(200).json({
                    ok: true,
                    message: 'Category retrieved successfully',
                    data: category,
                    pagination: {},
                    error: null
                });
            } else {
                res.status(404).json({
                    ok: false,
                    message: 'Category not found',
                    data: null,
                    pagination: {},
                    error: { message: 'Category not found' }
                });
            }
        } catch (error) {
            next(error);
        }
    });

    router.post("/categories", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const category = await manageCategoriesUsecase.createCategory(req.body);
            res.status(201).json({
                ok: true,
                message: 'Category created successfully',
                data: category,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.put("/categories/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            const category = await manageCategoriesUsecase.updateCategory(id, req.body);
            res.status(200).json({
                ok: true,
                message: 'Category updated successfully',
                data: category,
                pagination: {},
                error: null
            });
        } catch (error) {
            next(error);
        }
    });

    router.delete("/categories/:id", async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params['id'], 10);
            await manageCategoriesUsecase.deleteCategory(id);
            res.status(200).json({
                ok: true,
                message: `Category ${id} deleted successfully`,
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
