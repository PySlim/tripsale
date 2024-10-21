import { Model, DataTypes } from 'sequelize';
import { Category } from "../entities/category";
import { CategoryRepository } from "./repository.interface.category";
import SequelizeClient from "../../../frameworks/database/sequelize";
import ExpressReviewsError from "../../../utils/error/types/expressReviewError";
import { ConstantsResponse } from "../../../enviroments_variables/constants";

interface CategoryAttributes extends Category {}

function isCategoryAttributes(obj: any): obj is CategoryAttributes {
    return typeof obj.id === 'number' &&
        typeof obj.name === 'string' &&
        (obj.description === undefined || typeof obj.description === 'string') &&
        (obj.comfortLevel === undefined || typeof obj.comfortLevel === 'number') &&
        typeof obj.isActive === 'boolean';
}

export class SequelizeCategoryRepository implements CategoryRepository {
    private categoryModel: ReturnType<typeof SequelizeClient.prototype.sequelize.define>;

    constructor(private sequelizeClient: SequelizeClient, test = false) {
        let tableName = "Categories";
        if (test) {
            tableName += "_test";
        }

        this.categoryModel = this.sequelizeClient.sequelize.define<Model<CategoryAttributes>>('Category', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            comfortLevel: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        }, {
            tableName: tableName,
            timestamps: false,
        });
        this.syncModel();
    }

    private async syncModel() {
        try {
            await this.categoryModel.sync({ alter: true });
            console.log(`Category model synchronized successfully.`);
        } catch (error) {
            console.error(`Error synchronizing Category model:`, error);
        }
    }

    async getCategories(): Promise<Category[]> {
        try {
            const categories = await this.categoryModel.findAll({ raw: true });
            return categories.map(category => {
                if (isCategoryAttributes(category)) {
                    return category;
                }
                throw new ExpressReviewsError('Invalid category data returned from database', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeCategoryRepository.getCategories');
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to get categories', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeCategoryRepository.getCategories', error);
        }
    }

    async getCategory(id: number): Promise<Category | null> {
        try {
            const category = await this.categoryModel.findByPk(id, { raw: true });
            if (category && isCategoryAttributes(category)) {
                return category;
            }
            return null;
        } catch (error) {
            throw new ExpressReviewsError('Failed to get category', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeCategoryRepository.getCategory', error);
        }
    }

    async createCategory(category: Omit<Category, 'id'>): Promise<number> {
        try {
            const createdCategory = await this.categoryModel.create(category);
            return createdCategory.get('id') as number;
        } catch (error) {
            throw new ExpressReviewsError('Failed to create category', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeCategoryRepository.createCategory', error);
        }
    }

    async updateCategory(category: Category): Promise<void> {
        try {
            await this.categoryModel.update(category, {
                where: { id: category.id }
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to update category', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeCategoryRepository.updateCategory', error);
        }
    }

    async deleteCategory(id: number): Promise<void> {
        try {
            await this.categoryModel.destroy({
                where: { id }
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to delete category', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeCategoryRepository.deleteCategory', error);
        }
    }

    async deleteAllCategories(): Promise<void> {
        try {
            if (this.categoryModel.sequelize?.getDialect() === 'sqlite') {
                await this.categoryModel.destroy({ truncate: true, cascade: false });
            } else {
                await this.categoryModel.destroy({ truncate: true });
            }
        } catch (error) {
            throw new ExpressReviewsError('Failed to delete all categories', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeCategoryRepository.deleteAllCategories', error);
        }
    }

    async dropCategoriesTable(): Promise<void> {
        try {
            await this.categoryModel.drop();
        } catch (error) {
            throw new ExpressReviewsError('Failed to drop categories table', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeCategoryRepository.dropCategoriesTable', error);
        }
    }
}
