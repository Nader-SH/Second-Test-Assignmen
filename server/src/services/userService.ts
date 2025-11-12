import bcrypt from 'bcryptjs';
import { appConfig } from '../config';
import { AuthenticatedUser } from '../types';
import { User } from '../models/User';

export async function createUser(username: string, password: string): Promise<AuthenticatedUser> {
  const existing = await User.findOne({ where: { username } });
  if (existing) {
    throw new Error('Username is already taken.');
  }

  const passwordHash = await bcrypt.hash(password, appConfig.bcryptSaltRounds);

  const user = await User.create({
    username,
    passwordHash,
    role: 'registered'
  });

  return mapUser(user);
}

function mapUser(user: User): AuthenticatedUser {
  return {
    id: user.id,
    username: user.username,
    role: user.role
  };
}

export async function findUserByUsername(username: string): Promise<User | null> {
  return User.findOne({ where: { username } });
}

export async function verifyUserCredentials(
  username: string,
  password: string
): Promise<AuthenticatedUser | null> {
  const user = await findUserByUsername(username);
  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return mapUser(user);
}

