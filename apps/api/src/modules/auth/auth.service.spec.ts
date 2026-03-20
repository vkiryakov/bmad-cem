import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ErrorCode } from '@bmad-cem/shared';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepo: {
    findOne: jest.Mock;
  };
  let mockJwtService: {
    sign: jest.Mock;
  };

  beforeEach(async () => {
    mockUserRepo = { findOne: jest.fn() };
    mockJwtService = { sign: jest.fn().mockReturnValue('test-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should return accessToken for valid credentials', async () => {
    const hash = await bcrypt.hash('123', 10);
    mockUserRepo.findOne.mockResolvedValue({
      id: 1,
      login: 'admin',
      passwordHash: hash,
    });

    const result = await service.validateUser('admin', '123');
    expect(result).toEqual({ accessToken: 'test-token' });
    expect(mockJwtService.sign).toHaveBeenCalledWith({
      sub: 1,
      login: 'admin',
    });
  });

  it('should throw BusinessException for wrong password', async () => {
    const hash = await bcrypt.hash('123', 10);
    mockUserRepo.findOne.mockResolvedValue({
      id: 1,
      login: 'admin',
      passwordHash: hash,
    });

    await expect(service.validateUser('admin', 'wrong')).rejects.toThrow(
      BusinessException,
    );

    try {
      await service.validateUser('admin', 'wrong');
    } catch (e) {
      expect((e as BusinessException).getStatus()).toBe(401);
    }
  });

  it('should throw BusinessException for non-existent user', async () => {
    mockUserRepo.findOne.mockResolvedValue(null);

    await expect(service.validateUser('unknown', '123')).rejects.toThrow(
      BusinessException,
    );
  });
});
