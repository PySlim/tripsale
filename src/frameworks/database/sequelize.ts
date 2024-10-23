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

    // En frameworks/database/sequelize.ts

    async syncDatabase(): Promise<void> {
        try {
            await this.sequelize.authenticate();
            console.log('Connection has been established successfully.');

            // Forzar sincronización secuencial
            await this.sequelize.sync({
                force: false, // Cambiar a true solo si quieres recrear las tablas
                alter: true,
                logging: console.log
            });

            console.log('All models were synchronized successfully.');
        } catch (error) {
            console.error('Unable to sync database:', error);
            throw error;
        }
    }
}

export default SequelizeClient;
