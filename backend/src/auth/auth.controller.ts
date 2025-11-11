import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('signup')
  async signup(@Body() body: { name?: string; email: string; password: string }) {
    if (!body?.email || !body?.password) return { ok: false, message: 'Missing fields' };
    try {
      const result = await this.auth.signup(body.name ?? null, body.email, body.password);
      return result;
    } catch (err) {
      console.error('Signup error', err);
      return { ok: false, message: 'Internal server error' };
    }
  }

  @Post('signin')
  async signin(@Body() body: { email: string; password: string }) {
    if (!body?.email || !body?.password) return { ok: false, message: 'Missing fields' };
    try {
      return await this.auth.signin(body.email, body.password);
    } catch (err) {
      console.error('Signin error', err);
      return { ok: false, message: 'Internal server error' };
    }
  }

  @Get('all')
  async all() {
    try {
      const rows = await this.auth.allUsers();
      return { ok: true, users: rows };
    } catch (err) {
      console.error('Get all users error', err);
      return { ok: false, message: 'Internal server error' };
    }
  }
}
