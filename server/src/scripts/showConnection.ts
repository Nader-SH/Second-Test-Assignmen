import { appConfig } from '../config';

function maskUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Mask password
    if (parsed.password) {
      parsed.password = '***';
    }
    return parsed.toString();
  } catch {
    return url.substring(0, 50) + '...';
  }
}

console.log('=== DATABASE CONNECTION INFO ===\n');
console.log('Database URL:', maskUrl(appConfig.databaseUrl));
console.log('\nHost type:', appConfig.databaseUrl.includes('neon.tech') ? 'ONLINE (Neon Cloud)' : appConfig.databaseUrl.includes('localhost') ? 'LOCAL' : 'OTHER');
console.log('\nConnection details:');
const url = new URL(appConfig.databaseUrl);
console.log('- Host:', url.hostname);
console.log('- Port:', url.port || '5432 (default)');
console.log('- Database:', url.pathname.substring(1));
console.log('- SSL:', url.searchParams.get('sslmode') === 'require' ? 'Required (Online)' : 'Not required (Local)');

