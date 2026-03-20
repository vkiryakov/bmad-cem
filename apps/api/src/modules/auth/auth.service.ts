import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ErrorCode } from '@bmad-cem/shared';
import { User } from './entities/user.entity';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    login: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.userRepo.findOne({ where: { login } });
    if (!user) {
      throw new BusinessException(
        401,
        'Invalid credentials',
        ErrorCode.AUTH_INVALID_CREDENTIALS,
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new BusinessException(
        401,
        'Invalid credentials',
        ErrorCode.AUTH_INVALID_CREDENTIALS,
      );
    }

    return this.generateToken(user);
  }

  generateToken(user: User): { accessToken: string } {
    const payload = { sub: user.id, login: user.login };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
