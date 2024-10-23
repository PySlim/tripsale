import { Model, DataTypes, Op } from 'sequelize';
import { Price } from "../entities/price";
import { PriceRepository } from "./repository.interface.price";
import SequelizeClient from "../../../frameworks/database/sequelize";
import ExpressReviewsError from "../../../utils/error/types/expressReviewError";
import { ConstantsResponse } from "../../../constants/constants";

interface PriceAttributes extends Price {}

function isPriceAttributes(obj: any): obj is PriceAttributes {
    return typeof obj.id === 'number' &&
        typeof obj.amount === 'number' &&
        typeof obj.currency === 'string' &&
        obj.validFrom instanceof Date &&
        obj.validTo instanceof Date &&
        typeof obj.isActive === 'boolean' &&
        typeof obj.coverageId === 'number';
}

export class SequelizePriceRepository implements PriceRepository {
    public priceModel: ReturnType<typeof SequelizeClient.prototype.sequelize.define>;

    constructor(private sequelizeClient: SequelizeClient, test = false) {
        let tableName = "Prices";
        if (test) {
            tableName += "_test";
        }

        this.priceModel = this.sequelizeClient.sequelize.define<Model<PriceAttributes>>('Price', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            currency: {
                type: DataTypes.STRING(3),
                allowNull: false,
            },
            validFrom: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            validTo: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            coverageId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Coverages',
                    key: 'id',
                },
            },
        }, {
            tableName: tableName,
            timestamps: false,
        });

        // Definir la relación con Coverage
        this.priceModel.belongsTo(this.sequelizeClient.sequelize.models['Coverage'], {
            foreignKey: 'coverageId',
            as: 'coverage'
        });

        this.syncModel();
    }

    private async syncModel() {
        try {
            await this.priceModel.sync({ alter: false });
            console.log(`Price model synchronized successfully.`);
        } catch (error) {
            console.error(`Error synchronizing Price model:`, error);
        }
    }

    async getPrices(): Promise<Price[]> {
        try {
            const prices = await this.priceModel.findAll({
                include: [{ model: this.sequelizeClient.sequelize.models['Coverage'], as: 'coverage' }],
                raw: true,
                nest: true
            });
            return prices.map(price => {
                if (isPriceAttributes(price)) {
                    return price;
                }
                throw new ExpressReviewsError('Invalid price data returned from database', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePriceRepository.getPrices');
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to get prices', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePriceRepository.getPrices', error);
        }
    }

    async getPrice(id: number): Promise<Price | null> {
        try {
            const price = await this.priceModel.findByPk(id, {
                include: [{ model: this.sequelizeClient.sequelize.models['Coverage'], as: 'coverage' }],
                raw: true,
                nest: true
            });
            if (price && isPriceAttributes(price)) {
                return price;
            }
            return null;
        } catch (error) {
            throw new ExpressReviewsError('Failed to get price', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePriceRepository.getPrice', error);
        }
    }

    async createPrice(price: Omit<Price, 'id'>): Promise<number> {
        try {
            const createdPrice = await this.priceModel.create(price);
            return createdPrice.get('id') as number;
        } catch (error) {
            throw new ExpressReviewsError('Failed to create price', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePriceRepository.createPrice', error);
        }
    }

    async updatePrice(price: Price): Promise<void> {
        try {
            await this.priceModel.update(price, {
                where: { id: price.id }
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to update price', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePriceRepository.updatePrice', error);
        }
    }

    async deletePrice(id: number): Promise<void> {
        try {
            await this.priceModel.destroy({
                where: { id }
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to delete price', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePriceRepository.deletePrice', error);
        }
    }

    async getPricesByCoverage(coverageId: number): Promise<Price[]> {
        try {
            const prices = await this.priceModel.findAll({
                where: { coverageId },
                raw: true,
                nest: true
            });
            return prices.map(price => {
                if (isPriceAttributes(price)) {
                    return price;
                }
                throw new ExpressReviewsError('Invalid price data returned from database', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePriceRepository.getPricesByCoverage');
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to get prices by coverage', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePriceRepository.getPricesByCoverage', error);
        }
    }

    async getPricesByValidDate(date: Date): Promise<Price[]> {
        try {
            const prices = await this.priceModel.findAll({
                where: {
                    validFrom: { [Op.lte]: date },
                    validTo: { [Op.gte]: date },
                },
                raw: true,
                nest: true
            });
            return prices.map(price => {
                if (isPriceAttributes(price)) {
                    return price;
                }
                throw new ExpressReviewsError('Invalid price data returned from database', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePriceRepository.getPricesByValidDate');
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to get prices by valid date', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePriceRepository.getPricesByValidDate', error);
        }
    }

    async getPricesByActiveStatus(isActive: boolean): Promise<Price[]> {
        try {
            const prices = await this.priceModel.findAll({
                where: { isActive },
                raw: true,
                nest: true
            });
            return prices.map(price => {
                if (isPriceAttributes(price)) {
                    return price;
                }
                throw new ExpressReviewsError('Invalid price data returned from database', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePriceRepository.getPricesByActiveStatus');
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to get prices by active status', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePriceRepository.getPricesByActiveStatus', error);
        }
    }

    async getValidPricesForCoverage(coverageId: number, date: Date): Promise<Price[]> {
        try {
            const prices = await this.priceModel.findAll({
                where: {
                    coverageId,
                    validFrom: { [Op.lte]: date },
                    validTo: { [Op.gte]: date },
                    isActive: true
                },
                raw: true,
                nest: true
            });
            return prices.map(price => {
                if (isPriceAttributes(price)) {
                    return price;
                }
                throw new ExpressReviewsError('Invalid price data returned from database', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePriceRepository.getValidPricesForCoverage');
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to get valid prices for coverage', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePriceRepository.getValidPricesForCoverage', error);
        }
    }

    async deleteAllPrices(): Promise<void> {
        try {
            if (this.priceModel.sequelize?.getDialect() === 'sqlite') {
                await this.priceModel.destroy({ truncate: true, cascade: false });
            } else {
                await this.priceModel.destroy({ truncate: true });
            }
        } catch (error) {
            throw new ExpressReviewsError('Failed to delete all prices', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePriceRepository.deleteAllPrices', error);
        }
    }

    async dropPricesTable(): Promise<void> {
        try {
            await this.priceModel.drop();
        } catch (error) {
            throw new ExpressReviewsError('Failed to drop prices table', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePriceRepository.dropPricesTable', error);
        }
    }
}
