import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

@Controller('profile')
export class ProfileController {
  @Get()
  async me(@Headers('authorization') auth?: string) {
    if (!auth) throw new UnauthorizedException('Missing Authorization header');
    const url = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    const res = await axios.get(`${url}/api/v1/auth/profile`, { headers: { authorization: auth } });
    return res.data;
  }
}


