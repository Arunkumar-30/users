import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private pool: Pool;

  async onModuleInit() {
    const connectionString = process.env.DATABASE_URL ??
      `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'root'}@${process.env.PGHOST || 'db'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'users'}`;

    this.pool = new Pool({ connectionString });

    // retry loop until DB is ready
    const maxAttempts = 12;
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        await this.pool.query('SELECT 1');
        console.log('✅ Connected to Postgres');
        break;
      } catch (err) {
        attempts++;
        console.log(`⏳ Postgres not ready (attempt ${attempts}/${maxAttempts}) — retrying in 2s`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    // ensure table exists (defensive; init.sql also runs on first boot)
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS user_tab (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100),
          email VARCHAR(150) UNIQUE NOT NULL,
          password_hash VARCHAR(256) NOT NULL,
          salt VARCHAR(64) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `);
      console.log('✅ user_tab verified/created');
    } catch (err) {
      console.error('❌ Error ensuring user_tab:', err);
    }
  }

  query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }
}
