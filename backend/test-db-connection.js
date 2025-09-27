const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'app_db',
  });

  try {
    console.log('Intentando conectar a PostgreSQL...');
    await client.connect();
    console.log('✅ Conexión exitosa a PostgreSQL!');
    
    const result = await client.query('SELECT version()');
    console.log('🔍 Versión de PostgreSQL:', result.rows[0].version);
    
    await client.end();
    console.log('✅ Desconexión exitosa.');
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('📋 Detalles completos:', error);
  }
}

testConnection();