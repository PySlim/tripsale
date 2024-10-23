import { Model, DataTypes, Op } from 'sequelize';
import { Quotation, QuotationStatus } from "../entities/quotation";
import { QuotationRepository } from "./repository.interface.quotation";
import SequelizeClient from "../../../frameworks/database/sequelize";
import ExpressReviewsError from "../../../utils/error/types/expressReviewError";
import { ConstantsResponse } from "../../../constants/constants";

interface QuotationAttributes extends Quotation {}

function isQuotationAttributes(obj: any): obj is QuotationAttributes {
    return typeof obj.id === 'number' &&
        Object.values(QuotationStatus).includes(obj.status) &&
        obj.travelDate instanceof Date &&
        typeof obj.passengerCount === 'number' &&
        typeof obj.isActive === 'boolean' &&
        obj.createdAt instanceof Date &&
        obj.updatedAt instanceof Date &&
        typeof obj.userId === 'number' &&
        typeof obj.originPlaceId === 'number' &&
        typeof obj.destinationPlaceId === 'number' &&
        (obj.categoryId === undefined || typeof obj.categoryId === 'number') &&
        (obj.coverageId === undefined || typeof obj.coverageId === 'number') &&
        (obj.priceId === undefined || typeof obj.priceId === 'number');
}

function toQuotation(model: any): Quotation {
    if (!isQuotationAttributes(model)) {
        throw new ExpressReviewsError(
            'Invalid quotation data',
            ConstantsResponse.INTERNAL_SERVER_ERROR,
            'ValidationError',
            'toQuotation'
        );
    }
    return {
        id: model.id,
        status: model.status,
        travelDate: model.travelDate,
        passengerCount: model.passengerCount,
        isActive: model.isActive,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
        userId: model.userId,
        originPlaceId: model.originPlaceId,
        destinationPlaceId: model.destinationPlaceId,
        categoryId: model.categoryId,
        coverageId: model.coverageId,
        priceId: model.priceId
    };
}
export class SequelizeQuotationRepository implements QuotationRepository {
    public quotationModel: ReturnType<typeof SequelizeClient.prototype.sequelize.define>;

    constructor(private sequelizeClient: SequelizeClient, test = false) {
        let tableName = "Quotations";
        if (test) {
            tableName += "_test";
        }

        this.quotationModel = this.sequelizeClient.sequelize.define<Model<QuotationAttributes>>('Quotation', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            status: {
                type: DataTypes.ENUM(...Object.values(QuotationStatus)),
                allowNull: false,
                defaultValue: QuotationStatus.CREATED,
            },
            travelDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            passengerCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
            },
            originPlaceId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Places',
                    key: 'id',
                },
            },
            destinationPlaceId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Places',
                    key: 'id',
                },
            },
            categoryId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'Categories',
                    key: 'id',
                },
            },
            coverageId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'Coverages',
                    key: 'id',
                },
            },
            priceId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'Prices',
                    key: 'id',
                },
            },
        }, {
            tableName: tableName,
            timestamps: true,
        });

        // Definir relaciones
        this.quotationModel.belongsTo(this.sequelizeClient.sequelize.models['User'], {
            foreignKey: 'userId',
            as: 'user'
        });

        this.quotationModel.belongsTo(this.sequelizeClient.sequelize.models['Place'], {
            foreignKey: 'originPlaceId',
            as: 'originPlace'
        });

        this.quotationModel.belongsTo(this.sequelizeClient.sequelize.models['Place'], {
            foreignKey: 'destinationPlaceId',
            as: 'destinationPlace'
        });

        this.quotationModel.belongsTo(this.sequelizeClient.sequelize.models['Category'], {
            foreignKey: 'categoryId',
            as: 'category'
        });

        this.quotationModel.belongsTo(this.sequelizeClient.sequelize.models['Coverage'], {
            foreignKey: 'coverageId',
            as: 'coverage'
        });

        this.quotationModel.belongsTo(this.sequelizeClient.sequelize.models['Price'], {
            foreignKey: 'priceId',
            as: 'price'
        });

        this.syncModel();
    }

    public async syncModel() {
        try {
            await this.quotationModel.sync({ alter: false });
            console.log(`Quotation model synchronized successfully.`);
        } catch (error) {
            console.error(`Error synchronizing Quotation model:`, error);
        }
    }

    async getQuotations(): Promise<Quotation[]> {
        try {
            const quotations = await this.quotationModel.findAll({
                include: [
                    { model: this.sequelizeClient.sequelize.models['User'], as: 'user' },
                    { model: this.sequelizeClient.sequelize.models['Place'], as: 'originPlace' },
                    { model: this.sequelizeClient.sequelize.models['Place'], as: 'destinationPlace' },
                    { model: this.sequelizeClient.sequelize.models['Category'], as: 'category' },
                    { model: this.sequelizeClient.sequelize.models['Coverage'], as: 'coverage' },
                    { model: this.sequelizeClient.sequelize.models['Price'], as: 'price' }
                ],
                raw: true,
                nest: true
            });
            return quotations.map(toQuotation);
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get quotations',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'SequelizeQuotationRepository.getQuotations',
                error
            );
        }
    }

    // ... (otros métodos usando el mismo patrón)

    async checkAvailableCapacity(coverageId: number, travelDate: Date, passengerCount: number): Promise<boolean> {
        try {
            const coverage = await this.sequelizeClient.sequelize.models['Coverage'].findOne({
                where: { id: coverageId },
                include: [{
                    model: this.sequelizeClient.sequelize.models['Vehicle'],
                    as: 'vehicle'
                }],
                raw: true,
                nest: true
            }) as any; // Usamos any aquí para evitar problemas de tipo

            if (!coverage || !coverage.vehicle || !coverage.vehicle.capacity) return false;

            const vehicleCapacity = coverage.vehicle.capacity;
            const existingPassengers = await this.getExistingReservations(coverageId, travelDate);

            return (existingPassengers + passengerCount) <= vehicleCapacity;
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to check available capacity',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'SequelizeQuotationRepository.checkAvailableCapacity',
                error
            );
        }
    }

    async getExistingReservations(coverageId: number, travelDate: Date): Promise<number> {
        try {
            const quotations = await this.quotationModel.findAll({
                where: {
                    coverageId,
                    travelDate,
                    status: QuotationStatus.RESERVED
                },
                attributes: ['passengerCount'],
                raw: true
            });

            return quotations.reduce((sum: number, quotation: any) => sum + (quotation.passengerCount || 0), 0);
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get existing reservations',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'SequelizeQuotationRepository.getExistingReservations',
                error
            );
        }
    }

    async getQuotation(id: number): Promise<Quotation | null> {
        try {
            const quotation = await this.quotationModel.findByPk(id, {
                include: [
                    { model: this.sequelizeClient.sequelize.models['User'], as: 'user' },
                    { model: this.sequelizeClient.sequelize.models['Place'], as: 'originPlace' },
                    { model: this.sequelizeClient.sequelize.models['Place'], as: 'destinationPlace' },
                    { model: this.sequelizeClient.sequelize.models['Category'], as: 'category' },
                    { model: this.sequelizeClient.sequelize.models['Coverage'], as: 'coverage' },
                    { model: this.sequelizeClient.sequelize.models['Price'], as: 'price' }
                ],
                raw: true,
                nest: true
            });
            return quotation ? toQuotation(quotation) : null;
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get quotation',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'SequelizeQuotationRepository.getQuotation',
                error
            );
        }
    }

    async createQuotation(quotation: Omit<Quotation, 'id'>): Promise<number> {
        try {
            const createdQuotation = await this.quotationModel.create(quotation as any);
            return createdQuotation.getDataValue('id');
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to create quotation',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'SequelizeQuotationRepository.createQuotation',
                error
            );
        }
    }

    async updateQuotation(quotation: Quotation): Promise<void> {
        try {
            await this.quotationModel.update(quotation, {
                where: { id: quotation.id }
            });
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to update quotation',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'SequelizeQuotationRepository.updateQuotation',
                error
            );
        }
    }

    async deleteQuotation(id: number): Promise<void> {
        try {
            await this.quotationModel.destroy({
                where: { id }
            });
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to delete quotation',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'SequelizeQuotationRepository.deleteQuotation',
                error
            );
        }
    }

    async getQuotationsByUser(userId: number): Promise<Quotation[]> {
        try {
            const quotations = await this.quotationModel.findAll({
                where: { userId },
                include: [
                    { model: this.sequelizeClient.sequelize.models['Place'], as: 'originPlace' },
                    { model: this.sequelizeClient.sequelize.models['Place'], as: 'destinationPlace' },
                    { model: this.sequelizeClient.sequelize.models['Coverage'], as: 'coverage' },
                    { model: this.sequelizeClient.sequelize.models['Price'], as: 'price' }
                ],
                raw: true,
                nest: true
            });
            return quotations.map(toQuotation);
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get quotations by user',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'SequelizeQuotationRepository.getQuotationsByUser',
                error
            );
        }
    }

    async getQuotationsByProvider(providerId: number): Promise<Quotation[]> {
        try {
            const quotations = await this.quotationModel.findAll({
                include: [
                    {
                        model: this.sequelizeClient.sequelize.models['Coverage'],
                        as: 'coverage',
                        where: { providerId }
                    },
                    { model: this.sequelizeClient.sequelize.models['User'], as: 'user' },
                    { model: this.sequelizeClient.sequelize.models['Place'], as: 'originPlace' },
                    { model: this.sequelizeClient.sequelize.models['Place'], as: 'destinationPlace' },
                    { model: this.sequelizeClient.sequelize.models['Price'], as: 'price' }
                ],
                raw: true,
                nest: true
            });
            return quotations.map(toQuotation);
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get quotations by provider',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'SequelizeQuotationRepository.getQuotationsByProvider',
                error
            );
        }
    }

    async getQuotationsByRoute(originPlaceId: number, destinationPlaceId: number): Promise<Quotation[]> {
        try {
            const quotations = await this.quotationModel.findAll({
                where: {
                    originPlaceId,
                    destinationPlaceId
                },
                include: [
                    { model: this.sequelizeClient.sequelize.models['User'], as: 'user' },
                    { model: this.sequelizeClient.sequelize.models['Coverage'], as: 'coverage' },
                    { model: this.sequelizeClient.sequelize.models['Price'], as: 'price' }
                ],
                raw: true,
                nest: true
            });
            return quotations.map(toQuotation);
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get quotations by route',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'SequelizeQuotationRepository.getQuotationsByRoute',
                error
            );
        }
    }

    async getQuotationsByDateRange(startDate: Date, endDate: Date): Promise<Quotation[]> {
        try {
            const quotations = await this.quotationModel.findAll({
                where: {
                    travelDate: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                include: [
                    { model: this.sequelizeClient.sequelize.models['User'], as: 'user' },
                    { model: this.sequelizeClient.sequelize.models['Place'], as: 'originPlace' },
                    { model: this.sequelizeClient.sequelize.models['Place'], as: 'destinationPlace' },
                    { model: this.sequelizeClient.sequelize.models['Coverage'], as: 'coverage' },
                    { model: this.sequelizeClient.sequelize.models['Price'], as: 'price' }
                ],
                raw: true,
                nest: true
            });
            return quotations.map(toQuotation);
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get quotations by date range',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'SequelizeQuotationRepository.getQuotationsByDateRange',
                error
            );
        }
    }

    async getActiveQuotations(): Promise<Quotation[]> {
        try {
            const quotations = await this.quotationModel.findAll({
                where: {
                    isActive: true,
                    status: {
                        [Op.ne]: QuotationStatus.CANCELLED
                    }
                },
                include: [
                    { model: this.sequelizeClient.sequelize.models['User'], as: 'user' },
                    { model: this.sequelizeClient.sequelize.models['Place'], as: 'originPlace' },
                    { model: this.sequelizeClient.sequelize.models['Place'], as: 'destinationPlace' },
                    { model: this.sequelizeClient.sequelize.models['Coverage'], as: 'coverage' },
                    { model: this.sequelizeClient.sequelize.models['Price'], as: 'price' }
                ],
                raw: true,
                nest: true
            });
            return quotations.map(toQuotation);
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get active quotations',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'SequelizeQuotationRepository.getActiveQuotations',
                error
            );
        }
    }

    async getQuotationsByStatus(status: QuotationStatus): Promise<Quotation[]> {
        try {
            const quotations = await this.quotationModel.findAll({
                where: { status },
                include: [
                    { model: this.sequelizeClient.sequelize.models['User'], as: 'user' },
                    { model: this.sequelizeClient.sequelize.models['Place'], as: 'originPlace' },
                    { model: this.sequelizeClient.sequelize.models['Place'], as: 'destinationPlace' },
                    { model: this.sequelizeClient.sequelize.models['Coverage'], as: 'coverage' },
                    { model: this.sequelizeClient.sequelize.models['Price'], as: 'price' }
                ],
                raw: true,
                nest: true
            });
            return quotations.map(toQuotation);
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to get quotations by status',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'SequelizeQuotationRepository.getQuotationsByStatus',
                error
            );
        }
    }

    async deleteAllQuotations(): Promise<void> {
        try {
            if (this.quotationModel.sequelize?.getDialect() === 'sqlite') {
                await this.quotationModel.destroy({ truncate: true, cascade: false });
            } else {
                await this.quotationModel.destroy({ truncate: true });
            }
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to delete all quotations',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'SequelizeQuotationRepository.deleteAllQuotations',
                error
            );
        }
    }

    async dropQuotationsTable(): Promise<void> {
        try {
            await this.quotationModel.drop();
        } catch (error) {
            throw new ExpressReviewsError(
                'Failed to drop quotations table',
                ConstantsResponse.INTERNAL_SERVER_ERROR,
                'DatabaseError',
                'SequelizeQuotationRepository.dropQuotationsTable',
                error
            );
        }
    }
}



