import express, { Express, Router, NextFunction, Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from "../../resources/swagger/swagger";
import {HandlerError} from "../../utils/error/handler/handlerError";
import {ConstantsModule} from "../../enviroments_variables/constants";



async function createExpressApp(routers: Router[]): Promise<Express> {
    const app: Express = express();

    // Configuraciones básicas
    app.use(express.json());

    // Configuración de CORS
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
    const corsOptions: CorsOptions =  {
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    };
    app.use(cors(corsOptions));

    // Configuración de Swagger
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Usar rutas recibidas
    for (const router of routers) {
        app.use(router);
    }

    // Manejador de errores global
    app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
        HandlerError(error, req, res, next);
    });

    // Iniciar el servidor
    const port: number = ConstantsModule.PORT ;
    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });

    return app;
}

export default createExpressApp;
