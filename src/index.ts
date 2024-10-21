
import createExpressApp from './frameworks/http/express';
import SequelizeClient from "./frameworks/database/sequelize";
import {Router} from "express";
import {SequelizeUserRepository} from "./app/user/repositories/user.respository";
import {ManageUsersUsecase} from "./app/user/usecases/user.usecase";
import {createUsersRouter} from "./app/user/http/user.router";
import {createRedisClient} from "./frameworks/database/redis";
import {RedisUserCache} from "./app/user/repositories/user.redis.cahe";

/*import { createFirestoreClient, FirestoreClient } from './frameworks/db/firestore';
import { createRedisClient, RedisClient } from './frameworks/db/redis';

import { createGreetingRouter } from './greeting/http/greeting-router';
import { GreetingUsecase } from './greeting/usecases/greeting-usecase';
import { RedisGreetingCache } from './greeting/repositories/redis-greeting-cache';
import { createBooksRouter } from './books/http/books-router';
import { ManageBooksUsecase } from './books/usecases/manage-books-usecase';
import { FirestoreBooksRepository } from './books/repositories/firestore-books-repository';
import { SequelizeBooksRepository } from './books/repositories/sequelize-books-repository';*/

interface AppDependencies {
    redisClient: ReturnType<typeof createRedisClient>;
    //firestoreClient: FirestoreClient;
    sequelizeClient: SequelizeClient;
    sequelizeUserRepository: SequelizeUserRepository;
}

async function initializeDependencies(): Promise<AppDependencies> {
    const redisClient = await createRedisClient();
    //const firestoreClient = await createFirestoreClient();
    const sequelizeClient = new SequelizeClient();
    await sequelizeClient.connectDatabase();
    const sequelizeUserRepository = new SequelizeUserRepository(sequelizeClient);
    await sequelizeClient.syncDatabase();

   // return { redisClient, firestoreClient, sequelizeClient };
    return {sequelizeClient, sequelizeUserRepository, redisClient}
}

async function createRouters(dependencies: AppDependencies): Promise<Router[]> {
    //const { redisClient, firestoreClient, sequelizeClient } = dependencies;
    const { sequelizeUserRepository, redisClient } = dependencies;
    //const redisGreetingCache = new RedisGreetingCache(redisClient);
    //const firestoreBooksRepository = new FirestoreBooksRepository(firestoreClient);

    //const greetingUsecase = new GreetingUsecase(redisGreetingCache);
    const redisUserCache = new RedisUserCache(redisClient);
    const manageBooksUsecase = new ManageUsersUsecase(sequelizeUserRepository, redisUserCache);
    // Alternatively: const manageBooksUsecase = new ManageBooksUsecase(firestoreBooksRepository);

    return [
        //createGreetingRouter(greetingUsecase),
        createUsersRouter(manageBooksUsecase),
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
