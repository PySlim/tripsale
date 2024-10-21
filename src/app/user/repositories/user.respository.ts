import { Model, DataTypes } from 'sequelize';
import { User } from "../entities/user";
import { UserRepository } from "./repository.interface.user";
import SequelizeClient from "../../../frameworks/database/sequelize";
import ExpressReviewsError from "../../../utils/error/types/expressReviewError";
import { ConstantsResponse } from "../../../enviroments_variables/constants";

interface UserAttributes extends User {}

function isUserAttributes(obj: any): obj is UserAttributes {
    return typeof obj.id === 'number' &&
        typeof obj.firstName === 'string' &&
        typeof obj.secondName === 'string' &&
        typeof obj.document === 'number' &&
        typeof obj.email === 'string' &&
        typeof obj.password === 'string';
}

export class SequelizeUserRepository implements UserRepository {
    private userModel: ReturnType<typeof SequelizeClient.prototype.sequelize.define>;

    constructor(private sequelizeClient: SequelizeClient, test = false) {
        let tableName = "Users";
        if (test) {
            tableName += "_test";
        }

        this.userModel = this.sequelizeClient.sequelize.define<Model<UserAttributes>>('User', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            secondName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            document: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        }, {
            tableName: tableName,
            timestamps: false,
        });
        this.syncModel();
    }

    private async syncModel() {
        try {
            await this.userModel.sync({ alter: true });
            console.log(`User model synchronized successfully.`);
        } catch (error) {
            console.error(`Error synchronizing User model:`, error);
        }
    }

    async getUsers(): Promise<User[]> {
        try {
            const users = await this.userModel.findAll({
                raw: true,
                attributes: ['id', 'firstName', 'secondName', 'document', 'email']
            });

            return users.map(user => {
                if (isUserAttributes(user)) {
                    return {
                        id: user.id,
                        firstName: user.firstName,
                        secondName: user.secondName,
                        document: user.document,
                        email: user.email,
                        password: user.password
                    };
                }
                throw new ExpressReviewsError('Invalid user data returned from database', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeUserRepository.getUsers');
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to get users', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeUserRepository.getUsers', error);
        }
    }

    async getUser(id: number): Promise<User | null> {
        try {
            const user = await this.userModel.findByPk(id, {
                raw: true,
                attributes: ['id', 'firstName', 'secondName', 'document', 'email']
            });

            if (user && isUserAttributes(user)) {
                return {
                    id: user.id,
                    firstName: user.firstName,
                    secondName: user.secondName,
                    document: user.document,
                    email: user.email,
                    password: user.password
                };
            }
            return null;
        } catch (error) {
            throw new ExpressReviewsError('Failed to get user', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeUserRepository.getUser', error);
        }
    }

    async createUser(user: Omit<User, 'id'>): Promise<number> {
        try {
            const createdUser = await this.userModel.create(user);
            return createdUser.get('id') as number;
        } catch (error) {
            throw new ExpressReviewsError('Failed to create user', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeUserRepository.createUser', error);
        }
    }

    async updateUser(user: User): Promise<void> {
        try {
            await this.userModel.update(user, {
                where: { id: user.id }
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to update user', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeUserRepository.updateUser', error);
        }
    }

    async deleteUser(id: number): Promise<void> {
        try {
            await this.userModel.destroy({
                where: { id }
            });
        } catch (error) {
            throw new ExpressReviewsError('Failed to delete user', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeUserRepository.deleteUser', error);
        }
    }

    async deleteAllUsers(): Promise<void> {
        try {
            if (this.userModel.sequelize?.getDialect() === 'sqlite') {
                await this.userModel.destroy({ truncate: true, cascade: false });
            } else {
                await this.userModel.destroy({ truncate: true });
            }
        } catch (error) {
            throw new ExpressReviewsError('Failed to delete all users', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeUserRepository.deleteAllUsers', error);
        }
    }

    async dropUsersTable(): Promise<void> {
        try {
            await this.userModel.drop();
        } catch (error) {
            throw new ExpressReviewsError('Failed to drop users table', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeUserRepository.dropUsersTable', error);
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            const user = await this.userModel.findOne({
                where: { email },
                raw: true,
                attributes: ['id', 'firstName', 'secondName', 'document', 'email', 'password']
            });

            if (user && isUserAttributes(user)) {
                return {
                    id: user.id,
                    firstName: user.firstName,
                    secondName: user.secondName,
                    document: user.document,
                    email: user.email,
                    password: user.password
                };
            }
            return null;
        } catch (error) {
            throw new ExpressReviewsError('Failed to get user by email', ConstantsResponse.INTERNAL_SERVER_ERROR, 'DatabaseError', 'SequelizeUserRepository.getUserByEmail', error);
        }
    }
}
