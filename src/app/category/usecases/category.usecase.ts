import { Category, CategoryEntity, CategorySchema } from '../entities/category';
import { CategoryRepository } from "../repositories/repository.interface.category";

import ExpressReviewsError from '../../../utils/error/types/expressReviewError';
import { ZodError } from 'zod';
import { ConstantsResponse } from '../../../enviroments_variables/constants';

export class ManageCategoriesUsecase {
    constructor(
        private categoryRepository: CategoryRepository
    ) {}

    async getCategories(): Promise<Category[]> {
        try {
            const categories = await this.categoryRepository.getCategories();
            return categories.map(category => CategoryEntity.create(category));
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get categories',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageCategoriesUsecase.getCategories',
                error
            );
        }
    }

    async getCategory(id: number): Promise<Category | null> {
        try {
            const category = await this.categoryRepository.getCategory(id);
            return category ? CategoryEntity.create(category) : null;
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get category',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageCategoriesUsecase.getCategory',
                error
            );
        }
    }

    async createCategory(data: Omit<Category, 'id' | 'vehicles'>): Promise<Category> {
        try {
            const validatedCategory = CategorySchema.omit({ id: true, vehicles: true }).parse(data);
            const id = await this.categoryRepository.createCategory(validatedCategory);
            return CategoryEntity.create({ ...validatedCategory, id, vehicles: [] });
        } catch (error) {
            if (error instanceof ZodError) {
                throw new ExpressReviewsError(
                    'Invalid category data',
                    ConstantsResponse.BAD_REQUEST,
                    'ValidationError',
                    'ManageCategoriesUsecase.createCategory',
                    error
                );
            }
            throw new ExpressReviewsError(
                'Failed to create category',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageCategoriesUsecase.createCategory',
                error
            );
        }
    }

    async updateCategory(id: number, data: Omit<Category, 'id' | 'vehicles'>): Promise<Category> {
        try {
            const existingCategory = await this.categoryRepository.getCategory(id);
            if (!existingCategory) {
                throw new ExpressReviewsError(
                    'Category not found',
                    ConstantsResponse.NOT_FOUND,
                    'NotFoundError',
                    'ManageCategoriesUsecase.updateCategory'
                );
            }
            const validatedCategory = CategorySchema.omit({ vehicles: true }).parse({ ...data, id });
            await this.categoryRepository.updateCategory(validatedCategory);
            return CategoryEntity.create({...validatedCategory, vehicles: existingCategory.vehicles});
        } catch (error) {
            if (error instanceof ExpressReviewsError) {
                throw error;
            }
            if (error instanceof ZodError) {
                throw new ExpressReviewsError(
                    'Invalid category data',
                    ConstantsResponse.BAD_REQUEST,
                    'ValidationError',
                    'ManageCategoriesUsecase.updateCategory',
                    error
                );
            }
            throw new ExpressReviewsError(
                'Failed to update category',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageCategoriesUsecase.updateCategory',
                error
            );
        }
    }

    async deleteCategory(id: number): Promise<void> {
        try {
            await this.categoryRepository.deleteCategory(id);
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to delete category',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageCategoriesUsecase.deleteCategory',
                error
            );
        }
    }

    async getCategoryWithVehicles(id: number): Promise<Category | null> {
        try {
            const category = await this.categoryRepository.getCategory(id);
            return category ? CategoryEntity.create(category) : null;
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get category with vehicles',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'ManageCategoriesUsecase.getCategoryWithVehicles',
                error
            );
        }
    }
}
