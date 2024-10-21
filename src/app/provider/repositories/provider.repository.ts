import { Model, DataTypes } from 'sequelize';
import { Provider } from "../entities/provider";
import { ProviderRepository } from "./repository.interface.provider";
import SequelizeClient from "../../../frameworks/database/sequelize";
import ExpressReviewsError from "../../../utils/error/types/expressReviewError";
import { ConstantsResponse } from "../../../enviroments_variables/constants";

interface ProviderAttributes extends Provider {}

function isProviderAttributes(obj: any): obj is ProviderAttributes {
    return typeof obj.id === 'number' &&
        typeof obj.name === 'string' &&
        typeof obj.code === 'string' &&
        typeof obj.active === 'boolean';
}

export class SequelizeProviderRepository implements ProviderRepository {
    private providerModel: ReturnType<typeof SequelizeClient.prototype.sequelize.define>;

    constructor(private sequelizeClient: SequelizeClient, test = false) {
        let tableName = "Providers";
        if (test) {
            tableName += "_test";
        }

        this.providerModel = this.sequelizeClient.sequelize.define<Model<ProviderAttributes>>('Provider', {
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
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            active: {
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
            await this.providerModel.sync({ alter: true });
            console.log(`Provider model synchronized successfully.`);
        } catch (error) {
            console.error(`Error synchronizing Provider model:`, error);
        }
    }

    async getProviders(): Promise<Provider[]> {
        try {
            const providers = await this.providerModel.findAll({
                raw: true
            });

            return providers.map(provider => {
                if (isProviderAttributes(provider)) {
                    return {
                        id: provider.id,
                        name: provider.name,
                        code: provider.code,
                        active: provider.active
                    };
                }
                throw new ExpressReviewsError('Invalid provider data returned from database', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeProviderRepository.getProviders');
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to get providers', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeProviderRepository.getProviders', error);
        }
    }

    async getProvider(id: number): Promise<Provider | null> {
        try {
            const provider = await this.providerModel.findByPk(id, {
                raw: true
            });

            if (provider && isProviderAttributes(provider)) {
                return {
                    id: provider.id,
                    name: provider.name,
                    code: provider.code,
                    active: provider.active
                };
            }
            return null;
        } catch (error) {
            throw new ExpressReviewsError('Failed to get provider', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeProviderRepository.getProvider', error);
        }
    }

    async createProvider(provider: Omit<Provider, 'id'>): Promise<number> {
        try {
            const createdProvider = await this.providerModel.create(provider);
            return createdProvider.get('id') as number;
        } catch (error) {
            throw new ExpressReviewsError('Failed to create provider', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeProviderRepository.createProvider', error);
        }
    }

    async updateProvider(provider: Provider): Promise<void> {
        try {
            await this.providerModel.update(provider, {
                where: { id: provider.id }
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to update provider', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeProviderRepository.updateProvider', error);
        }
    }

    async deleteProvider(id: number): Promise<void> {
        try {
            await this.providerModel.destroy({
                where: { id }
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to delete provider', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeProviderRepository.deleteProvider', error);
        }
    }

    async deleteAllProviders(): Promise<void> {
        try {
            if (this.providerModel.sequelize?.getDialect() === 'sqlite') {
                await this.providerModel.destroy({ truncate: true, cascade: false });
            } else {
                await this.providerModel.destroy({ truncate: true });
            }
        } catch (error) {
            throw new ExpressReviewsError('Failed to delete all providers', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeProviderRepository.deleteAllProviders', error);
        }
    }

    async dropProvidersTable(): Promise<void> {
        try {
            await this.providerModel.drop();
        } catch (error) {
            throw new ExpressReviewsError('Failed to drop providers table', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeProviderRepository.dropProvidersTable', error);
        }
    }
}
