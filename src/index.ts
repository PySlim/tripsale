import createExpressApp from './frameworks/http/express';
import SequelizeClient from "./frameworks/database/sequelize";
import { Router } from "express";

import { ManageUsersUsecase } from "./app/user/usecases/user.usecase";
import { createUsersRouter } from "./app/user/http/user.router";
import { createRedisClient } from "./frameworks/database/redis";

import { SequelizeProviderRepository } from "./app/provider/repositories/provider.repository";
import { ManageProvidersUsecase } from "./app/provider/usecases/provider.usecase";
import { createProvidersRouter } from "./app/provider/http/provider.router";
import { SequelizeCategoryRepository } from "./app/category/repositories/category.repository";
import { ManageCategoriesUsecase } from "./app/category/usecases/category.usecase";
import { createCategoriesRouter } from "./app/category/http/category.router";
import { SequelizePlaceRepository } from "./app/place/repositories/place.repository";
import { ManagePlacesUsecase } from "./app/place/usecases/place.usecase";
import { createPlacesRouter } from "./app/place/http/place.router";
import { SequelizeVehicleRepository } from "./app/vehicle/repositories/vehicle.repository";
import { ManageVehiclesUsecase } from "./app/vehicle/usecases/vehicle.usecase";
import { createVehiclesRouter } from "./app/vehicle/http/vehicle.router";
import { SequelizeCoverageRepository } from "./app/coverage/repositories/coverage.repository";
import { ManageCoveragesUsecase } from "./app/coverage/usecases/coverage.usecase";
import { createCoveragesRouter } from "./app/coverage/http/coverage.router";
import { SequelizePriceRepository } from "./app/price/repositories/price.repository";

import { createPricesRouter } from "./app/price/http/price.router";
import { SequelizeQuotationRepository } from "./app/quotation/repositories/quotation.repository";
import { createQuotationsRouter } from "./app/quotation/http/quotation.router";

import { SequelizeUserRepository } from "./app/user/repositories/user.respository";
import { RedisUserCache } from "./app/user/repositories/user.redis.cahe";
import { ManagePricesUsecase } from "./app/price/usercases/price.usecase";
import { ManageQuotationsUsecase } from "./app/quotation/usercases/quotation.usecase";

interface AppDependencies {
    redisClient: ReturnType<typeof createRedisClient>;
    sequelizeClient: SequelizeClient;
    sequelizeUserRepository: SequelizeUserRepository;
    sequelizeProviderRepository: SequelizeProviderRepository;
    sequelizeCategoryRepository: SequelizeCategoryRepository;
    sequelizePlaceRepository: SequelizePlaceRepository;
    sequelizeVehicleRepository: SequelizeVehicleRepository;
    sequelizeCoverageRepository: SequelizeCoverageRepository;
    sequelizePriceRepository: SequelizePriceRepository;
    sequelizeQuotationRepository: SequelizeQuotationRepository;
}

// Función para intentar sincronizar con reintentos en caso de deadlock
async function syncModelWithRetry(model: any, retries = 3, delayMs = 1000) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            await model.sync({ alter: true }); // Puedes cambiar { alter: true } por { force: false } si no quieres perder datos.
            console.log(`${model.name} model synchronized successfully.`);
            break; // Salir del bucle si la sincronización es exitosa
        } catch (error) {
            if (error instanceof Error && error.message.includes('ER_LOCK_DEADLOCK') && attempt < retries - 1) {
                console.log(`Retrying synchronization of ${model.name} due to deadlock...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            } else if (error instanceof Error) {
                console.error(`Error synchronizing ${model.name}:`, error.message);
                throw error;
            } else {
                console.error('Unexpected error:', error);
                throw error;
            }
        }
    }
}





async function initializeDependencies(): Promise<AppDependencies> {
    try {
        const redisClient = await createRedisClient();
        const sequelizeClient = new SequelizeClient();
        await sequelizeClient.connectDatabase();

        // Inicializar los repositorios
        const sequelizeUserRepository = new SequelizeUserRepository(sequelizeClient);
        const sequelizeProviderRepository = new SequelizeProviderRepository(sequelizeClient);
        const sequelizeCategoryRepository = new SequelizeCategoryRepository(sequelizeClient);
        const sequelizePlaceRepository = new SequelizePlaceRepository(sequelizeClient);
        const sequelizeCoverageRepository = new SequelizeCoverageRepository(sequelizeClient);
        const sequelizePriceRepository = new SequelizePriceRepository(sequelizeClient);
        const sequelizeVehicleRepository = new SequelizeVehicleRepository(sequelizeClient);
        const sequelizeQuotationRepository = new SequelizeQuotationRepository(sequelizeClient);

        // Sincronizar los modelos con reintentos
        await syncModelWithRetry(sequelizeUserRepository.userModel);
        await syncModelWithRetry(sequelizeProviderRepository.providerModel);
        await syncModelWithRetry(sequelizeCategoryRepository.categoryModel);
        await syncModelWithRetry(sequelizePlaceRepository.placeModel);
        await syncModelWithRetry(sequelizeCoverageRepository.coverageModel);
        await syncModelWithRetry(sequelizePriceRepository.priceModel);
        await syncModelWithRetry(sequelizeVehicleRepository.vehicleModel);
        await syncModelWithRetry(sequelizeQuotationRepository.quotationModel);

        return {
            redisClient,
            sequelizeClient,
            sequelizeUserRepository,
            sequelizeProviderRepository,
            sequelizeCategoryRepository,
            sequelizePlaceRepository,
            sequelizeVehicleRepository,
            sequelizeQuotationRepository,
            sequelizeCoverageRepository,
            sequelizePriceRepository
        };
    } catch (error) {
        if (error instanceof Error) {
            console.error('Failed to initialize dependencies:', error.message);
        } else {
            console.error('Unexpected error initializing dependencies:', error);
        }
        throw error;
    }
}

async function createRouters(dependencies: AppDependencies): Promise<Router[]> {
    const {
        sequelizeUserRepository,
        sequelizeProviderRepository,
        sequelizeCategoryRepository,
        sequelizePlaceRepository,
        sequelizeVehicleRepository,
        sequelizeCoverageRepository,
        sequelizePriceRepository,
        sequelizeQuotationRepository,
        redisClient
    } = dependencies;

    const redisUserCache = new RedisUserCache(redisClient);

    // Casos de uso
    const manageUsersUsecase = new ManageUsersUsecase(sequelizeUserRepository, redisUserCache);
    const manageProvidersUsecase = new ManageProvidersUsecase(sequelizeProviderRepository);
    const manageCategoriesUsecase = new ManageCategoriesUsecase(sequelizeCategoryRepository);
    const managePlacesUsecase = new ManagePlacesUsecase(sequelizePlaceRepository);
    const manageVehiclesUsecase = new ManageVehiclesUsecase(sequelizeVehicleRepository);
    const manageCoveragesUsecase = new ManageCoveragesUsecase(sequelizeCoverageRepository);
    const managePricesUsecase = new ManagePricesUsecase(sequelizePriceRepository);
    const manageQuotationsUsecase = new ManageQuotationsUsecase(sequelizeQuotationRepository);

    return [
        createUsersRouter(manageUsersUsecase),
        createProvidersRouter(manageProvidersUsecase),
        createCategoriesRouter(manageCategoriesUsecase),
        createPlacesRouter(managePlacesUsecase),
        createVehiclesRouter(manageVehiclesUsecase),
        createCoveragesRouter(manageCoveragesUsecase),
        createPricesRouter(managePricesUsecase),
        createQuotationsRouter(manageQuotationsUsecase),
    ];
}

async function startServer(): Promise<void> {
    try {
        const dependencies = await initializeDependencies();
        const routers = await createRouters(dependencies);

        await createExpressApp(routers);

        console.log('Server started successfully');
    } catch (error) {
        if (error instanceof Error) {
            console.error('Failed to start server:', error.message);
        } else {
            console.error('Unexpected error starting server:', error);
        }
    }
}

(async () => {
    try {
        await startServer();
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error starting server:', error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
})();

