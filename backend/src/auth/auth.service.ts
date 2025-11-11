import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/db';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private db: DatabaseService) {}

  private hashPassword(password: string, salt?: string) {
    salt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString('hex');
    return { salt, hash };
  }

  private generateToken(payload: object) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const secret = process.env.APP_SECRET || 'dev_secret_change_me';
    const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${signature}`;
  }
async signup(name: string | null, email: string, password: string) {
  const exists = await this.db.query('SELECT id FROM user_tab WHERE email=$1', [email]);

  if ((exists?.rowCount ?? 0) > 0) {
    return { ok: false, message: 'Email already exists' };
  }

  const { salt, hash } = this.hashPassword(password);
  const res = await this.db.query(
    'INSERT INTO user_tab (name, email, password_hash, salt) VALUES ($1,$2,$3,$4) RETURNING id,name,email,created_at',
    [name, email, hash, salt]
  );
  return { ok: true, user: res.rows[0] };
}


  async signin(email: string, password: string) {
    const res = await this.db.query('SELECT id,email,password_hash,salt FROM user_tab WHERE email=$1', [email]);
    if (res.rowCount === 0) return { ok: false, message: 'Invalid credentials' };

    const user = res.rows[0];
    const { hash } = this.hashPassword(password, user.salt);
    if (hash !== user.password_hash) return { ok: false, message: 'Invalid credentials' };

    const token = this.generateToken({ sub: user.id, email: user.email, iat: Date.now() });
    return { ok: true, token };
  }

  async allUsers() {
    const res = await this.db.query('SELECT id,name,email,created_at FROM user_tab ORDER BY id DESC');
    return res.rows;
  }
}
