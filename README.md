- Creacion de archivos de migración

```bash
docker-compose -f develop.yml run --rm node npm run migrate create -- --name initial_migrations.ts --folder src/database/migrations
```
- Correr las migraciones

```bash
docker-compose -f develop.yml run --rm node npm run migrate up
```
