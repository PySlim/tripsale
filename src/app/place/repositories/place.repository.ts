import { Model, DataTypes } from 'sequelize';
import { Place, PlaceSchema } from "../entities/place";
import { PlaceRepository } from "./repository.interface.place";
import SequelizeClient from "../../../frameworks/database/sequelize";
import ExpressReviewsError from "../../../utils/error/types/expressReviewError";
import { ConstantsResponse } from "../../../enviroments_variables/constants";

interface PlaceAttributes extends Place {}

function isPlaceAttributes(obj: any): obj is PlaceAttributes {
    return typeof obj.id === 'number' &&
        typeof obj.name === 'string' &&
        typeof obj.code === 'string' &&
        ['ORIGIN', 'DESTINATION', 'BOTH'].includes(obj.type) &&
        (obj.latitude === undefined || typeof obj.latitude === 'number') &&
        (obj.longitude === undefined || typeof obj.longitude === 'number') &&
        typeof obj.isActive === 'boolean' &&
        (obj.description === undefined || typeof obj.description === 'string');
}

export class SequelizePlaceRepository implements PlaceRepository {
    private placeModel: ReturnType<typeof SequelizeClient.prototype.sequelize.define>;

    constructor(private sequelizeClient: SequelizeClient, test = false) {
        let tableName = "Places";
        if (test) {
            tableName += "_test";
        }

        this.placeModel = this.sequelizeClient.sequelize.define<Model<PlaceAttributes>>('Place', {
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
            type: {
                type: DataTypes.ENUM('ORIGIN', 'DESTINATION', 'BOTH'),
                allowNull: false,
            },
            latitude: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            longitude: {
                type: DataTypes.FLOAT,
                allowNull: true,
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
        }, {
            tableName: tableName,
            timestamps: false,
        });
        this.syncModel();
    }

    private async syncModel() {
        try {
            await this.placeModel.sync({ alter: true });
            console.log(`Place model synchronized successfully.`);
        } catch (error) {
            console.error(`Error synchronizing Place model:`, error);
        }
    }

    async getPlaces(): Promise<Place[]> {
        try {
            const places = await this.placeModel.findAll({ raw: true });
            return places.map(place => {
                if (isPlaceAttributes(place)) {
                    return place;
                }
                throw new ExpressReviewsError('Invalid place data returned from database', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePlaceRepository.getPlaces');
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to get places', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePlaceRepository.getPlaces', error);
        }
    }

    async getPlace(id: number): Promise<Place | null> {
        try {
            const place = await this.placeModel.findByPk(id, { raw: true });
            if (place && isPlaceAttributes(place)) {
                return place;
            }
            return null;
        } catch (error) {
            throw new ExpressReviewsError('Failed to get place', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePlaceRepository.getPlace', error);
        }
    }

    async createPlace(place: Omit<Place, 'id'>): Promise<number> {
        try {
            const createdPlace = await this.placeModel.create(place);
            return createdPlace.get('id') as number;
        } catch (error) {
            throw new ExpressReviewsError('Failed to create place', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePlaceRepository.createPlace', error);
        }
    }

    async updatePlace(place: Place): Promise<void> {
        try {
            await this.placeModel.update(place, {
                where: { id: place.id }
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to update place', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePlaceRepository.updatePlace', error);
        }
    }

    async deletePlace(id: number): Promise<void> {
        try {
            await this.placeModel.destroy({
                where: { id }
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to delete place', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePlaceRepository.deletePlace', error);
        }
    }

    async deleteAllPlaces(): Promise<void> {
        try {
            if (this.placeModel.sequelize?.getDialect() === 'sqlite') {
                await this.placeModel.destroy({ truncate: true, cascade: false });
            } else {
                await this.placeModel.destroy({ truncate: true });
            }
        } catch (error) {
            throw new ExpressReviewsError('Failed to delete all places', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePlaceRepository.deleteAllPlaces', error);
        }
    }

    async dropPlacesTable(): Promise<void> {
        try {
            await this.placeModel.drop();
        } catch (error) {
            throw new ExpressReviewsError('Failed to drop places table', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePlaceRepository.dropPlacesTable', error);
        }
    }

    async getPlacesByType(type: Place['type']): Promise<Place[]> {
        try {
            const places = await this.placeModel.findAll({
                where: { type },
                raw: true
            });
            return places.map(place => {
                if (isPlaceAttributes(place)) {
                    return place;
                }
                throw new ExpressReviewsError('Invalid place data returned from database', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePlaceRepository.getPlacesByType');
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to get places by type', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePlaceRepository.getPlacesByType', error);
        }
    }

    async getPlacesByActiveStatus(isActive: boolean): Promise<Place[]> {
        try {
            const places = await this.placeModel.findAll({
                where: { isActive },
                raw: true
            });
            return places.map(place => {
                if (isPlaceAttributes(place)) {
                    return place;
                }
                throw new ExpressReviewsError('Invalid place data returned from database', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePlaceRepository.getPlacesByActiveStatus');
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to get places by active status', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizePlaceRepository.getPlacesByActiveStatus', error);
        }
    }
}
