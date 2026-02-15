
import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('Error: DATABASE_URL is required.');
    process.exit(1);
}

const client = new Client({
    connectionString: databaseUrl,
});

async function migrate() {
    console.log('🔄 Starting database migration...');

    try {
        await client.connect();

        const migrationPath = path.join(__dirname, '../supabase/migrations/20260215_initial_schema.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

        console.log('📜 Executing migration SQL...');
        await client.query(migrationSql);

        console.log('✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
