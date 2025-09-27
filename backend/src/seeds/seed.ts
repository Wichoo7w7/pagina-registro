import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { Role, RoleName } from '../entities/Role';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  await AppDataSource.initialize();
  try {
    const roleRepo = AppDataSource.getRepository(Role);
    const userRepo = AppDataSource.getRepository(User);

    // Crear roles si no existen
    const rolesToEnsure: { name: RoleName; description: string }[] = [
      { name: RoleName.ADMIN, description: 'Administrador del sistema' },
      { name: RoleName.STUDENT, description: 'Usuario estudiante' }
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
      const hashed = await bcrypt.hash(passwordPlain + pepper, 10);
      const adminRole = await roleRepo.findOneByOrFail({ name: RoleName.ADMIN });

      adminUser = userRepo.create({
        email: adminEmail,
        password: hashed,
        isVerified: true,
        roles: [adminRole]
      });
      await userRepo.save(adminUser);
      console.log('Usuario admin creado');
    } else {
      // Asegurar que tiene rol admin
      const adminRole = await roleRepo.findOneByOrFail({ name: RoleName.ADMIN });
      if (!adminUser.roles.some(r => r.id === adminRole.id)) {
        adminUser.roles.push(adminRole);
        await userRepo.save(adminUser);
        console.log('Rol admin asignado a usuario existente');
      }
    }
    console.log('Seed completado');
  } catch (err) {
    console.error('Error en seed', err);
  } finally {
    await AppDataSource.destroy();
  }
}

run();
