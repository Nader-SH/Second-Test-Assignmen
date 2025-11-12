import { app } from './app';
import { appConfig } from './config';
import { initializeDatabase } from './db/init';

async function start(): Promise<void> {
  await initializeDatabase();

  app.listen(appConfig.port, () => {
    console.log(`Server is listening on http://localhost:${appConfig.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});

