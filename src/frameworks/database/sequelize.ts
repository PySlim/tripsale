import { Sequelize, Options } from 'sequelize';
import { getEnvVar } from '../../utils/environment/captureVariables/get.var.env';

class SequelizeClient {
    public sequelize: Sequelize;

    constructor() {
        const dialect = getEnvVar('DB_DIALECT') as 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql';
        const username = getEnvVar('DB_USER');
        const password = getEnvVar('DB_PASS');
        const database = getEnvVar('DB_NAME');
        const host = getEnvVar('DB_HOST');
        const port = parseInt(getEnvVar('DB_PORT'), 10);

        const options: Options = {
            host,
            port,
            dialect,
            logging: console.log, // Set to console.log to see the raw SQL queries
        };

        this.sequelize = new Sequelize(database, username, password, options);
    }

    public async connectDatabase(): Promise<void> {
        try {
            await this.sequelize.authenticate();
            console.log('Database connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
            throw error;
        }
    }

    public async syncDatabase(): Promise<void> {
        try {
            await this.sequelize.sync({ alter: true, force: false });
            console.log('Database synced successfully.');
        } catch (error) {
            console.error("Couldn't sync database", error);
            throw error;
        }
    }
}

export default SequelizeClient;
