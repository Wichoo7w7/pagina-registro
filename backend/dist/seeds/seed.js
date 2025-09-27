"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("../data-source");
const Role_1 = require("../entities/Role");
const User_1 = require("../entities/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function run() {
    await data_source_1.AppDataSource.initialize();
    try {
        const roleRepo = data_source_1.AppDataSource.getRepository(Role_1.Role);
        const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
        // Crear roles si no existen
        const rolesToEnsure = [
            { name: Role_1.RoleName.ADMIN, description: 'Administrador del sistema' },
            { name: Role_1.RoleName.STUDENT, description: 'Usuario estudiante' }
        ];
        const existingRoles = await roleRepo.find();
        for (const r of rolesToEnsure) {
            if (!existingRoles.find(er => er.name === r.name)) {
                const newRole = roleRepo.create(r);
                await roleRepo.save(newRole);
                console.log(`Rol creado: ${r.name}`);
            }
        }
        // Usuario admin seed
        const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
        let adminUser = await userRepo.findOne({ where: { email: adminEmail }, relations: ['roles'] });
        if (!adminUser) {
            const passwordPlain = process.env.SEED_ADMIN_PASSWORD || 'AdminPassword123!';
            const pepper = process.env.PASSWORD_PEPPER || '';
            const hashed = await bcryptjs_1.default.hash(passwordPlain + pepper, 10);
            const adminRole = await roleRepo.findOneByOrFail({ name: Role_1.RoleName.ADMIN });
            adminUser = userRepo.create({
                email: adminEmail,
                password: hashed,
                isVerified: true,
                roles: [adminRole]
            });
            await userRepo.save(adminUser);
            console.log('Usuario admin creado');
        }
        else {
            // Asegurar que tiene rol admin
            const adminRole = await roleRepo.findOneByOrFail({ name: Role_1.RoleName.ADMIN });
            if (!adminUser.roles.some(r => r.id === adminRole.id)) {
                adminUser.roles.push(adminRole);
                await userRepo.save(adminUser);
                console.log('Rol admin asignado a usuario existente');
            }
        }
        console.log('Seed completado');
    }
    catch (err) {
        console.error('Error en seed', err);
    }
    finally {
        await data_source_1.AppDataSource.destroy();
    }
}
run();
