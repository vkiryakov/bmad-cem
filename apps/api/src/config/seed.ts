import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../modules/auth/entities/user.entity';

export async function seedDefaultUser(
  userRepo: Repository<User>,
): Promise<void> {
  const count = await userRepo.count();
  if (count > 0) return;

  const user = userRepo.create({
    login: 'admin',
    passwordHash: await bcrypt.hash('123', 10),
  });
  await userRepo.save(user);
}
