import 'reflect-metadata';
import { AppDataSource } from './data-source';

async function main() {
  try {
    await AppDataSource.initialize();
    console.log('DataSource inicializado');
    await AppDataSource.destroy();
  } catch (err) {
    console.error('Error iniciando DataSource', err);
    process.exit(1);
  }
}

main();
