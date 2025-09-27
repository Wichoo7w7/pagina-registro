"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
async function bootstrap() {
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
        app.setGlobalPrefix('api');
        app.enableCors({
            origin: true,
            credentials: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        });
        // Rate limiting guard global
        app.useGlobalGuards(app.get(throttler_1.ThrottlerGuard));
        const config = app.get(config_1.ConfigService);
        const port = config.get('PORT') || 3000;
        await app.listen(port);
        console.log(`API escuchando en puerto ${port}`);
        // Graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('SIGTERM received, closing server gracefully...');
            await app.close();
            process.exit(0);
        });
        process.on('SIGINT', async () => {
            console.log('SIGINT received, closing server gracefully...');
            await app.close();
            process.exit(0);
        });
    }
    catch (error) {
        console.error('Error starting application:', error);
        process.exit(1);
    }
}
bootstrap().catch((error) => {
    console.error('Bootstrap failed:', error);
    process.exit(1);
});
