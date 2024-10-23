# TripSale

TripSale es una plataforma de venta de viajes que utiliza Node.js y Sequelize para manejar las operaciones de backend. La aplicación implementa la inyección de dependencias para promover un código limpio y mantenible. También se usa Swagger para la documentación de la API y Docker para facilitar el despliegue en entornos de desarrollo y producción.

## Requisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- Docker
- Docker Compose

## Configuración del Entorno

Las variables de entorno están organizadas en archivos separados para desarrollo y producción. Estas se encuentran en la carpeta `.envs`.

Ejemplo de archivo `.env` para desarrollo:

```
NODE_ENV=development
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=trip
PORT=5500
```

### Estructura del Proyecto

```bash
├── compose/
│   ├── develop/
│   └── nginx/
├── src/
│   ├── app/
│   ├── entities/
│   ├── frameworks/
│   ├── utils/
├── .envs/
├── docker-compose.yml
├── README.md
```

## Desarrollo

### Iniciar el entorno de desarrollo

Usa el siguiente comando para construir e iniciar los contenedores en modo desarrollo:

```bash
docker-compose -f develop.yml up --build
```

Esto iniciará los servicios de `node`, `mysql`, y `redis`.

### Endpoints y Documentación

La documentación de la API está generada automáticamente usando Swagger. Puedes acceder a la documentación en:

```
http://localhost:5500/api-docs
```

### Acceso al Contenedor de Node

Si deseas acceder al contenedor de Node.js para ejecutar comandos manualmente, puedes usar:

```bash
docker exec -it backend /bin/bash
```

## Producción

### Preparación para Producción

Para producción, Nginx se utiliza como proxy inverso para manejar las peticiones HTTP y HTTPS. El servicio `nginx` está incluido en el archivo `docker-compose.yml` de producción.

### Comandos de Producción

Para construir e iniciar los contenedores en modo producción:

```bash
docker-compose -f production.yml up --build
```

Esto iniciará los servicios de `node`, `postgres`, y `nginx`. Asegúrate de que tus variables de entorno de producción estén correctamente configuradas.

### Configuración de Nginx

Nginx se utiliza para:

- Manejar las solicitudes HTTP y HTTPS.
- Redirigir el tráfico a la aplicación Node.js en el puerto 5500.
- Servir archivos estáticos y actuar como proxy inverso.

Ejemplo de configuración de Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://backend:5500;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Despliegue de Certificados SSL

Para habilitar HTTPS, puedes usar Let's Encrypt y configurar los certificados SSL en Nginx.

## Buenas Prácticas de Desarrollo

- **Clean Code**: Se promueve el uso de Clean Code con buenas prácticas de organización de código, siguiendo principios SOLID y patrones de diseño.

- **Inyección de Dependencias**: El sistema está diseñado con inyección de dependencias, lo que facilita la prueba y mantenibilidad del código.

## Pruebas

Las pruebas pueden ser ejecutadas utilizando herramientas como Jest o Mocha. Para configurar las pruebas, añade el siguiente script en tu `package.json`:

```json
"scripts": {
  "test": "jest"
}
```

Para ejecutar las pruebas:

```bash
npm test
```

## Licencia

Este proyecto está licenciado bajo la [MIT License](LICENSE).
