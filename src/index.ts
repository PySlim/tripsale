import createExpressApp from './frameworks/http/express';
import SequelizeClient from "./frameworks/database/sequelize";
import {Router} from "express";
import {SequelizeUserRepository} from "./app/user/repositories/user.respository";
import {ManageUsersUsecase} from "./app/user/usecases/user.usecase";
import {createUsersRouter} from "./app/user/http/user.router";
import {createRedisClient} from "./frameworks/database/redis";
import {RedisUserCache} from "./app/user/repositories/user.redis.cahe";
import {SequelizeProviderRepository} from "./app/provider/repositories/provider.repository";
import {ManageProvidersUsecase} from "./app/provider/usecases/provider.usecase";
import {createProvidersRouter} from "./app/provider/http/provider.router";
import {SequelizeCategoryRepository} from "./app/category/repositories/category.repository";
import {ManageCategoriesUsecase} from "./app/category/usecases/category.usecase";
import {createCategoriesRouter} from "./app/category/http/category.router";

interface AppDependencies {
    redisClient: ReturnType<typeof createRedisClient>;
    sequelizeClient: SequelizeClient;
    sequelizeUserRepository: SequelizeUserRepository;
    sequelizeProviderRepository: SequelizeProviderRepository;
    sequelizeCategoryRepository: SequelizeCategoryRepository;
}

async function initializeDependencies(): Promise<AppDependencies> {
    const redisClient = await createRedisClient();
    const sequelizeClient = new SequelizeClient();
    await sequelizeClient.connectDatabase();
    const sequelizeUserRepository = new SequelizeUserRepository(sequelizeClient);
    const sequelizeProviderRepository = new SequelizeProviderRepository(sequelizeClient);
    const sequelizeCategoryRepository = new SequelizeCategoryRepository(sequelizeClient);
    await sequelizeClient.syncDatabase();
    return {sequelizeClient, sequelizeUserRepository, sequelizeProviderRepository, sequelizeCategoryRepository, redisClient}
}

async function createRouters(dependencies: AppDependencies): Promise<Router[]> {
    const { sequelizeUserRepository, sequelizeProviderRepository, sequelizeCategoryRepository, redisClient } = dependencies;
    const redisUserCache = new RedisUserCache(redisClient);
    const manageUsersUsecase = new ManageUsersUsecase(sequelizeUserRepository, redisUserCache);
    const manageProvidersUsecase = new ManageProvidersUsecase(sequelizeProviderRepository);
    const manageCategoriesUsecase = new ManageCategoriesUsecase(sequelizeCategoryRepository);

    return [
        createUsersRouter(manageUsersUsecase),
        createProvidersRouter(manageProvidersUsecase),
        createCategoriesRouter(manageCategoriesUsecase),
    ];
}

async function startServer(): Promise<void> {
    try {
        const dependencies = await initializeDependencies();
        const routers = await createRouters(dependencies);

        await createExpressApp(routers);

        console.log('Server started successfully');
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

(async () => {
    try {
        await startServer();
    } catch (error) {
        console.error('Error starting server:', error);
    }
})();
