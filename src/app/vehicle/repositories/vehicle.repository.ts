import { Model, DataTypes } from 'sequelize';
import { Vehicle } from "../entities/vehicle";
import { VehicleRepository } from "./repository.interface.vehicle";
import SequelizeClient from "../../../frameworks/database/sequelize";
import ExpressReviewsError from "../../../utils/error/types/expressReviewError";
import { ConstantsResponse } from "../../../enviroments_variables/constants";

interface VehicleAttributes extends Vehicle {}

function isVehicleAttributes(obj: any): obj is VehicleAttributes {
    return typeof obj.id === 'number' &&
        typeof obj.name === 'string' &&
        typeof obj.code === 'string' &&
        typeof obj.capacity === 'number' &&
        typeof obj.isActive === 'boolean' &&
        (obj.description === undefined || typeof obj.description === 'string') &&
        typeof obj.providerId === 'number' &&
        typeof obj.categoryId === 'number';
}

export class SequelizeVehicleRepository implements VehicleRepository {
    private vehicleModel: ReturnType<typeof SequelizeClient.prototype.sequelize.define>;

    constructor(private sequelizeClient: SequelizeClient, test = false) {
        let tableName = "Vehicles";
        if (test) {
            tableName += "_test";
        }

        this.vehicleModel = this.sequelizeClient.sequelize.define<Model<VehicleAttributes>>('Vehicle', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            code: {
                type: DataTypes.STRING(10),
                allowNull: false,
                unique: true,
            },
            capacity: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            providerId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Providers',
                    key: 'id',
                },
            },
            categoryId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Categories',
                    key: 'id',
                },
            },
        }, {
            tableName: tableName,
            timestamps: false,
        });
        this.syncModel();
    }

    private async syncModel() {
        try {
            await this.vehicleModel.sync({ alter: true });
            console.log(`Vehicle model synchronized successfully.`);
        } catch (error) {
            console.error(`Error synchronizing Vehicle model:`, error);
        }
    }

    async getVehicles(): Promise<Vehicle[]> {
        try {
            const vehicles = await this.vehicleModel.findAll({ raw: true });
            return vehicles.map(vehicle => {
                if (isVehicleAttributes(vehicle)) {
                    return vehicle;
                }
                throw new ExpressReviewsError('Invalid vehicle data returned from database', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeVehicleRepository.getVehicles');
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to get vehicles', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeVehicleRepository.getVehicles', error);
        }
    }

    async getVehicle(id: number): Promise<Vehicle | null> {
        try {
            const vehicle = await this.vehicleModel.findByPk(id, { raw: true });
            if (vehicle && isVehicleAttributes(vehicle)) {
                return vehicle;
            }
            return null;
        } catch (error) {
            throw new ExpressReviewsError('Failed to get vehicle', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeVehicleRepository.getVehicle', error);
        }
    }

    async createVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<number> {
        try {
            const createdVehicle = await this.vehicleModel.create(vehicle);
            return createdVehicle.get('id') as number;
        } catch (error) {
            throw new ExpressReviewsError('Failed to create vehicle', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeVehicleRepository.createVehicle', error);
        }
    }

    async updateVehicle(vehicle: Vehicle): Promise<void> {
        try {
            await this.vehicleModel.update(vehicle, {
                where: { id: vehicle.id }
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to update vehicle', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeVehicleRepository.updateVehicle', error);
        }
    }

    async deleteVehicle(id: number): Promise<void> {
        try {
            await this.vehicleModel.destroy({
                where: { id }
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to delete vehicle', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeVehicleRepository.deleteVehicle', error);
        }
    }

    async getVehiclesByProvider(providerId: number): Promise<Vehicle[]> {
        try {
            const vehicles = await this.vehicleModel.findAll({
                where: { providerId },
                raw: true
            });
            return vehicles.map(vehicle => {
                if (isVehicleAttributes(vehicle)) {
                    return vehicle;
                }
                throw new ExpressReviewsError('Invalid vehicle data returned from database', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeVehicleRepository.getVehiclesByProvider');
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to get vehicles by provider', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeVehicleRepository.getVehiclesByProvider', error);
        }
    }

    async getVehiclesByCategory(categoryId: number): Promise<Vehicle[]> {
        try {
            const vehicles = await this.vehicleModel.findAll({
                where: { categoryId },
                raw: true
            });
            return vehicles.map(vehicle => {
                if (isVehicleAttributes(vehicle)) {
                    return vehicle;
                }
                throw new ExpressReviewsError('Invalid vehicle data returned from database', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeVehicleRepository.getVehiclesByCategory');
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to get vehicles by category', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeVehicleRepository.getVehiclesByCategory', error);
        }
    }

    async getVehiclesByActiveStatus(isActive: boolean): Promise<Vehicle[]> {
        try {
            const vehicles = await this.vehicleModel.findAll({
                where: { isActive },
                raw: true
            });
            return vehicles.map(vehicle => {
                if (isVehicleAttributes(vehicle)) {
                    return vehicle;
                }
                throw new ExpressReviewsError('Invalid vehicle data returned from database', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeVehicleRepository.getVehiclesByActiveStatus');
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to get vehicles by active status', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeVehicleRepository.getVehiclesByActiveStatus', error);
        }
    }

    async deleteAllVehicles(): Promise<void> {
        try {
            if (this.vehicleModel.sequelize?.getDialect() === 'sqlite') {
                await this.vehicleModel.destroy({ truncate: true, cascade: false });
            } else {
                await this.vehicleModel.destroy({ truncate: true });
            }
        } catch (error) {
            throw new ExpressReviewsError('Failed to delete all vehicles', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeVehicleRepository.deleteAllVehicles', error);
        }
    }

    async dropVehiclesTable(): Promise<void> {
        try {
            await this.vehicleModel.drop();
        } catch (error) {
            throw new ExpressReviewsError('Failed to drop vehicles table', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeVehicleRepository.dropVehiclesTable', error);
        }
    }
}
