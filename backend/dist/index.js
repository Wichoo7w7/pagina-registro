"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("./data-source");
async function main() {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('DataSource inicializado');
        await data_source_1.AppDataSource.destroy();
    }
    catch (err) {
        console.error('Error iniciando DataSource', err);
        process.exit(1);
    }
}
main();
