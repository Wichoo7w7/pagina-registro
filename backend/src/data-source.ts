import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { StudentProfile } from './entities/StudentProfile';
import { Role } from './entities/Role';
import { Payment } from './entities/Payment';
import { Workshop } from './entities/Workshop';
import { Enrollment } from './entities/Enrollment';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'app_db',
  entities: [User, StudentProfile, Role, Payment, Workshop, Enrollment],
  migrations: ['src/migrations/*.ts'],
  logging: true,
  synchronize: false,
});
