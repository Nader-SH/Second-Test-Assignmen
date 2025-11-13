import { sequelize } from '../db/sequelize';

async function checkTables(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\nTables in database:');
    console.log('==================');
    (results as Array<{ table_name: string }>).forEach((row) => {
      console.log(`- ${row.table_name}`);
    });

    // Check if tables exist
    const tables = (results as Array<{ table_name: string }>).map((row) => row.table_name);
    const requiredTables = ['users', 'posts', 'comments'];

    console.log('\nRequired tables check:');
    console.log('====================');
    requiredTables.forEach((table) => {
      const exists = tables.includes(table);
      console.log(`${exists ? '✓' : '✗'} ${table} - ${exists ? 'EXISTS' : 'MISSING'}`);
    });

    // Get row counts
    console.log('\nRow counts:');
    console.log('===========');
    for (const table of requiredTables) {
      if (tables.includes(table)) {
        const [countResults] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = (countResults as Array<{ count: string }>)[0]?.count || '0';
        console.log(`${table}: ${count} rows`);
      }
    }
  } catch (error) {
    console.error('Failed to check tables:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

checkTables()
  .then(() => {
    console.log('\n✓ Database check completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Database check failed:', error);
    process.exit(1);
  });

