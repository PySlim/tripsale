import swaggerJSDoc from 'swagger-jsdoc';
import { ConstantsModule } from '../../constants/constants';

import path from 'path';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Express API con TypeScript',
        version: '1.0.0',
        description: 'Esta es una API creada con Express y documentada con Swagger',
        contact: {
            name: 'Slim Josh Zegarra Soto',
            email: 'tigrinustradeperu@gmail.com',
        }
    },
    servers: [
        {
            url: `${ConstantsModule.PROTOCOL}${ConstantsModule.SERVER_HOST}:${ConstantsModule.PORT}`,
            description: 'Servidor de Desarrollo',
        },
    ],
};

const options = {
    swaggerDefinition,
    components: {
        securitySchema: {
            BearerAuth:{
                type:'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    apis: [path.resolve(__dirname, '../../app/**/*.ts')],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
